import { z } from "zod";

export const signalSourceSchema = z.enum([
  "reddit",
  "hackernews",
  "youtube",
  "twitter",
  "github",
  "polymarket",
  "web",
  "reviews",
  "last30days",
]);

export const sentimentSchema = z.enum(["positive", "neutral", "negative", "mixed"]);

export const businessTypeSchema = z.enum([
  "SaaS",
  "marketplace",
  "content",
  "agency",
  "AI tool",
  "mobile app",
  "local business",
]);

export const signalSchema = z.object({
  id: z.string().min(1),
  source: signalSourceSchema,
  title: z.string().min(1),
  text: z.string().min(1),
  url: z.string().url(),
  author: z.string().nullable(),
  createdAt: z.date(),
  engagementScore: z.number().min(0),
  rawEngagement: z.record(z.string(), z.unknown()),
  entities: z.array(z.string()),
  sentiment: sentimentSchema,
  sourceReliability: z.number().min(0).max(1),
  metadata: z.record(z.string(), z.unknown()),
});

export type SignalSource = z.infer<typeof signalSourceSchema>;
export type SignalSentiment = z.infer<typeof sentimentSchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;
export type Signal = z.infer<typeof signalSchema>;

export const researchRequestSchema = z.object({
  topic: z.string().trim().min(2, "Enter a niche or topic."),
  audience: z.string().trim().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  budget: z.coerce.number().min(0).default(1000),
  preferredBusinessType: businessTypeSchema.default("SaaS"),
  days: z.coerce.number().int().min(1).max(90).default(30),
  limit: z.coerce.number().int().min(5).max(100).default(40),
  sources: z.array(signalSourceSchema).default([
    "reddit",
    "hackernews",
    "youtube",
    "twitter",
    "github",
    "polymarket",
    "web",
  ]),
});

export type ResearchRequest = z.infer<typeof researchRequestSchema>;

export const problemClusterSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  problem: z.string().min(1),
  audience: z.string().min(1),
  signalIds: z.array(z.string()).min(1),
  signalCount: z.number().int().min(1),
  averageEngagement: z.number().min(0),
  averageRecencyDays: z.number().min(0),
  painIntensity: z.number().min(0).max(1),
  frequency: z.number().min(0).max(1),
  willingnessToPay: z.number().min(0).max(1),
  currentWorkarounds: z.array(z.string()),
  jobsToBeDone: z.array(z.string()),
  segments: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type ProblemCluster = z.infer<typeof problemClusterSchema>;

export const researchResultSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  mode: z.enum(["mock", "last30days", "web"]),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  signals: z.array(signalSchema),
  metadata: z.record(z.string(), z.unknown()),
});

export type ResearchResult = z.infer<typeof researchResultSchema>;

export interface ResearchAdapter {
  name: string;
  research(request: ResearchRequest): Promise<ResearchResult>;
}

export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function coerceSignal(input: Omit<Signal, "createdAt"> & { createdAt: Date | string }) {
  return signalSchema.parse({
    ...input,
    createdAt:
      input.createdAt instanceof Date ? input.createdAt : new Date(input.createdAt),
  });
}
