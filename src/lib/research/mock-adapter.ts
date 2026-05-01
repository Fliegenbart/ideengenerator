import {
  coerceSignal,
  type ResearchAdapter,
  type ResearchRequest,
  type ResearchResult,
  type Signal,
  type SignalSource,
} from "./types";

type ProblemSeed = {
  label: string;
  pain: string;
  audience: string;
  entities: string[];
  workaround: string;
  wtp: string;
};

const SOURCE_WEIGHTS: Record<SignalSource, number> = {
  reddit: 0.72,
  hackernews: 0.8,
  youtube: 0.62,
  twitter: 0.55,
  github: 0.86,
  polymarket: 0.68,
  web: 0.7,
  reviews: 0.74,
};

const SOURCE_TEMPLATES: Array<{
  source: SignalSource;
  title: (problem: ProblemSeed) => string;
  text: (problem: ProblemSeed) => string;
  raw: (index: number) => Record<string, unknown>;
}> = [
  {
    source: "reddit",
    title: (problem) => `Anyone else stuck with ${problem.label}?`,
    text: (problem) =>
      `${problem.audience} keep saying ${problem.pain}. Current workaround: ${problem.workaround}. ${problem.wtp}`,
    raw: (index) => ({ upvotes: 84 + index * 9, comments: 18 + index * 3 }),
  },
  {
    source: "hackernews",
    title: (problem) => `Ask HN: better way to handle ${problem.label}?`,
    text: (problem) =>
      `Teams are comparing tools because ${problem.pain}. The repeated job is to ship the work without manual cleanup.`,
    raw: (index) => ({ points: 52 + index * 7, comments: 24 + index * 2 }),
  },
  {
    source: "github",
    title: (problem) => `Issue: ${problem.label} still requires manual steps`,
    text: (problem) =>
      `Open issues mention failed automation and brittle edge cases. Users want an API-first fix for ${problem.pain}.`,
    raw: (index) => ({ reactions: 15 + index * 2, comments: 11 + index }),
  },
  {
    source: "web",
    title: (problem) => `Recent guide traffic spikes around ${problem.label}`,
    text: (problem) =>
      `Search results and comparison pages show buyers looking for alternatives. ${problem.wtp}`,
    raw: (index) => ({ shares: 12 + index, backlinks: 4 + index }),
  },
  {
    source: "youtube",
    title: (problem) => `Creator rant: ${problem.label} wastes production time`,
    text: (problem) =>
      `Comments repeat the same complaint: ${problem.pain}. Many mention they would pay for a reliable shortcut.`,
    raw: (index) => ({ views: 2400 + index * 350, comments: 36 + index * 4 }),
  },
  {
    source: "twitter",
    title: (problem) => `Thread: ${problem.label} is becoming a workflow tax`,
    text: (problem) =>
      `${problem.audience} are sharing screenshots of manual fixes. The common workaround is ${problem.workaround}.`,
    raw: (index) => ({ reposts: 18 + index, likes: 95 + index * 11 }),
  },
  {
    source: "polymarket",
    title: (problem) => `Market chatter: budget moving toward ${problem.label}`,
    text: (problem) =>
      `Prediction discussions suggest this workflow is moving from curiosity to operational spend. ${problem.wtp}`,
    raw: (index) => ({ volume: 5000 + index * 800, comments: 8 + index }),
  },
];

