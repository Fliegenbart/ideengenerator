import { z } from "zod";
import type { BusinessType } from "@/lib/research/types";
import type { StartupIdea } from "@/lib/ideas/generator";

export const founderProfileInputSchema = z.object({
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  budget: z.coerce.number().min(0).default(1000),
  availableHoursPerWeek: z.coerce.number().min(1).max(80).default(10),
  preferredBusinessModel: z
    .enum(["SaaS", "marketplace", "content", "agency", "AI tool", "mobile app", "local business"])
    .default("SaaS"),
  riskTolerance: z.enum(["low", "medium", "high"]).default("medium"),
});

export type FounderProfileInput = z.infer<typeof founderProfileInputSchema>;

function tokenize(values: string[]) {
  return new Set(
    values
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateFounderFit(idea: StartupIdea, founder: FounderProfileInput) {
  const founderTokens = tokenize([...founder.skills, ...founder.interests]);
  const ideaTokens = tokenize([
    idea.title,
    idea.oneLiner,
    idea.audience,
    idea.problem,
    idea.solution,
    idea.businessModel,
    ...idea.mvp,
    ...idea.gtm,
  ]);

  const matches = [...ideaTokens].filter((token) => founderTokens.has(token));
  const skillMatch = Math.min(45, matches.length * 9);
  const modelMatch = idea.businessModel === founder.preferredBusinessModel ? 20 : 4;
  const budgetNeed = idea.buildDifficulty * 75;
  const budgetFit = founder.budget >= budgetNeed ? 15 : Math.max(0, 15 - (budgetNeed - founder.budget) / 500);
  const hoursFit = founder.availableHoursPerWeek >= idea.buildDifficulty / 4 ? 10 : 5;
  const riskPenalty =
    founder.riskTolerance === "low" && idea.buildDifficulty > 65
      ? -18
      : founder.riskTolerance === "medium" && idea.buildDifficulty > 82
        ? -10
        : 0;

  return {
    fitScore: clamp(skillMatch + modelMatch + budgetFit + hoursFit + 10 + riskPenalty),
    matchedSkills: matches.slice(0, 8),
    explanation:
      matches.length > 0
        ? `Matches ${matches.slice(0, 4).join(", ")} and the ${idea.businessModel} model.`
        : `Limited direct skill overlap; fit mostly depends on appetite for ${idea.businessModel}.`,
  };
}

export function rankIdeasForFounder(ideas: StartupIdea[], founderInput: FounderProfileInput) {
  const founder = founderProfileInputSchema.parse(founderInput);

  return ideas
    .map((idea) => ({
      idea,
      ...calculateFounderFit(idea, founder),
    }))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function normalizeFounderProfileInput(input: {
  skills?: string | string[];
  interests?: string | string[];
  budget?: number;
  availableHoursPerWeek?: number;
  preferredBusinessModel?: BusinessType;
  riskTolerance?: "low" | "medium" | "high";
}) {
  const toArray = (value?: string | string[]) =>
    Array.isArray(value)
      ? value
      : String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  return founderProfileInputSchema.parse({
    skills: toArray(input.skills),
    interests: toArray(input.interests),
    budget: input.budget,
    availableHoursPerWeek: input.availableHoursPerWeek,
    preferredBusinessModel: input.preferredBusinessModel,
    riskTolerance: input.riskTolerance,
  });
}
