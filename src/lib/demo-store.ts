import { z } from "zod";
import { generateOpenAIIdeaPipeline } from "@/lib/ai/openai-idea-engine";
import { normalizeFounderProfileInput, type FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import { generateIdeasFromClusters, type StartupIdea } from "@/lib/ideas/generator";
import {
  refineIdeaContent,
  refinementActionSchema,
  type IdeaRefinementResult,
  type RefinementAction,
} from "@/lib/ideas/refinement";
import { clusterProblemSignals } from "@/lib/processing/clustering";
import { MockResearchAdapter } from "@/lib/research/mock-adapter";
import { CompositeResearchAdapter } from "@/lib/research/placeholders";
import {
  businessTypeSchema,
  researchRequestSchema,
  type ProblemCluster,
  type ResearchRequest,
  type Signal,
  type SignalSource,
} from "@/lib/research/types";
import { scoreIdea, type IdeaScore } from "@/lib/scoring/scoring-engine";

export const createResearchRunInputSchema = researchRequestSchema.extend({
  interests: z.union([z.string(), z.array(z.string())]).optional(),
  availableHoursPerWeek: z.coerce.number().min(1).max(80).default(12),
  riskTolerance: z.enum(["low", "medium", "high"]).default("medium"),
});

export const ideaFilterSchema = z.object({
  niche: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxDifficulty: z.coerce.number().min(0).max(100).optional(),
  businessModel: businessTypeSchema.optional(),
  source: z
    .enum(["reddit", "hackernews", "youtube", "twitter", "github", "polymarket", "web", "reviews"])
    .optional(),
});

export type CreateResearchRunInput = z.infer<typeof createResearchRunInputSchema>;
export type IdeaFilters = z.infer<typeof ideaFilterSchema>;

export type SourceCitationRecord = {
  id: string;
  ideaId: string;
  signalId: string;
  source: SignalSource;
  url: string;
  snippet: string;
  relevance: number;
};

export type ScoredIdea = StartupIdea & {
  score: IdeaScore;
  fitScore: number;
  scoreRank: number;
  bookmarked: boolean;
  citations: SourceCitationRecord[];
  researchRunId: string;
};

export type ResearchRunRecord = {
  id: string;
  topic: string;
  audience?: string;
  preferredBusinessType: string;
  mode: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  signalIds: string[];
  clusterIds: string[];
  ideaIds: string[];
};

export const executionStatusSchema = z.enum(["backlog", "validating", "building", "launched", "paused"]);
export const executionPrioritySchema = z.enum(["low", "medium", "high"]);

export const executionUpdateSchema = z.object({
  status: executionStatusSchema.optional(),
  priority: executionPrioritySchema.optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  ownerId: z.string().optional(),
  nextStep: z.string().min(2).max(240).optional(),
  blockers: z.array(z.string().min(1).max(140)).optional(),
});

export type ExecutionStatus = z.infer<typeof executionStatusSchema>;
export type ExecutionPriority = z.infer<typeof executionPrioritySchema>;
export type ExecutionUpdateInput = z.infer<typeof executionUpdateSchema>;

export type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};

export type TeamRecord = {
  id: string;
  name: string;
  members: TeamMemberRecord[];
};

export type ExecutionItemRecord = {
  id: string;
  ideaId: string;
  ideaTitle: string;
  ideaOneLiner: string;
  score: number;
  businessModel: string;
  status: ExecutionStatus;
  stage: string;
  priority: ExecutionPriority;
  progress: number;
  owner: TeamMemberRecord;
  collaborators: TeamMemberRecord[];
  nextStep: string;
  dueDate: Date;
  blockers: string[];
  updatedAt: Date;
};

type DemoState = {
  founderProfile: FounderProfileInput;
  researchRuns: ResearchRunRecord[];
  signals: Signal[];
  clusters: ProblemCluster[];
  ideas: ScoredIdea[];
  refinements: IdeaRefinementResult[];
  team: TeamRecord;
  executionItems: ExecutionItemRecord[];
  seeded: boolean;
};

const DEFAULT_PROFILE: FounderProfileInput = {
  skills: ["TypeScript", "Next.js", "AI", "automation", "sales"],
  interests: ["developer tools", "creator economy", "B2B compliance"],
  budget: 3000,
  availableHoursPerWeek: 14,
  preferredBusinessModel: "SaaS",
  riskTolerance: "medium",
};