const NICHE_PROBLEMS: Record<string, ProblemSeed[]> = {
  "ai video tools": [
    {
      label: "slow AI video exports",
      pain: "exports fail late, render queues are slow, and deadlines slip",
      audience: "short-form video creators and agency editors",
      entities: ["Runway", "CapCut", "Descript"],
      workaround: "rerunning exports in three tools and manually checking files",
      wtp: "Several users mention paying $49-$199 per month for reliability.",
    },
    {
      label: "inconsistent brand style across generated clips",
      pain: "teams cannot keep captions, colors, aspect ratios, and hooks consistent",
      audience: "creator teams and social media managers",
      entities: ["Canva", "TikTok", "YouTube Shorts"],
      workaround: "copying templates by hand for every clip",
      wtp: "Agencies say this blocks client volume and would fit a per-seat SaaS plan.",
    },
    {
      label: "hard-to-review AI edits",
      pain: "reviewers cannot see what changed between video versions",
      audience: "video agencies and marketing teams",
      entities: ["Frame.io", "Veed", "Premiere"],
      workaround: "timestamp comments in spreadsheets",
      wtp: "Teams mention billable time loss and approval delays.",
    },
    {
      label: "rights and source tracking for AI assets",
      pain: "creators do not know which clips, prompts, or music are safe to reuse",
      audience: "creator economy operators",
      entities: ["ElevenLabs", "Pika", "Runway"],
      workaround: "saving prompt notes in Notion",
      wtp: "Buyers ask for audit trails before using content in paid campaigns.",
    },
  ],
  "creator economy": [
    {
      label: "sponsor pipeline chaos",
      pain: "creators lose brand deals because replies, deliverables, and invoices live everywhere",
      audience: "newsletter writers and YouTubers",
      entities: ["ConvertKit", "Beehiiv", "Gmail"],
      workaround: "Airtable plus manual email reminders",
      wtp: "Creators with revenue mention paying a small monthly fee to avoid missed deals.",
    },
    {
      label: "content repurposing fatigue",
      pain: "turning one long post into platform-specific content still takes hours",
      audience: "solo creators and micro agencies",
      entities: ["LinkedIn", "X", "YouTube"],
      workaround: "copying drafts between AI chats and schedulers",
      wtp: "Agencies price this as a monthly service already.",
    },
    {
      label: "audience research blind spots",
      pain: "creators struggle to know which comments indicate product demand",
      audience: "education creators and paid community owners",
      entities: ["Discord", "Circle", "Reddit"],
      workaround: "tagging comments manually",
      wtp: "Paid community owners talk about revenue lost to vague offers.",
    },
    {
      label: "membership churn surprises",
      pain: "creators discover churn after subscribers already leave",
      audience: "membership and course creators",
      entities: ["Patreon", "Kajabi", "Stripe"],
      workaround: "monthly CSV exports",
      wtp: "Users ask for retention alerts tied to payment data.",
    },
  ],
  "solo founder productivity": [
    {
      label: "decision backlog",
      pain: "solo founders collect ideas but cannot decide what to build next",
      audience: "indie hackers and bootstrapped founders",
      entities: ["Notion", "Linear", "ChatGPT"],
      workaround: "large Notion boards with no scoring discipline",
      wtp: "Founders mention paying for tools that reduce wasted build weeks.",
    },
    {
      label: "context switching between build and sales",
      pain: "founders forget follow-ups when moving between code, support, and outreach",
      audience: "technical solo founders",
      entities: ["GitHub", "Gmail", "Stripe"],
      workaround: "calendar blocks and manual reminders",
      wtp: "Revenue-generating founders value saved sales time.",
    },
    {
      label: "validation evidence scattered across channels",
      pain: "signals from Reddit, calls, analytics, and support are never combined",
      audience: "pre-seed founders",
      entities: ["Reddit", "Google Sheets", "PostHog"],
      workaround: "copy-pasting notes into spreadsheets",
      wtp: "Many ask for a lightweight validation CRM under $30/month.",
    },
    {
      label: "weekly planning without reality checks",
      pain: "plans ignore energy, available hours, and runway",
      audience: "part-time founders",
      entities: ["Todoist", "Calendar", "Notion"],
      workaround: "Sunday planning rituals",
      wtp: "Part-time founders ask for cheaper tools than enterprise PM suites.",
    },
  ],
  "b2b compliance": [
    {
      label: "manual evidence collection",
      pain: "teams chase screenshots, owners, and timestamps every audit cycle",
      audience: "small B2B SaaS compliance teams",
      entities: ["Vanta", "Drata", "Google Drive"],
      workaround: "Slack reminders and spreadsheet trackers",
      wtp: "Compliance leads mention consultant spend and audit penalties.",
    },
    {
      label: "vendor security questionnaire overload",
      pain: "sales teams answer the same security questions repeatedly",
      audience: "B2B SaaS sales and security teams",
      entities: ["Trust Center", "Google Docs", "Salesforce"],
      workaround: "copy-pasting from old questionnaires",
      wtp: "Teams already buy security review tools or pay consultants.",
    },
    {
      label: "policy drift after certification",
      pain: "policies are approved once and then silently become stale",
      audience: "ops leads and compliance managers",
      entities: ["Confluence", "Notion", "Google Docs"],
      workaround: "quarterly manual reviews",
      wtp: "Audit owners mention willingness to pay for reminders with evidence.",
    },
    {
      label: "least-privilege access reviews",
      pain: "access reviews are too manual for small teams with many SaaS tools",
      audience: "security-conscious startups",
      entities: ["Okta", "Google Workspace", "GitHub"],
      workaround: "CSV exports and manager sign-off docs",
      wtp: "Buyers compare lightweight options below enterprise IAM pricing.",
    },
  ],
  "developer tools": [
    {
      label: "flaky CI triage",
      pain: "developers waste mornings finding whether a build failed from code or infrastructure",
      audience: "engineering teams and open-source maintainers",
      entities: ["GitHub Actions", "Vercel", "CircleCI"],
      workaround: "rerun jobs and search old logs manually",
      wtp: "Teams mention paying for fewer wasted engineer hours.",
    },
    {
      label: "SDK documentation drift",
      pain: "examples go stale when APIs change and users file repeat issues",
      audience: "API platform teams",
      entities: ["OpenAPI", "Mintlify", "GitHub"],
      workaround: "manual doc sweeps before releases",
      wtp: "Devrel teams already spend budget on docs platforms.",
    },
    {
      label: "local environment setup pain",
      pain: "new contributors cannot reproduce dev environments quickly",
      audience: "open-source maintainers and platform teams",
      entities: ["Docker", "Dev Containers", "Homebrew"],
      workaround: "long README setup sections",
      wtp: "Teams pay for onboarding speed and fewer support pings.",
    },
    {
      label: "API changelog fatigue",
      pain: "developers miss breaking changes across dependencies",
      audience: "backend teams and technical founders",
      entities: ["npm", "GitHub", "Slack"],
      workaround: "manual release-note scanning",
      wtp: "Teams ask for alerts tied to their actual code paths.",
    },
  ],
  "local service businesses": [
    {
      label: "missed lead follow-up",
      pain: "local businesses respond too slowly to web forms, missed calls, and DMs",
      audience: "home service owners",
      entities: ["Google Business Profile", "Facebook", "Yelp"],
      workaround: "phone notes and shared inboxes",
      wtp: "Owners talk about lost jobs worth hundreds of dollars.",
    },
    {
      label: "quote creation bottleneck",
      pain: "estimating and sending polished quotes takes too long after site visits",
      audience: "contractors and cleaning companies",
      entities: ["QuickBooks", "Jobber", "Square"],
      workaround: "spreadsheet calculators",
      wtp: "Businesses already pay monthly for scheduling and invoicing tools.",
    },
    {
      label: "review request inconsistency",
      pain: "happy customers are not asked for reviews at the right moment",
      audience: "local service businesses",
      entities: ["Google Reviews", "SMS", "CRM"],
      workaround: "manual texts after jobs",
      wtp: "Owners connect reviews directly to lead volume.",
    },
    {
      label: "technician scheduling gaps",
      pain: "last-minute cancellations leave crews underused",
      audience: "field service teams",
      entities: ["Calendly", "Jobber", "Google Calendar"],
      workaround: "dispatchers calling waitlists",
      wtp: "Teams mention paying if idle hours drop.",
    },
  ],
};

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProblems(topic: string) {
  const normalized = topic.toLowerCase();
  const key =
    Object.keys(NICHE_PROBLEMS).find((candidate) =>
      normalized.includes(candidate)
    ) ?? "solo founder productivity";

  return NICHE_PROBLEMS[key];
}

