import { afterEach, describe, expect, it, vi } from "vitest";

import { CompositeResearchAdapter } from "./placeholders";

describe("CompositeResearchAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to local signals when live sources are unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("unavailable", { status: 503 }))
    );

    const result = await new CompositeResearchAdapter().research({
      topic: "developer tools",
      budget: 1000,
      preferredBusinessType: "SaaS",
      days: 30,
      limit: 12,
      sources: ["hackernews", "github", "reddit"],
    });

    expect(result.mode).toBe("live");
    expect(result.signals.length).toBeGreaterThanOrEqual(10);
    expect(result.metadata.fallbackUsed).toBe(true);
  });
});
