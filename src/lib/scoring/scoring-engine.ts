import { calculateFounderFit, type FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import type { StartupIdea } from "@/lib/ideas/generator";
import type { ProblemCluster } from "@/lib/research/types";

export type ScoreComponentName =
  | "pain intensity"
  | "frequency of signal"
  | "recency"
  | "engagement"
  | "willingness to pay"
  | "competition gap"
  | "founder fit"
  | "build difficulty"
  | "distribution feasibility"
  | "market timing";

export type ScoreComponent = {
  name: ScoreComponentName;
  value: number;
  weight: number;
  explanation: string;
};

export type IdeaScore = {
  total: number;
  components: ScoreComponent[];
  summary: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function weightedTotal(components: ScoreComponent[]) {
  const weight = components.reduce((sum, component) => sum + component.weight, 0);
  const total = components.reduce(
    (sum, component) => sum + component.value * component.weight,
    0
  );

  return clampScore(total / weight);
}

export function scoreIdea(
  idea: StartupIdea,
  cluster: ProblemCluster,
  founder: FounderProfileInput
): IdeaScore {
  const founderFit = calculateFounderFit(idea, founder);
  const distributionScore = clampScore(
    40 + idea.distributionChannels.length * 8 + (idea.gtm.length >= 3 ? 18 : 0)
  );
  const competitionGap = clampScore(
    72 - idea.competitors.length * 4 + (idea.uniqueAngle ? 12 : 0)
  );
  const buildDifficultyScore = clampScore(100 - idea.buildDifficulty);
  const recencyScore = clampScore(100 - cluster.averageRecencyDays * 2.5);
  const marketTiming = clampScore(
    55 + cluster.frequency * 18 + cluster.willingnessToPay * 15 + (idea.whyNow.length > 20 ? 8 : 0)
  );

  const components: ScoreComponent[] = [
    {
      name: "pain intensity",
      value: clampScore(cluster.painIntensity * 100),
      weight: 1.2,
      explanation: `Pain is inferred from negative language, urgency terms, and repeated manual workaround mentions.`,
    },
    {
      name: "frequency of signal",
      value: clampScore(cluster.frequency * 100),
      weight: 1.05,
      explanation: `Frequency uses the number of related signals and how often similar complaints appear.`,
    },
    {
      name: "recency",
      value: recencyScore,
      weight: 0.9,
      explanation: `Average signal age is ${cluster.averageRecencyDays} days, so newer clusters score higher.`,
    },
    {
      name: "engagement",
      value: clampScore(cluster.averageEngagement),
      weight: 0.95,
      explanation: `Engagement summarizes comments, votes, reactions, shares, and discussion activity.`,
    },
    {
      name: "willingness to pay",
      value: clampScore(cluster.willingnessToPay * 100),
      weight: 1.1,
      explanation: `The score rises when people mention budget, paid tools, consultant spend, or revenue loss.`,
    },
    {
      name: "competition gap",
      value: competitionGap,
      weight: 0.8,
      explanation: `Generic alternatives exist, but the idea gets credit for a sharper niche angle.`,
    },
    {
      name: "founder fit",
      value: founderFit.fitScore,
      weight: 1.1,
      explanation: founderFit.explanation,
    },
    {
      name: "build difficulty",
      value: buildDifficultyScore,
      weight: 0.85,
      explanation: `Lower build difficulty is better; this idea is estimated at ${idea.buildDifficulty}/100 difficulty.`,
    },
    {
      name: "distribution feasibility",
      value: distributionScore,
      weight: 0.8,
      explanation: `Distribution is stronger when there are clear communities, outbound paths, and comparison content angles.`,
    },
    {
      name: "market timing",
      value: marketTiming,
      weight: 0.95,
      explanation: `Timing combines recent adoption, tool fragmentation, frequency, and payment hints.`,
    },
  ];

  const total = weightedTotal(components);

  return {
    total,
    components,
    summary:
      total >= 80
        ? "Strong candidate for fast validation."
        : total >= 65
          ? "Promising, but validate budget ownership early."
          : "Interesting signal, but needs sharper validation before build time.",
  };
}
