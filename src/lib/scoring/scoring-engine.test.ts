import { describe, expect, it } from "vitest";

import { scoreIdea } from "./scoring-engine";
import type { FounderProfileInput } from "@/lib/founder-fit/founder-fit";
import type { StartupIdea } from "@/lib/ideas/generator";
import type { ProblemCluster } from "@/lib/research/types";

const cluster: ProblemCluster = {
  id: "cluster-video-export",
  label: "Slow AI video exports",
  problem: "Creators lose time because AI video exports are slow and unreliable.",
  audience: "creator teams",
  signalIds: ["s1", "s2", "s3"],
  signalCount: 3,
  averageEngagement: 82,
  averageRecencyDays: 5,
  painIntensity: 0.9,
  frequency: 0.8,
  willingnessToPay: 0.7,
  currentWorkarounds: ["manual retries", "multiple tools"],
  jobsToBeDone: ["publish more clips on schedule"],
  segments: ["creators", "agencies"],
  keywords: ["video", "export", "rendering"],
};

const idea: StartupIdea = {
  id: "idea-1",
  title: "FastClip Recovery Desk",
  oneLiner: "AI export monitoring and fallback rendering for creator teams.",
  audience: "creator teams",
  problem: cluster.problem,
  insight: "People are already combining tools manually.",
  solution: "A hosted queue that retries, compresses, and alerts teams.",
  mvp: ["Connect video tools", "Detect failed exports", "Retry jobs"],
  monetization: ["SaaS subscription"],
  gtm: ["Reddit creator communities"],
  competitors: ["Runway", "CapCut"],
  validationPlan: ["Interview 10 video editors"],
  risks: ["Platform API limits"],
  whyNow: "AI video usage is rising quickly.",
  evidenceSignalIds: cluster.signalIds,
  businessModel: "SaaS",
  buildDifficulty: 42,
  distributionChannels: ["Reddit", "YouTube"],
  clusterId: cluster.id,
};

const founder: FounderProfileInput = {
  skills: ["Next.js", "AI", "video", "automation"],
  interests: ["creator economy"],
  budget: 5000,
  availableHoursPerWeek: 18,
  preferredBusinessModel: "SaaS",
  riskTolerance: "medium",
};

describe("scoreIdea", () => {
  it("returns a 0-100 score with explained components", () => {
    const score = scoreIdea(idea, cluster, founder);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.components.length).toBe(10);
    expect(score.components.every((component) => component.explanation.length > 10)).toBe(
      true
    );
  });
});
