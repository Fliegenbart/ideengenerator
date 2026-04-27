import { exec } from "node:child_process";
import { promisify } from "node:util";
import { MockResearchAdapter } from "@/lib/research/mock-adapter";
import {
  coerceSignal,
  researchResultSchema,
  type ResearchRequest,
  type ResearchResult,
} from "@/lib/research/types";

const execAsync = promisify(exec);

export type Last30DaysOptions = Partial<Omit<ResearchRequest, "topic">> & {
  timeoutMs?: number;
};

function enabled() {
  return process.env.LAST30DAYS_ENABLED === "true";
}

function normalizeExternalResult(topic: string, payload: unknown): ResearchResult {
  const raw = payload as {
    id?: string;
    signals?: Array<Record<string, unknown>>;
    metadata?: Record<string, unknown>;
  };

  const signals = (raw.signals ?? []).map((signal) =>
    coerceSignal({
      id: String(signal.id),
      source: signal.source as never,
      title: String(signal.title),
      text: String(signal.text),
      url: String(signal.url),
      author: signal.author ? String(signal.author) : null,
      createdAt: signal.createdAt instanceof Date ? signal.createdAt : String(signal.createdAt),
      engagementScore: Number(signal.engagementScore ?? 0),
      rawEngagement: (signal.rawEngagement ?? {}) as Record<string, unknown>,
      entities: Array.isArray(signal.entities) ? signal.entities.map(String) : [],
      sentiment: (signal.sentiment ?? "mixed") as never,
      sourceReliability: Number(signal.sourceReliability ?? 0.7),
      metadata: (signal.metadata ?? {}) as Record<string, unknown>,
    })
  );

  return researchResultSchema.parse({
    id: raw.id ?? `last30days-${Date.now()}`,
    topic,
    mode: "last30days",
    startedAt: new Date(),
    completedAt: new Date(),
    signals,
    metadata: raw.metadata ?? {},
  });
}

export async function runLast30DaysResearch(
  topic: string,
  options: Last30DaysOptions = {}
): Promise<ResearchResult> {
  const request = {
    topic,
    audience: options.audience,
    skills: options.skills,
    budget: options.budget ?? 1000,
    preferredBusinessType: options.preferredBusinessType ?? "SaaS",
    days: options.days ?? 30,
    limit: options.limit ?? 40,
    sources: options.sources ?? [
      "reddit",
      "hackernews",
      "youtube",
      "twitter",
      "github",
      "polymarket",
      "web",
    ],
  } satisfies ResearchRequest;

  if (!enabled()) {
    return new MockResearchAdapter().research(request);
  }

  if (process.env.LAST30DAYS_API_URL) {
    const response = await fetch(process.env.LAST30DAYS_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic, options: request }),
    });

    if (!response.ok) {
      throw new Error(`Last30Days API failed with ${response.status}`);
    }

    return normalizeExternalResult(topic, await response.json());
  }

  if (process.env.LAST30DAYS_COMMAND) {
    const command = `${process.env.LAST30DAYS_COMMAND} ${JSON.stringify(topic)}`;
    const { stdout } = await execAsync(command, {
      timeout: options.timeoutMs ?? 120_000,
      env: {
        ...process.env,
        LAST30DAYS_OPTIONS: JSON.stringify(request),
      },
    });

    return normalizeExternalResult(topic, JSON.parse(stdout));
  }

  return new MockResearchAdapter().research(request);
}
