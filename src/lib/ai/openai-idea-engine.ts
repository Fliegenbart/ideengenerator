import { z } from "zod";
import type { FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import type { StartupIdea } from "@/lib/ideas/generator";
import { getLlmProvider } from "@/lib/llm/provider";
import {
  businessTypeSchema,
  coerceSignal,
  problemClusterSchema,
  type ProblemCluster,
  type ResearchRequest,
  type Signal,
  type SignalSource,
} from "@/lib/research/types";

const aiSignalSchema = z.object({
  title: z.string(),
  text: z.string(),
  source: z.enum(["reddit", "hackernews", "youtube", "twitter", "github", "web", "reviews"]),
  engagementScore: z.number().min(0).max(100),
  entities: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
});

const aiClusterSchema = z.object({
  label: z.string(),
  problem: z.string(),
  audience: z.string(),
  signalIndexes: z.array(z.number().int().min(0)),
  painIntensity: z.number().min(0).max(1),
  frequency: z.number().min(0).max(1),
  willingnessToPay: z.number().min(0).max(1),
  currentWorkarounds: z.array(z.string()),
  jobsToBeDone: z.array(z.string()),
  segments: z.array(z.string()),
  keywords: z.array(z.string()),
});

const aiIdeaSchema = z.object({
  title: z.string(),
  oneLiner: z.string(),
  audience: z.string(),
  problem: z.string(),
  insight: z.string(),
  solution: z.string(),
  mvp: z.array(z.string()).min(3),
  monetization: z.array(z.string()).min(2),
  gtm: z.array(z.string()).min(2),
  competitors: z.array(z.string()).min(2),
  validationPlan: z.array(z.string()).min(3),
  risks: z.array(z.string()).min(2),
  whyNow: z.string(),
  businessModel: businessTypeSchema,
  buildDifficulty: z.number().min(0).max(100),
  distributionChannels: z.array(z.string()).min(2),
  clusterIndex: z.number().int().min(0),
  uniqueAngle: z.string(),
  executionPlan7Day: z.array(z.string()).min(7).max(7),
});

const aiIdeaRunSchema = z.object({
  signals: z.array(aiSignalSchema).min(10).max(24),
  clusters: z.array(aiClusterSchema).min(3).max(8),
  ideas: z.array(aiIdeaSchema).min(10).max(14),
});

type AiIdeaRun = z.infer<typeof aiIdeaRunSchema>;

export type OpenAIIdeaPipelineResult = {
  runId: string;
  signals: Signal[];
  clusters: ProblemCluster[];
  ideas: StartupIdea[];
};

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["signals", "clusters", "ideas"],
  properties: {
    signals: {
      type: "array",
      minItems: 10,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "text", "source", "engagementScore", "entities", "sentiment"],
        properties: {
          title: { type: "string" },
          text: { type: "string" },
          source: {
            type: "string",
            enum: ["reddit", "hackernews", "youtube", "twitter", "github", "web", "reviews"],
          },
          engagementScore: { type: "number", minimum: 0, maximum: 100 },
          entities: { type: "array", items: { type: "string" } },
          sentiment: { type: "string", enum: ["positive", "neutral", "negative", "mixed"] },
        },
      },
    },
    clusters: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "label",
          "problem",
          "audience",
          "signalIndexes",
          "painIntensity",
          "frequency",
          "willingnessToPay",
          "currentWorkarounds",
          "jobsToBeDone",
          "segments",
          "keywords",
        ],
        properties: {
          label: { type: "string" },
          problem: { type: "string" },
          audience: { type: "string" },
          signalIndexes: { type: "array", items: { type: "integer", minimum: 0 } },
          painIntensity: { type: "number", minimum: 0, maximum: 1 },
          frequency: { type: "number", minimum: 0, maximum: 1 },
          willingnessToPay: { type: "number", minimum: 0, maximum: 1 },
          currentWorkarounds: { type: "array", items: { type: "string" } },
          jobsToBeDone: { type: "array", items: { type: "string" } },
          segments: { type: "array", items: { type: "string" } },
          keywords: { type: "array", items: { type: "string" } },
        },
      },
    },
    ideas: {
      type: "array",
      minItems: 10,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "oneLiner",
          "audience",
          "problem",
          "insight",
          "solution",
          "mvp",
          "monetization",
          "gtm",
          "competitors",
          "validationPlan",
          "risks",
          "whyNow",
          "businessModel",
          "buildDifficulty",
          "distributionChannels",
          "clusterIndex",
          "uniqueAngle",
          "executionPlan7Day",
        ],
        properties: {
          title: { type: "string" },
          oneLiner: { type: "string" },
          audience: { type: "string" },
          problem: { type: "string" },
          insight: { type: "string" },
          solution: { type: "string" },
          mvp: { type: "array", minItems: 3, items: { type: "string" } },
          monetization: { type: "array", minItems: 2, items: { type: "string" } },
          gtm: { type: "array", minItems: 2, items: { type: "string" } },
          competitors: { type: "array", minItems: 2, items: { type: "string" } },
          validationPlan: { type: "array", minItems: 3, items: { type: "string" } },
          risks: { type: "array", minItems: 2, items: { type: "string" } },
          whyNow: { type: "string" },
          businessModel: {
            type: "string",
            enum: ["SaaS", "marketplace", "content", "agency", "AI tool", "mobile app", "local business"],
          },
          buildDifficulty: { type: "number", minimum: 0, maximum: 100 },
          distributionChannels: { type: "array", minItems: 2, items: { type: "string" } },
          clusterIndex: { type: "integer", minimum: 0 },
          uniqueAngle: { type: "string" },
          executionPlan7Day: { type: "array", minItems: 7, maxItems: 7, items: { type: "string" } },
        },
      },
    },
  },
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sourceReliability(source: SignalSource) {
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

  return values[source] ?? 0.7;
}

