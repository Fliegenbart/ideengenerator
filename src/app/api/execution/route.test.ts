import { describe, expect, it } from "vitest";

import { GET } from "./route";
import { PATCH } from "./[id]/route";

describe("execution API", () => {
  it("returns team members and execution items", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.team.members.length).toBeGreaterThanOrEqual(3);
    expect(payload.executionItems.length).toBeGreaterThanOrEqual(10);
    expect(payload.executionItems[0].owner.name).toBeTruthy();
  });

  it("validates progress updates", async () => {
    const listResponse = await GET();
    const payload = await listResponse.json();
    const id = payload.executionItems[0].id;

    const response = await PATCH(
      new Request(`http://localhost/api/execution/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ progress: 140 }),
      }),
      { params: Promise.resolve({ id }) }
    );

    expect(response.status).toBe(400);
  });
});
