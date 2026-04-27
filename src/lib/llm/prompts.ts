import { z } from "zod";

export const llmJsonInstruction =
  "Return strict JSON only. Do not include markdown. The JSON must match the provided schema exactly.";

export const signalExtractionOutputSchema = z.object({
  painPoints: z.array(z.string()),
  jobsToBeDone: z.array(z.string()),
  userSegments: z.array(z.string()),
  currentWorkarounds: z.array(z.string()),
  willingnessToPayHints: z.array(z.string()),
  urgency: z.number().min(0).max(1),
  frequency: z.number().min(0).max(1),
});

export const problemClusteringOutputSchema = z.object({
  clusters: z.array(
    z.object({
      label: z.string(),
      problem: z.string(),
      audience: z.string(),
      signalIds: z.array(z.string()),
      keywords: z.array(z.string()),
    })
  ),
});

export const ideaGenerationOutputSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      oneLiner: z.string(),
      audience: z.string(),
      problem: z.string(),
      insight: z.string(),
      solution: z.string(),
      mvp: z.array(z.string()),
      monetization: z.array(z.string()),
      gtm: z.array(z.string()),
      competitors: z.array(z.string()),
      validationPlan: z.array(z.string()),
      risks: z.array(z.string()),
      whyNow: z.string(),
      evidenceSignalIds: z.array(z.string()),
    })
  ),
});

export const ideaScoringOutputSchema = z.object({
  total: z.number().min(0).max(100),
  components: z.array(
    z.object({
      name: z.string(),
      value: z.number().min(0).max(100),
      explanation: z.string(),
    })
  ),
});

export const ideaRefinementOutputSchema = z.object({
  title: z.string(),
  content: z.record(z.string(), z.unknown()),
});

export function signalExtractionPrompt(signalText: string) {
  return `${llmJsonInstruction}
Schema: ${JSON.stringify(signalExtractionOutputSchema.shape)}
Extract demand insights from this recent market/community signal:
${signalText}`;
}

export function problemClusteringPrompt(signalsJson: unknown) {
  return `${llmJsonInstruction}
Group repeated complaints into problem clusters. Prefer clusters with clear buyers, repeated workarounds, and urgency.
Signals: ${JSON.stringify(signalsJson)}`;
}

export function ideaGenerationPrompt(clustersJson: unknown) {
  return `${llmJsonInstruction}
Generate startup ideas using this formula: For [audience] who struggle with [problem], build [solution] that [outcome], differentiated by [unique angle], monetized via [business model].
Clusters: ${JSON.stringify(clustersJson)}`;
}

export function ideaScoringPrompt(ideaJson: unknown, clusterJson: unknown, founderJson: unknown) {
  return `${llmJsonInstruction}
Score the idea from 0-100 using pain intensity, frequency, recency, engagement, willingness to pay, competition gap, founder fit, build difficulty, distribution feasibility, and market timing.
Idea: ${JSON.stringify(ideaJson)}
Cluster: ${JSON.stringify(clusterJson)}
Founder: ${JSON.stringify(founderJson)}`;
}

export function refinementPrompt(action: string, ideaJson: unknown) {
  return `${llmJsonInstruction}
Refine the idea for this action: ${action}.
Return actionable content, not generic advice.
Idea: ${JSON.stringify(ideaJson)}`;
}
