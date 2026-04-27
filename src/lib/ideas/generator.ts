import type { FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import type { BusinessType, ProblemCluster } from "@/lib/research/types";

export type StartupIdea = {
  id: string;
  title: string;
  oneLiner: string;
  audience: string;
  problem: string;
  insight: string;
  solution: string;
  mvp: string[];
  monetization: string[];
  gtm: string[];
  competitors: string[];
  validationPlan: string[];
  risks: string[];
  whyNow: string;
  evidenceSignalIds: string[];
  businessModel: BusinessType;
  buildDifficulty: number;
  distributionChannels: string[];
  clusterId: string;
  uniqueAngle?: string;
  executionPlan7Day?: string[];
};

const MODEL_SEQUENCE: BusinessType[] = [
  "SaaS",
  "AI tool",
  "agency",
  "content",
  "marketplace",
  "mobile app",
  "local business",
];

const SOLUTION_ANGLES = [
  "with evidence-backed prioritization",
  "with done-for-you setup and templates",
  "with workflow monitoring and alerts",
  "with a lightweight AI copilot",
  "with niche-specific benchmarks",
  "with a community-driven validation loop",
];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleFrom(cluster: ProblemCluster, businessModel: BusinessType, index: number) {
  const nouns = ["Desk", "Radar", "Flow", "Pilot", "Loop", "Kit"];
  const keyword = cluster.keywords[0] ?? cluster.label.split(" ")[0] ?? "Signal";
  return `${keyword[0]?.toUpperCase() ?? "S"}${keyword.slice(1)} ${nouns[index % nouns.length]} ${businessModel === "agency" ? "Studio" : ""}`.trim();
}

function buildMvp(cluster: ProblemCluster, businessModel: BusinessType) {
  const shared = [
    `Import or capture signals related to ${cluster.problem}`,
    "Rank opportunities by pain, urgency, and willingness to pay",
    "Show evidence snippets next to every recommendation",
  ];

  if (businessModel === "agency") {
    return [
      "Manual intake form for the target niche",
      "Service checklist and weekly report template",
      "Semi-automated delivery dashboard",
    ];
  }

  if (businessModel === "content") {
    return [
      "Newsletter issue generator from current pain points",
      "Topic scoring board",
      "Sponsor-ready insight archive",
    ];
  }

  return shared;
}

function buildExecutionPlan(title: string) {
  return [
    `Day 1: Interview 3 target users about the exact ${title} problem.`,
    "Day 2: Build a one-page manual concierge workflow.",
    "Day 3: Collect 20 more source signals and add them to a score sheet.",
    "Day 4: Create a landing page with one concrete promise.",
    "Day 5: Post a validation question in two niche communities.",
    "Day 6: Run five cold emails with a specific pain statement.",
    "Day 7: Review replies, price sensitivity, and first pre-order intent.",
  ];
}

export function generateIdeasFromClusters(
  clusters: ProblemCluster[],
  founder?: FounderProfileInput,
  minimumIdeas = 10
): StartupIdea[] {
  if (clusters.length === 0) {
    return [];
  }

  const preferred = founder?.preferredBusinessModel;
  const models = preferred
    ? [preferred, ...MODEL_SEQUENCE.filter((model) => model !== preferred)]
    : MODEL_SEQUENCE;

  const ideas: StartupIdea[] = [];
  let cursor = 0;

  while (ideas.length < minimumIdeas || cursor < clusters.length) {
    const cluster = clusters[cursor % clusters.length];
    const businessModel = models[cursor % models.length];
    const angle = SOLUTION_ANGLES[cursor % SOLUTION_ANGLES.length];
    const title = titleFrom(cluster, businessModel, cursor);
    const solution =
      businessModel === "agency"
        ? `A productized service that fixes ${cluster.problem} for ${cluster.audience}`
        : `A ${businessModel.toLowerCase()} that detects, prioritizes, and reduces ${cluster.problem}`;

    ideas.push({
      id: `idea-${slug(cluster.id)}-${slug(businessModel)}-${cursor}`,
      title,
      oneLiner: `For ${cluster.audience} who struggle with ${cluster.problem}, build ${solution} that saves repeated manual work, differentiated ${angle}.`,
      audience: cluster.audience,
      problem: cluster.problem,
      insight: `${cluster.signalCount} recent signals point to recurring pain, with average engagement ${Math.round(
        cluster.averageEngagement
      )}.`,
      solution,
      mvp: buildMvp(cluster, businessModel),
      monetization:
        businessModel === "agency"
          ? ["Setup fee", "Monthly retainer", "Performance bonus for measurable savings"]
          : ["Free diagnostic", "$29-$199/month subscription", "Team plan for growing operators"],
      gtm: [
        `${cluster.audience} community posts`,
        "Founder-led outbound using evidence snippets",
        "Comparison content against current workaround",
      ],
      competitors: ["Spreadsheets", "Generic AI chat", "Manual consultants", "Existing workflow suites"],
      validationPlan: [
        "Ask 15 target users to rank this pain against their current priorities.",
        "Offer a concierge version before building software.",
        "Measure reply rate from a post using the strongest evidence quote.",
      ],
      risks: [
        "Pain may be urgent but not budget-owned.",
        "External platform access can limit automation.",
        "Generic AI tools may cover part of the workflow.",
      ],
      whyNow: "Recent AI adoption and tool fragmentation make manual workarounds more visible and expensive.",
      evidenceSignalIds: cluster.signalIds.slice(0, 8),
      businessModel,
      buildDifficulty: Math.min(
        95,
        Math.max(15, 35 + (businessModel === "marketplace" ? 35 : 0) + cluster.signalCount * 2)
      ),
      distributionChannels: ["Reddit", "Hacker News", "LinkedIn", "YouTube", "SEO"],
      clusterId: cluster.id,
      uniqueAngle: angle,
      executionPlan7Day: buildExecutionPlan(title),
    });

    cursor += 1;

    if (cursor > minimumIdeas * 2 && ideas.length >= minimumIdeas) {
      break;
    }
  }

  return ideas.slice(0, Math.max(minimumIdeas, clusters.length));
}
