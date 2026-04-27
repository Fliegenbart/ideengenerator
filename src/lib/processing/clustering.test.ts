import { describe, expect, it } from "vitest";

import { clusterProblemSignals } from "./clustering";
import { problemClusterSchema, type Signal } from "@/lib/research/types";

const baseSignal = (id: string, title: string, text: string): Signal => ({
  id,
  source: "reddit",
  title,
  text,
  url: `https://example.com/${id}`,
  author: "founder42",
  createdAt: new Date(),
  engagementScore: 70,
  rawEngagement: { comments: 18, score: 52 },
  entities: ["Zapier", "Notion"],
  sentiment: "negative",
  sourceReliability: 0.7,
  metadata: {},
});

describe("clusterProblemSignals", () => {
  it("groups repeated problems and keeps evidence ids", () => {
    const clusters = clusterProblemSignals([
      baseSignal(
        "s1",
        "AI video exports are too slow",
        "Creators complain that rendering short clips takes hours and breaks deadlines."
      ),
      baseSignal(
        "s2",
        "Video tools keep failing at export",
        "Teams need a faster workaround for short-form video rendering."
      ),
      baseSignal(
        "s3",
        "SOC2 evidence collection is painful",
        "Compliance teams manually chase screenshots every week."
      ),
    ]);

    expect(clusters.length).toBeGreaterThanOrEqual(2);
    expect(clusters[0].signalIds.length).toBeGreaterThan(0);
    expect(() => problemClusterSchema.array().parse(clusters)).not.toThrow();
  });
});
