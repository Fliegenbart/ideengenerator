import { describe, expect, it } from "vitest";

import { rankIdeasForFounder, type FounderProfileInput } from "./founder-fit";
import type { StartupIdea } from "@/lib/ideas/generator";

const founder: FounderProfileInput = {
  skills: ["sales", "automation", "compliance"],
  interests: ["B2B compliance"],
  budget: 3000,
  availableHoursPerWeek: 12,
  preferredBusinessModel: "agency",
  riskTolerance: "low",
};

const idea = (id: string, overrides: Partial<StartupIdea>): StartupIdea => ({
  id,
  title: id,
  oneLiner: "One line",
  audience: "B2B compliance teams",
  problem: "Manual compliance evidence collection",
  insight: "Teams repeat the same work.",
  solution: "A service-assisted workflow.",
  mvp: ["Checklist", "Evidence capture"],
  monetization: ["Monthly retainer"],
  gtm: ["LinkedIn outbound"],
  competitors: ["Spreadsheets"],
  validationPlan: ["Call 10 compliance leads"],
  risks: ["Trust barrier"],
  whyNow: "More small teams need compliance.",
  evidenceSignalIds: ["s1"],
  businessModel: "agency",
  buildDifficulty: 30,
  distributionChannels: ["LinkedIn"],
  clusterId: "c1",
  ...overrides,
});

describe("rankIdeasForFounder", () => {
  it("ranks ideas that match skills, budget, and business preference higher", () => {
    const ranked = rankIdeasForFounder(
      [
        idea("expensive-marketplace", {
          businessModel: "marketplace",
          buildDifficulty: 90,
          solution: "A complex two-sided marketplace.",
        }),
        idea("compliance-agency", {
          businessModel: "agency",
          buildDifficulty: 24,
          solution: "A compliance automation service.",
        }),
      ],
      founder
    );

    expect(ranked[0].idea.id).toBe("compliance-agency");
    expect(ranked[0].fitScore).toBeGreaterThan(ranked[1].fitScore);
  });
});
