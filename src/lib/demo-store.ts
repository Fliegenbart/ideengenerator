import { z } from "zod";
import { normalizeFounderProfileInput, type FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import { generateIdeasFromClusters, type StartupIdea } from "@/lib/ideas/generator";
import {
  refineIdeaContent,
  refinementActionSchema,
  type IdeaRefinementResult,
  type RefinementAction,
} from "@/lib/ideas/refinement";
import { clusterProblemSignals } from "@/lib/processing/clustering";
import { Last30DaysAdapter } from "@/lib/research/last30days-adapter";
import { MockResearchAdapter } from "@/lib/research/mock-adapter";
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
    .enum(["reddit", "hackernews", "youtube", "twitter", "github", "polymarket", "web", "reviews", "last30days"])
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

type DemoState = {
  founderProfile: FounderProfileInput;
  researchRuns: ResearchRunRecord[];
  signals: Signal[];
  clusters: ProblemCluster[];
  ideas: ScoredIdea[];
  refinements: IdeaRefinementResult[];
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
      seeded: false,
    };
  }

  return globalForDemo.__signalIdeasDemoState;
}

function adapterForMode() {
  return process.env.LAST30DAYS_ENABLED === "true"
    ? new Last30DaysAdapter()
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
  const result = await adapterForMode().research(researchRequest);
  const runId = result.id;

  const runSignals = result.signals;
  const runClusters = clusterProblemSignals(runSignals).map((cluster) => withRunId(runId, cluster));
  const ideas = generateIdeasFromClusters(
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

export function parseRefinementAction(input: unknown) {
  return refinementActionSchema.parse(input);
}
