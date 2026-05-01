import { MockResearchAdapter } from "./mock-adapter";
import {
  coerceSignal,
  type ResearchAdapter,
  type ResearchRequest,
  type ResearchResult,
  type Signal,
  type SignalSource,
} from "./types";

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sinceDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function reliabilityFor(source: SignalSource) {
  const values: Record<SignalSource, number> = {
    reddit: 0.72,
    hackernews: 0.82,
    youtube: 0.62,
    twitter: 0.58,
    github: 0.88,
    polymarket: 0.68,
    web: 0.7,
    reviews: 0.74,
  };

  return values[source];
}

function extractEntities(topic: string, text: string) {
  const words = `${topic} ${text}`
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9.+#-]/g, ""))
    .filter((word) => word.length > 2);

  return Array.from(new Set(words.filter((word) => /^[A-Z0-9]/.test(word)))).slice(0, 8);
}

function webRun(
  adapterName: string,
  request: ResearchRequest,
  signals: Signal[],
  metadata: Record<string, unknown> = {}
): ResearchResult {
  const startedAt = new Date();

  return {
    id: `run-${adapterName}-${slug(request.topic)}-${startedAt.getTime()}`,
    topic: request.topic,
    mode: "live",
    startedAt,
    completedAt: new Date(),
    signals: signals.slice(0, request.limit),
    metadata: {
      adapter: adapterName,
      days: request.days,
      ...metadata,
    },
  };
}

export class HackerNewsAdapter implements ResearchAdapter {
  name = "hackernews";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    const since = Math.floor(sinceDate(request.days).getTime() / 1000);
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", request.topic);
    url.searchParams.set("tags", "story");
    url.searchParams.set("numericFilters", `created_at_i>${since}`);
    url.searchParams.set("hitsPerPage", String(Math.min(request.limit, 30)));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hacker News search failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      hits?: Array<{
        objectID: string;
        title?: string;
        story_title?: string;
        url?: string;
        author?: string;
        created_at?: string;
        points?: number;
        num_comments?: number;
        _highlightResult?: Record<string, { value?: string }>;
      }>;
    };

    const signals = (payload.hits ?? [])
      .filter((hit) => hit.title || hit.story_title)
      .map((hit) => {
        const title = hit.title ?? hit.story_title ?? request.topic;
        const text = [
          title,
          `Discussion with ${hit.points ?? 0} points and ${hit.num_comments ?? 0} comments.`,
          "Look for repeated complaints, tool comparisons, and workaround language in the thread.",
        ].join(" ");

        return coerceSignal({
          id: `hn-${hit.objectID}`,
          source: "hackernews",
          title,
          text,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          author: hit.author ?? null,
          createdAt: hit.created_at ?? new Date(),
          engagementScore: Math.min(100, Math.round(((hit.points ?? 0) + (hit.num_comments ?? 0) * 2) / 4)),
          rawEngagement: {
            points: hit.points ?? 0,
            comments: hit.num_comments ?? 0,
            externalUrl: hit.url ?? null,
          },
          entities: extractEntities(request.topic, text),
          sentiment: "mixed",
          sourceReliability: reliabilityFor("hackernews"),
          metadata: {
            topic: request.topic,
            sourceUrl: hit.url ?? null,
          },
        });
      });

    return webRun(this.name, request, signals);
  }
}

export class GitHubIssuesAdapter implements ResearchAdapter {
  name = "github-issues";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    const since = sinceDate(request.days).toISOString().slice(0, 10);
    const url = new URL("https://api.github.com/search/issues");
    url.searchParams.set("q", `${request.topic} is:issue created:>=${since}`);
    url.searchParams.set("sort", "comments");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", String(Math.min(request.limit, 30)));

    const headers: HeadersInit = {
      accept: "application/vnd.github+json",
      "user-agent": "SignalIdeas MVP",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub issue search failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      items?: Array<{
        id: number;
        title: string;
        body?: string | null;
        html_url: string;
        user?: { login?: string };
        created_at: string;
        comments: number;
        reactions?: { total_count?: number };
        repository_url?: string;
      }>;
    };

    const signals = (payload.items ?? []).map((issue) => {
      const text = [issue.title, issue.body ?? ""].join(" ").slice(0, 900);

      return coerceSignal({
        id: `github-${issue.id}`,
        source: "github",
        title: issue.title,
        text: text || issue.title,
        url: issue.html_url,
        author: issue.user?.login ?? null,
        createdAt: issue.created_at,
        engagementScore: Math.min(
          100,
          Math.round((issue.comments * 3 + (issue.reactions?.total_count ?? 0) * 2) / 2)
        ),
        rawEngagement: {
          comments: issue.comments,
          reactions: issue.reactions?.total_count ?? 0,
        },
        entities: extractEntities(request.topic, text),
        sentiment: "negative",
        sourceReliability: reliabilityFor("github"),
        metadata: {
          topic: request.topic,
          repositoryUrl: issue.repository_url ?? null,
        },
      });
    });

