import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/research-runs", () => {
  it("rejects invalid create requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/research-runs", {
        method: "POST",
        body: JSON.stringify({ topic: "" }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("creates a completed mock research run with ranked ideas", async () => {
    const response = await POST(
      new Request("http://localhost/api/research-runs", {
        method: "POST",
        body: JSON.stringify({
          topic: "developer tools",
          audience: "indie developers",
          skills: "TypeScript, APIs, developer marketing",
          budget: 2500,
          preferredBusinessType: "SaaS",
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.researchRun.status).toBe("completed");
    expect(payload.ideas.length).toBeGreaterThanOrEqual(10);
    expect(payload.ideas[0].score.total).toBeGreaterThanOrEqual(
      payload.ideas.at(-1).score.total
    );
  });
});