const DEFAULT_TEAM: TeamRecord = {
  id: "team-signalideas",
  name: "SignalIdeas Launch Team",
  members: [
    {
      id: "member-david",
      name: "David Wegener",
      email: "david@example.com",
      role: "Founder",
      initials: "DW",
    },
    {
      id: "member-product",
      name: "Mia Product",
      email: "mia@example.com",
      role: "Product",
      initials: "MP",
    },
    {
      id: "member-growth",
      name: "Noah Growth",
      email: "noah@example.com",
      role: "Growth",
      initials: "NG",
    },
  ],
};

const globalForDemo = globalThis as typeof globalThis & {
  __signalIdeasDemoState?: DemoState;
};

function state() {
  if (!globalForDemo.__signalIdeasDemoState) {
    globalForDemo.__signalIdeasDemoState = {
      founderProfile: DEFAULT_PROFILE,
      researchRuns: [],
      signals: [],
      clusters: [],
      ideas: [],
      refinements: [],
      team: DEFAULT_TEAM,
      executionItems: [],
      seeded: false,
    };
  }

  return globalForDemo.__signalIdeasDemoState;
}

function adapterForMode() {
  return process.env.SIGNAL_RESEARCH_MODE === "live"
    ? new CompositeResearchAdapter()
    : new MockResearchAdapter();
}

function withRunId<T extends { id: string }>(runId: string, item: T): T {
  return { ...item, id: `${runId}-${item.id}` };
}

function buildCitations(idea: StartupIdea, signals: Signal[]): SourceCitationRecord[] {
  return idea.evidenceSignalIds
    .map((signalId) => signals.find((signal) => signal.id === signalId))
    .filter((signal): signal is Signal => Boolean(signal))
    .map((signal, index) => ({
      id: `citation-${idea.id}-${index}`,
      ideaId: idea.id,
      signalId: signal.id,
      source: signal.source,
      url: signal.url,
      snippet: signal.text.length > 180 ? `${signal.text.slice(0, 177)}...` : signal.text,
      relevance: Math.max(0.55, 0.95 - index * 0.06),
    }));
}

function createExecutionItemsForIdeas(ideas: ScoredIdea[]) {
  const store = state();
  const existingIdeaIds = new Set(store.executionItems.map((item) => item.ideaId));
  const statuses: ExecutionStatus[] = ["validating", "building", "backlog", "paused", "launched"];
  const stages = ["Problem interviews", "Landing page", "Prototype", "Sales outreach", "Pilot setup"];
  const priorities: ExecutionPriority[] = ["high", "medium", "medium", "low"];

  const newItems = ideas
    .filter((idea) => !existingIdeaIds.has(idea.id))
    .map((idea, index) => {
      const owner = store.team.members[index % store.team.members.length];
      const collaborator = store.team.members[(index + 1) % store.team.members.length];
      const status = statuses[index % statuses.length];
      const progress =
        status === "launched" ? 100 : status === "building" ? 62 : status === "validating" ? 38 : status === "paused" ? 18 : 8;

      return {
        id: `execution-${idea.id}`,
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaOneLiner: idea.oneLiner,
        score: idea.score.total,
        businessModel: idea.businessModel,
        status,
        stage: stages[index % stages.length],
        priority: priorities[index % priorities.length],
        progress,
        owner,
        collaborators: [collaborator],
        nextStep:
          status === "building"
            ? "Ship a clickable workflow and record 3 usability sessions."
            : status === "validating"
              ? "Interview 5 target users and capture exact buying language."
              : status === "launched"
                ? "Review activation data and pick the next paid channel."
                : "Define the smallest validation test for this week.",
        dueDate: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000),
        blockers: index % 4 === 0 ? ["Needs clearer buyer segment"] : [],
        updatedAt: new Date(Date.now() - index * 3 * 60 * 60 * 1000),
      } satisfies ExecutionItemRecord;
    });

  store.executionItems.push(...newItems);
}

function asFounderProfile(input: CreateResearchRunInput) {
  return normalizeFounderProfileInput({
    skills: input.skills,
    interests: input.interests ?? input.topic,
    budget: input.budget,
    availableHoursPerWeek: input.availableHoursPerWeek,
    preferredBusinessModel: input.preferredBusinessType,
    riskTolerance: input.riskTolerance,
  });
}

