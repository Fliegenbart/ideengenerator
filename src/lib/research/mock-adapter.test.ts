import { describe, expect, it } from "vitest";

import { MockResearchAdapter } from "./mock-adapter";
import { signalSchema } from "./types";

describe("MockResearchAdapter", () => {
  it("returns normalized recent signals for a niche", async () => {
    const adapter = new MockResearchAdapter();

    const result = await adapter.research({
      topic: "AI video tools",
      sources: ["reddit", "hackernews", "github", "web"],
      days: 30,
      limit: 20,
    });

    expect(result.topic).toBe("AI video tools");
    expect(result.signals.length).toBeGreaterThanOrEqual(10);

    for (const signal of result.signals) {
      expect(() => signalSchema.parse(signal)).not.toThrow();
      expect(signal.createdAt.getTime()).toBeGreaterThan(
        Date.now() - 31 * 24 * 60 * 60 * 1000
      );
      expect(signal.engagementScore).toBeGreaterThanOrEqual(0);
      expect(signal.sourceReliability).toBeGreaterThanOrEqual(0);
      expect(signal.sourceReliability).toBeLessThanOrEqual(1);
    }
  });
});
