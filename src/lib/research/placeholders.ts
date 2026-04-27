import { MockResearchAdapter } from "./mock-adapter";
import type { ResearchAdapter, ResearchRequest, ResearchResult, SignalSource } from "./types";

class SourceScopedMockAdapter implements ResearchAdapter {
  constructor(
    public name: string,
    private source: SignalSource
  ) {}

  async research(request: ResearchRequest): Promise<ResearchResult> {
    return new MockResearchAdapter().research({
      ...request,
      sources: [this.source],
      limit: Math.min(request.limit, 12),
    });
  }
}

export class WebSearchAdapter extends SourceScopedMockAdapter {
  constructor() {
    super("web-search-placeholder", "web");
  }
}

export class RedditAdapter extends SourceScopedMockAdapter {
  constructor() {
    super("reddit-placeholder", "reddit");
  }
}

export class HackerNewsAdapter extends SourceScopedMockAdapter {
  constructor() {
    super("hackernews-placeholder", "hackernews");
  }
}

export class GitHubIssuesAdapter extends SourceScopedMockAdapter {
  constructor() {
    super("github-issues-placeholder", "github");
  }
}