function engagementScore(source: SignalSource, raw: Record<string, unknown>) {
  const values = Object.values(raw).filter((value): value is number => typeof value === "number");
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(Math.min(100, total / 8));
}

function buildSignal(
  topic: string,
  problem: ProblemSeed,
  template: (typeof SOURCE_TEMPLATES)[number],
  index: number
): Signal {
  const rawEngagement = template.raw(index);

  return coerceSignal({
    id: `sig-${slug(topic)}-${slug(problem.label)}-${template.source}-${index}`,
    source: template.source,
    title: template.title(problem),
    text: template.text(problem),
    url: `https://signals.example/${template.source}/${slug(topic)}/${slug(problem.label)}-${index}`,
    author: template.source === "github" ? "maintainer" : "market-user",
    createdAt: daysAgo((index * 3 + problem.label.length) % 29),
    engagementScore: engagementScore(template.source, rawEngagement),
    rawEngagement,
    entities: problem.entities,
    sentiment: problem.pain.includes("cannot") || problem.pain.includes("fail") ? "negative" : "mixed",
    sourceReliability: SOURCE_WEIGHTS[template.source],
    metadata: {
      topic,
      problemLabel: problem.label,
      audience: problem.audience,
      workaround: problem.workaround,
      willingnessToPay: problem.wtp,
    },
  });
}

export class MockResearchAdapter implements ResearchAdapter {
  name = "mock";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    const startedAt = new Date();
    const problems = getProblems(request.topic);
    const allowedSources = new Set(request.sources);

    const signals = problems.flatMap((problem, problemIndex) =>
      SOURCE_TEMPLATES.filter((template) => allowedSources.has(template.source))
        .slice(0, 4)
        .map((template, templateIndex) =>
          buildSignal(request.topic, problem, template, problemIndex * 4 + templateIndex)
        )
    );

    return {
      id: `run-${slug(request.topic)}-${startedAt.getTime()}`,
      topic: request.topic,
      mode: "mock",
      startedAt,
      completedAt: new Date(),
      signals: signals.slice(0, request.limit),
      metadata: {
        days: request.days,
        sourceCount: request.sources.length,
        adapter: this.name,
      },
    };
  }
}