async function runPipeline(input: CreateResearchRunInput) {
  const parsed = createResearchRunInputSchema.parse(input);
  const founder = asFounderProfile(parsed);
  const researchRequest: ResearchRequest = researchRequestSchema.parse(parsed);
  const aiResult = await generateOpenAIIdeaPipeline(researchRequest, founder).catch((error) => {
    console.error("OpenAI idea engine failed, falling back to local engine.", error);
    return null;
  });
  const result = aiResult
    ? {
        id: aiResult.runId,
        mode: "openai",
        startedAt: new Date(),
        completedAt: new Date(),
      }
    : await adapterForMode().research(researchRequest);
  const runId = result.id;

  const runSignals = aiResult?.signals ?? ("signals" in result ? result.signals : []);
  const runClusters =
    aiResult?.clusters ?? clusterProblemSignals(runSignals).map((cluster) => withRunId(runId, cluster));
  const ideas =
    aiResult?.ideas ??
    generateIdeasFromClusters(
      runClusters.map((cluster) => ({
        ...cluster,
        signalIds: cluster.signalIds,
      })),
      founder,
      10
    );

  const scoredIdeas = ideas
    .map((idea) => {
      const cluster = runClusters.find((candidate) => candidate.id === idea.clusterId);
      const originalIdea = {
        ...idea,
        id: `${runId}-${idea.id}`,
      };
      const score = scoreIdea(originalIdea, cluster ?? runClusters[0], founder);

      return {
        ...originalIdea,
        researchRunId: runId,
        score,
        fitScore: score.components.find((component) => component.name === "founder fit")?.value ?? 0,
        scoreRank: 0,
        bookmarked: false,
        citations: buildCitations(originalIdea, runSignals),
      } satisfies ScoredIdea;
    })
    .sort((a, b) => b.score.total + b.fitScore * 0.12 - (a.score.total + a.fitScore * 0.12))
    .map((idea, index) => ({ ...idea, scoreRank: index + 1 }));

  const run: ResearchRunRecord = {
    id: runId,
    topic: parsed.topic,
    audience: parsed.audience,
    preferredBusinessType: parsed.preferredBusinessType,
    mode: result.mode,
    status: "completed",
    progress: 100,
    startedAt: result.startedAt,
    completedAt: result.completedAt ?? new Date(),
    signalIds: runSignals.map((signal) => signal.id),
    clusterIds: runClusters.map((cluster) => cluster.id),
    ideaIds: scoredIdeas.map((idea) => idea.id),
  };

  const store = state();
  store.founderProfile = founder;
  store.researchRuns.unshift(run);
  store.signals.push(...runSignals);
  store.clusters.push(...runClusters);
  store.ideas.push(...scoredIdeas);
  createExecutionItemsForIdeas(scoredIdeas);

  return { researchRun: run, signals: runSignals, clusters: runClusters, ideas: scoredIdeas };
}

export async function ensureDemoData() {
  const store = state();

  if (!store.seeded) {
    store.seeded = true;
    await runPipeline({
      topic: "AI video tools",
      audience: "creator teams and agency editors",
      skills: DEFAULT_PROFILE.skills,
      interests: DEFAULT_PROFILE.interests,
      budget: DEFAULT_PROFILE.budget,
      preferredBusinessType: DEFAULT_PROFILE.preferredBusinessModel,
      availableHoursPerWeek: DEFAULT_PROFILE.availableHoursPerWeek,
      riskTolerance: DEFAULT_PROFILE.riskTolerance,
      days: 30,
      limit: 40,
      sources: ["reddit", "hackernews", "github", "web", "youtube", "twitter"],
    });
  }
}

export async function createResearchRun(input: unknown) {
  const parsed = createResearchRunInputSchema.parse(input);
  return runPipeline(parsed);
}

export async function getDashboardSnapshot() {
  await ensureDemoData();
  const store = state();
  const latestRun = store.researchRuns[0];
  const topIdeas = [...store.ideas]
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 6);
  const topClusters = store.clusters.slice(-6).reverse();

  return {
    founderProfile: store.founderProfile,
    latestRun,
    ideas: topIdeas,
    clusters: topClusters,
    signalCount: store.signals.length,
    researchRunCount: store.researchRuns.length,
  };
}

