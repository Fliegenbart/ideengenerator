import { Prisma, PrismaClient } from "@prisma/client";
import { normalizeFounderProfileInput } from "../src/lib/founder-fit/founder-fit";
import { generateIdeasFromClusters } from "../src/lib/ideas/generator";
import { clusterProblemSignals } from "../src/lib/processing/clustering";
import { MockResearchAdapter } from "../src/lib/research/mock-adapter";
import { scoreIdea } from "../src/lib/scoring/scoring-engine";

const TOPICS = [
  "AI video tools",
  "creator economy",
  "solo founder productivity",
  "B2B compliance",
  "developer tools",
  "local service businesses",
];

const founder = normalizeFounderProfileInput({
  skills: ["TypeScript", "AI", "automation", "sales", "content"],
  interests: ["developer tools", "creator economy", "B2B compliance"],
  budget: 3000,
  availableHoursPerWeek: 14,
  preferredBusinessModel: "SaaS",
  riskTolerance: "medium",
});

function withRunId<T extends { id: string }>(runId: string, item: T): T {
  return { ...item, id: `${runId}-${item.id}` };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set. Seed skipped; the app still works in mock mode.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    await prisma.sourceCitation.deleteMany();
    await prisma.ideaRefinement.deleteMany();
    await prisma.ideaScore.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.problemCluster.deleteMany();
    await prisma.signal.deleteMany();
    await prisma.researchRun.deleteMany();
    await prisma.founderProfile.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: "founder@signalideas.local",
        name: "Demo Founder",
        founderProfile: {
          create: {
            skills: founder.skills,
            interests: founder.interests,
            budget: founder.budget,
            availableHoursPerWeek: founder.availableHoursPerWeek,
            preferredBusinessModel: founder.preferredBusinessModel,
            riskTolerance: founder.riskTolerance,
          },
        },
      },
    });

    const adapter = new MockResearchAdapter();

    for (const topic of TOPICS) {
      const result = await adapter.research({
        topic,
        budget: founder.budget,
        preferredBusinessType: "SaaS",
        days: 30,
        limit: 40,
        sources: ["reddit", "hackernews", "youtube", "twitter", "github", "polymarket", "web"],
      });

      await prisma.researchRun.create({
        data: {
          id: result.id,
          userId: user.id,
          topic,
          preferredBusinessType: "SaaS",
          mode: result.mode,
          status: "completed",
          progress: 100,
          metadata: toJson(result.metadata),
          startedAt: result.startedAt,
          completedAt: result.completedAt,
        },
      });

      await prisma.signal.createMany({
        data: result.signals.map((signal) => ({
          id: signal.id,
          researchRunId: result.id,
          source: signal.source,
          title: signal.title,
          text: signal.text,
          url: signal.url,
          author: signal.author,
          createdAt: signal.createdAt,
          engagementScore: signal.engagementScore,
          rawEngagement: toJson(signal.rawEngagement),
          entities: signal.entities,
          sentiment: signal.sentiment,
          sourceReliability: signal.sourceReliability,
          metadata: toJson(signal.metadata),
        })),
      });

      const clusters = clusterProblemSignals(result.signals).map((cluster) =>
        withRunId(result.id, cluster)
      );

      await prisma.problemCluster.createMany({
        data: clusters.map((cluster) => ({
          id: cluster.id,
          researchRunId: result.id,
          label: cluster.label,
          problem: cluster.problem,
          audience: cluster.audience,
          signalIds: cluster.signalIds,
          signalCount: cluster.signalCount,
          averageEngagement: cluster.averageEngagement,
          averageRecencyDays: cluster.averageRecencyDays,
          painIntensity: cluster.painIntensity,
          frequency: cluster.frequency,
          willingnessToPay: cluster.willingnessToPay,
          currentWorkarounds: cluster.currentWorkarounds,
          jobsToBeDone: cluster.jobsToBeDone,
          segments: cluster.segments,
          keywords: cluster.keywords,
        })),
      });

      const ideas = generateIdeasFromClusters(clusters, founder, 10);

      for (const idea of ideas) {
        const ideaId = `${result.id}-${idea.id}`;
        const cluster = clusters.find((candidate) => candidate.id === idea.clusterId) ?? clusters[0];
        const scoredIdea = { ...idea, id: ideaId };
        const score = scoreIdea(scoredIdea, cluster, founder);

        await prisma.idea.create({
          data: {
            id: ideaId,
            userId: user.id,
            researchRunId: result.id,
            problemClusterId: idea.clusterId,
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
            evidenceSignalIds: idea.evidenceSignalIds,
            businessModel: idea.businessModel,
            buildDifficulty: idea.buildDifficulty,
            distributionChannels: idea.distributionChannels,
            executionPlan7Day: idea.executionPlan7Day ?? [],
            score: {
              create: {
                total: score.total,
                components: toJson(score.components),
                summary: score.summary,
              },
            },
          },
        });

        await prisma.sourceCitation.createMany({
          data: idea.evidenceSignalIds
            .map((signalId, index) => {
              const signal = result.signals.find((candidate) => candidate.id === signalId);

              if (!signal) {
                return null;
              }

              return {
                ideaId,
                signalId,
                source: signal.source,
                url: signal.url,
                snippet: signal.text.slice(0, 220),
                relevance: Math.max(0.55, 0.95 - index * 0.06),
              };
            })
            .filter((citation): citation is NonNullable<typeof citation> => Boolean(citation)),
        });
      }
    }

    console.log(`Seeded ${TOPICS.length} research topics with mock signals and ideas.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
