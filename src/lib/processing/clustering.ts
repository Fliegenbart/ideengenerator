import {
  problemClusterSchema,
  type ProblemCluster,
  type Signal,
} from "@/lib/research/types";
import {
  average,
  deduplicateSignals,
  extractSignalInsight,
  recencyDays,
} from "./signals";

const PROBLEM_KEYWORDS: Array<{ key: string; label: string; terms: string[] }> = [
  { key: "video-export", label: "Slow or unreliable video production", terms: ["video", "export", "render", "clip"] },
  { key: "review-approval", label: "Review and approval friction", terms: ["review", "approval", "version", "changed"] },
  { key: "rights-tracking", label: "Rights and source tracking", terms: ["rights", "source", "audit trail", "reuse"] },
  { key: "sponsor-pipeline", label: "Sponsor and sales pipeline leakage", terms: ["sponsor", "deal", "invoice", "follow-up"] },
  { key: "repurposing", label: "Content repurposing fatigue", terms: ["repurposing", "platform", "draft", "scheduler"] },
  { key: "churn-retention", label: "Churn and retention blind spots", terms: ["churn", "retention", "subscriber"] },
  { key: "decision-backlog", label: "Founder decision backlog", terms: ["decide", "decision", "ideas", "build next"] },
  { key: "validation-evidence", label: "Validation evidence is scattered", terms: ["validation", "signals", "reddit", "analytics"] },
  { key: "compliance-evidence", label: "Manual compliance evidence collection", terms: ["evidence", "audit", "screenshots", "compliance"] },
  { key: "security-questionnaires", label: "Security questionnaire overload", terms: ["questionnaire", "security", "sales"] },
  { key: "access-reviews", label: "Manual access reviews", terms: ["access", "least", "privilege", "okta"] },
  { key: "ci-triage", label: "Flaky CI triage", terms: ["ci", "build", "failed", "logs"] },
  { key: "docs-drift", label: "SDK documentation drift", terms: ["documentation", "docs", "sdk", "examples"] },
  { key: "local-setup", label: "Local environment setup pain", terms: ["local", "environment", "setup", "contributors"] },
  { key: "lead-followup", label: "Missed lead follow-up", terms: ["lead", "follow-up", "missed", "calls"] },
  { key: "quotes", label: "Quote creation bottleneck", terms: ["quote", "estimating", "site visits"] },
  { key: "reviews", label: "Review request inconsistency", terms: ["reviews", "customer", "sms"] },
];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function deriveClusterKey(signal: Signal) {
  const haystack = `${signal.title} ${signal.text} ${Object.values(signal.metadata).join(" ")}`.toLowerCase();
  const problemLabel = signal.metadata.problemLabel;

  if (typeof problemLabel === "string" && problemLabel.trim()) {
    return {
      key: slug(problemLabel),
      label: problemLabel,
      terms: problemLabel.toLowerCase().split(/\s+/).slice(0, 8),
    };
  }

  const match = PROBLEM_KEYWORDS.find((entry) =>
    entry.terms.some((term) => haystack.includes(term))
  );

  return match ?? {
    key: slug(String(signal.metadata.problemLabel ?? signal.title).slice(0, 48)),
    label: String(signal.metadata.problemLabel ?? signal.title),
    terms: String(signal.metadata.problemLabel ?? signal.title)
      .toLowerCase()
      .split(/\s+/)
      .slice(0, 5),
  };
}

export function clusterProblemSignals(signals: Signal[]): ProblemCluster[] {
  const groups = new Map<string, { label: string; terms: string[]; signals: Signal[] }>();

  for (const signal of deduplicateSignals(signals)) {
    const key = deriveClusterKey(signal);
    const current = groups.get(key.key) ?? { label: key.label, terms: key.terms, signals: [] };
    current.signals.push(signal);
    groups.set(key.key, current);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const insights = group.signals.map(extractSignalInsight);
      const first = group.signals[0];
      const signalCount = group.signals.length;
      const wtpHints = insights.flatMap((insight) => insight.willingnessToPayHints);
      const workarounds = insights.flatMap((insight) => insight.currentWorkarounds);
      const segments = [...new Set(insights.flatMap((insight) => insight.userSegments))];
      const averageRecencyDays = average(group.signals.map((signal) => recencyDays(signal.createdAt)));
      const painIntensity = Math.min(1, average(insights.map((insight) => insight.urgency)) + signalCount * 0.04);
      const frequency = Math.min(1, average(insights.map((insight) => insight.frequency)) + signalCount * 0.03);

      return problemClusterSchema.parse({
        id: `cluster-${key}`,
        label: group.label,
        problem: String(first.metadata.problemLabel ?? group.label),
        audience: String(first.metadata.audience ?? segments[0] ?? "operators"),
        signalIds: group.signals.map((signal) => signal.id),
        signalCount,
        averageEngagement: Math.round(average(group.signals.map((signal) => signal.engagementScore))),
        averageRecencyDays: Math.round(averageRecencyDays * 10) / 10,
        painIntensity,
        frequency,
        willingnessToPay: Math.min(1, wtpHints.length / Math.max(1, signalCount) + 0.25),
        currentWorkarounds: [...new Set(workarounds)].slice(0, 4),
        jobsToBeDone: [...new Set(insights.flatMap((insight) => insight.jobsToBeDone))].slice(0, 4),
        segments,
        keywords: [...new Set(group.terms)].slice(0, 8),
      });
    })
    .sort((a, b) => b.signalCount + b.averageEngagement / 100 - (a.signalCount + a.averageEngagement / 100));
}