export async function listIdeas(filters: IdeaFilters = {}) {
  await ensureDemoData();
  const parsed = ideaFilterSchema.parse(filters);
  const store = state();

  return store.ideas
    .filter((idea) => {
      if (parsed.niche && !idea.problem.toLowerCase().includes(parsed.niche.toLowerCase())) {
        return false;
      }

      if (parsed.minScore && idea.score.total < parsed.minScore) {
        return false;
      }

      if (parsed.maxDifficulty && idea.buildDifficulty > parsed.maxDifficulty) {
        return false;
      }

      if (parsed.businessModel && idea.businessModel !== parsed.businessModel) {
        return false;
      }

      if (parsed.source && !idea.citations.some((citation) => citation.source === parsed.source)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.score.total - a.score.total);
}

export async function getIdea(id: string) {
  await ensureDemoData();
  const store = state();
  const idea = store.ideas.find((candidate) => candidate.id === id);

  if (!idea) {
    return null;
  }

  return {
    ...idea,
    signals: idea.evidenceSignalIds
      .map((signalId) => store.signals.find((signal) => signal.id === signalId))
      .filter((signal): signal is Signal => Boolean(signal)),
    refinements: store.refinements.filter((refinement) => refinement.ideaId === id),
  };
}

export async function listResearchRuns() {
  await ensureDemoData();
  return state().researchRuns;
}

export async function getResearchRun(id: string) {
  await ensureDemoData();
  const store = state();
  const run = store.researchRuns.find((candidate) => candidate.id === id);

  if (!run) {
    return null;
  }

  return {
    ...run,
    signals: store.signals.filter((signal) => run.signalIds.includes(signal.id)),
    clusters: store.clusters.filter((cluster) => run.clusterIds.includes(cluster.id)),
    ideas: store.ideas.filter((idea) => run.ideaIds.includes(idea.id)),
  };
}

export async function refineIdea(id: string, action: RefinementAction) {
  const idea = await getIdea(id);

  if (!idea) {
    return null;
  }

  const content = refineIdeaContent(idea, action);
  const refinement: IdeaRefinementResult = {
    id: `refinement-${id}-${action}-${Date.now()}`,
    ideaId: id,
    action,
    title: content.title,
    content: content.content,
    createdAt: new Date(),
  };

  state().refinements.unshift(refinement);
  return refinement;
}

export async function updateFounderProfile(input: unknown) {
  const profile = normalizeFounderProfileInput(input as never);
  state().founderProfile = profile;
  return profile;
}

export async function getFounderProfile() {
  await ensureDemoData();
  return state().founderProfile;
}

export async function setIdeaBookmark(id: string, bookmarked: boolean) {
  await ensureDemoData();
  const idea = state().ideas.find((candidate) => candidate.id === id);

  if (!idea) {
    return null;
  }

  idea.bookmarked = bookmarked;
  return idea;
}

export async function listExecutionItems() {
  await ensureDemoData();
  const store = state();

  return {
    team: store.team,
    executionItems: [...store.executionItems].sort((a, b) => {
      const priorityOrder: Record<ExecutionPriority, number> = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.score - a.score;
    }),
  };
}

export async function updateExecutionItem(id: string, input: unknown) {
  await ensureDemoData();
  const parsed = executionUpdateSchema.parse(input);
  const store = state();
  const item = store.executionItems.find((candidate) => candidate.id === id);

  if (!item) {
    return null;
  }

  const owner = parsed.ownerId
    ? store.team.members.find((member) => member.id === parsed.ownerId)
    : undefined;

  if (parsed.ownerId && !owner) {
    throw new Error("Unknown team member");
  }

  if (parsed.status) {
    item.status = parsed.status;
  }

  if (parsed.priority) {
    item.priority = parsed.priority;
  }

  if (typeof parsed.progress === "number") {
    item.progress = parsed.progress;
  }

  if (owner) {
    item.owner = owner;
  }

  if (parsed.nextStep) {
    item.nextStep = parsed.nextStep;
  }

  if (parsed.blockers) {
    item.blockers = parsed.blockers;
  }

  item.updatedAt = new Date();
  return item;
}

export function parseRefinementAction(input: unknown) {
  return refinementActionSchema.parse(input);
}