function buildPrompt(request: ResearchRequest, founder: FounderProfileInput) {
  return `Erzeuge einen kompletten Ideenlauf fuer SignalIdeas.

Ziel: Das Tool soll einfach neue Startup-Ideen ausspucken, die thematisch zum Nutzer passen.

Eingaben:
- Thema/Nische: ${request.topic}
- Zielgruppe: ${request.audience ?? "nicht angegeben"}
- Skills: ${founder.skills.join(", ") || "nicht angegeben"}
- Interessen: ${founder.interests.join(", ") || request.topic}
- Budget: ${founder.budget} EUR
- Stunden pro Woche: ${founder.availableHoursPerWeek}
- bevorzugter Geschaeftstyp: ${founder.preferredBusinessModel}
- Risikotoleranz: ${founder.riskTolerance}

Aufgabe:
1. Simuliere plausible Nachfrage-Signale aus Communities, Web, GitHub, Reddit, YouTube oder Reviews. Nenne keine echten URLs.
2. Bilde Problem-Cluster.
3. Generiere mindestens 10 konkrete Startup-Ideen.
4. Jede Idee muss praktisch umsetzbar sein und einen klaren ersten MVP haben.
5. Bevorzuge Ideen, die mit Skills, Budget und verfuegbarer Zeit des Nutzers realistisch sind.
6. Schreibe kurze, konkrete Texte. Keine allgemeinen Business-Floskeln.`;
}

export async function generateOpenAIIdeaPipeline(
  request: ResearchRequest,
  founder: FounderProfileInput
): Promise<OpenAIIdeaPipelineResult | null> {
  if (!process.env.OPENAI_API_KEY || process.env.AI_IDEA_ENGINE === "mock") {
    return null;
  }

  const runId = `run-ai-${slug(request.topic)}-${Date.now()}`;
  const provider = getLlmProvider();
  const raw = await provider.generateJson<AiIdeaRun>({
    schemaName: "signalideas_idea_run",
    schema: jsonSchema,
    prompt: buildPrompt(request, founder),
  });
  const parsed = aiIdeaRunSchema.parse(raw);

  const signals = parsed.signals.map((signal, index) =>
    coerceSignal({
      id: `${runId}-signal-${index}`,
      source: signal.source,
      title: signal.title,
      text: signal.text,
      url: `https://signalideas.local/ai-signal/${runId}/${index}`,
      author: "OpenAI idea engine",
      createdAt: new Date(Date.now() - ((index % 21) + 1) * 24 * 60 * 60 * 1000),
      engagementScore: signal.engagementScore,
      rawEngagement: {
        generatedDemandSignal: true,
        score: signal.engagementScore,
      },
      entities: signal.entities,
      sentiment: signal.sentiment,
      sourceReliability: sourceReliability(signal.source),
      metadata: {
        topic: request.topic,
        generatedBy: "openai",
      },
    })
  );

  const clusters = parsed.clusters.map((cluster, index) => {
    const signalIds = cluster.signalIndexes
      .map((signalIndex) => signals[signalIndex]?.id)
      .filter((id): id is string => Boolean(id));
    const safeSignalIds = signalIds.length > 0 ? signalIds : signals.slice(0, 2).map((signal) => signal.id);
    const relatedSignals = signals.filter((signal) => safeSignalIds.includes(signal.id));
    const averageEngagement =
      relatedSignals.reduce((sum, signal) => sum + signal.engagementScore, 0) /
      Math.max(relatedSignals.length, 1);

    return problemClusterSchema.parse({
      id: `${runId}-cluster-${index}`,
      label: cluster.label,
      problem: cluster.problem,
      audience: cluster.audience,
      signalIds: safeSignalIds,
      signalCount: safeSignalIds.length,
      averageEngagement,
      averageRecencyDays: 14,
      painIntensity: cluster.painIntensity,
      frequency: cluster.frequency,
      willingnessToPay: cluster.willingnessToPay,
      currentWorkarounds: cluster.currentWorkarounds,
      jobsToBeDone: cluster.jobsToBeDone,
      segments: cluster.segments,
      keywords: cluster.keywords,
    });
  });

  const ideas = parsed.ideas.map((idea, index) => {
    const cluster = clusters[idea.clusterIndex] ?? clusters[index % clusters.length];

    return {
      id: `idea-ai-${slug(idea.title)}-${index}`,
      title: idea.title,
      oneLiner: idea.oneLiner,
      audience: idea.audience,
      problem: idea.problem,
      insight: idea.insight,
      solution: idea.solution,
      mvp: idea.mvp,
      monetization: idea.monetization,
      gtm: idea.gtm,
      competitors: idea.competitors,
      validationPlan: idea.validationPlan,
      risks: idea.risks,
      whyNow: idea.whyNow,
      evidenceSignalIds: cluster.signalIds,
      businessModel: idea.businessModel,
      buildDifficulty: Math.round(idea.buildDifficulty),
      distributionChannels: idea.distributionChannels,
      clusterId: cluster.id,
      uniqueAngle: idea.uniqueAngle,
      executionPlan7Day: idea.executionPlan7Day,
    } satisfies StartupIdea;
  });

  return { runId, signals, clusters, ideas };
}
