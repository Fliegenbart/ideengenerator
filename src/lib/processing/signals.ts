import { normalizeText, type Signal } from "@/lib/research/types";

export type SignalInsight = {
  signalId: string;
  painPoints: string[];
  jobsToBeDone: string[];
  userSegments: string[];
  currentWorkarounds: string[];
  willingnessToPayHints: string[];
  urgency: number;
  frequency: number;
};

const SEGMENT_HINTS = [
  "creators",
  "agencies",
  "founders",
  "developers",
  "compliance teams",
  "sales teams",
  "local businesses",
  "contractors",
  "maintainers",
  "operators",
];

const URGENCY_TERMS = ["deadline", "failed", "audit", "lost", "blocked", "missed", "penalty", "slow"];
const WTP_TERMS = ["pay", "budget", "$", "monthly", "subscription", "consultant", "revenue", "pricing"];

export function deduplicateSignals(signals: Signal[]) {
  const seen = new Set<string>();

  return signals.filter((signal) => {
    const key = signal.url || `${normalizeText(signal.title)}:${normalizeText(signal.text).slice(0, 80)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractSignalInsight(signal: Signal): SignalInsight {
  const text = normalizeText(`${signal.title} ${signal.text}`);
  const metadataText = normalizeText(Object.values(signal.metadata).join(" "));
  const combined = `${text} ${metadataText}`;

  const userSegments = SEGMENT_HINTS.filter((segment) => combined.includes(segment));
  const currentWorkarounds = Object.entries(signal.metadata)
    .filter(([key]) => key.toLowerCase().includes("workaround"))
    .map(([, value]) => String(value));

  const willingnessToPayHints = [
    ...Object.entries(signal.metadata)
      .filter(([key]) => key.toLowerCase().includes("willingness"))
      .map(([, value]) => String(value)),
    ...(WTP_TERMS.some((term) => combined.includes(term))
      ? ["Text mentions budget, paying, pricing, revenue, or consultant spend."]
      : []),
  ];

  const urgencyHits = URGENCY_TERMS.filter((term) => combined.includes(term)).length;
  const frequency = Math.min(1, signal.engagementScore / 100 + (signal.rawEngagement.comments ? 0.1 : 0));

  return {
    signalId: signal.id,
    painPoints: [signal.title, signal.text].filter(Boolean),
    jobsToBeDone: [
      "finish the workflow with less manual checking",
      "reduce repeated operational work",
    ],
    userSegments: userSegments.length > 0 ? userSegments : ["operators"],
    currentWorkarounds,
    willingnessToPayHints,
    urgency: Math.min(1, 0.35 + urgencyHits * 0.16 + (signal.sentiment === "negative" ? 0.15 : 0)),
    frequency,
  };
}

export function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function recencyDays(date: Date) {
  return Math.max(0, (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}