    return webRun(this.name, request, signals);
  }
}

export class RedditAdapter implements ResearchAdapter {
  name = "reddit";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    const url = new URL("https://www.reddit.com/search.json");
    url.searchParams.set("q", request.topic);
    url.searchParams.set("sort", "new");
    url.searchParams.set("t", request.days <= 7 ? "week" : "month");
    url.searchParams.set("limit", String(Math.min(request.limit, 25)));

    const response = await fetch(url, {
      headers: {
        "user-agent": "SignalIdeas MVP",
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit search failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        children?: Array<{
          data?: {
            id: string;
            title: string;
            selftext?: string;
            permalink: string;
            author?: string;
            created_utc?: number;
            score?: number;
            num_comments?: number;
            subreddit?: string;
          };
        }>;
      };
    };

    const signals = (payload.data?.children ?? [])
      .map((child) => child.data)
      .filter((post): post is NonNullable<typeof post> => Boolean(post?.title))
      .map((post) => {
        const text = [post.title, post.selftext ?? ""].join(" ").slice(0, 900);

        return coerceSignal({
          id: `reddit-${post.id}`,
          source: "reddit",
          title: post.title,
          text: text || post.title,
          url: `https://www.reddit.com${post.permalink}`,
          author: post.author ?? null,
          createdAt: post.created_utc ? new Date(post.created_utc * 1000) : new Date(),
          engagementScore: Math.min(100, Math.round(((post.score ?? 0) + (post.num_comments ?? 0) * 3) / 5)),
          rawEngagement: {
            score: post.score ?? 0,
            comments: post.num_comments ?? 0,
          },
          entities: extractEntities(request.topic, text),
          sentiment: "mixed",
          sourceReliability: reliabilityFor("reddit"),
          metadata: {
            topic: request.topic,
            subreddit: post.subreddit ?? null,
          },
        });
      });

    return webRun(this.name, request, signals);
  }
}

export class WebSearchAdapter implements ResearchAdapter {
  name = "web-search";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    return new MockResearchAdapter().research({
      ...request,
      sources: ["web", "reviews"],
      limit: Math.min(request.limit, 12),
    });
  }
}

export class CompositeResearchAdapter implements ResearchAdapter {
  name = "composite-live";

  private adapters: Partial<Record<SignalSource, ResearchAdapter>> = {
    reddit: new RedditAdapter(),
    hackernews: new HackerNewsAdapter(),
    github: new GitHubIssuesAdapter(),
    web: new WebSearchAdapter(),
    reviews: new WebSearchAdapter(),
  };

  async research(request: ResearchRequest): Promise<ResearchResult> {
    const startedAt = new Date();
    const selectedAdapters = request.sources
      .map((source) => this.adapters[source])
      .filter((adapter): adapter is ResearchAdapter => Boolean(adapter));

    const results = await Promise.allSettled(
      selectedAdapters.map((adapter) =>
        adapter.research({
          ...request,
          limit: Math.max(8, Math.ceil(request.limit / Math.max(selectedAdapters.length, 1))),
        })
      )
    );

    const signals = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value.signals : []
    );

    const errors = results.flatMap((result, index) =>
      result.status === "rejected"
        ? [`${selectedAdapters[index]?.name ?? "adapter"}: ${String(result.reason)}`]
        : []
    );

    const deduped = Array.from(
      new Map(signals.map((signal) => [`${signal.source}:${signal.url}`, signal])).values()
    );

    if (deduped.length < Math.min(10, request.limit)) {
      const fallback = await new MockResearchAdapter().research({
        ...request,
        limit: request.limit - deduped.length,
      });
      deduped.push(...fallback.signals);
    }

    return {
      id: `run-live-${slug(request.topic)}-${startedAt.getTime()}`,
      topic: request.topic,
      mode: "live",
      startedAt,
      completedAt: new Date(),
      signals: deduped.slice(0, request.limit),
      metadata: {
        adapter: this.name,
        days: request.days,
        liveSources: selectedAdapters.map((adapter) => adapter.name),
        errors,
        fallbackUsed: deduped.some((signal) => signal.url.includes("signals.example")),
      },
    };
  }
}
