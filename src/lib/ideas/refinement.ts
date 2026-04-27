import { z } from "zod";
import type { StartupIdea } from "./generator";

export const refinementActionSchema = z.enum([
  "cheaper",
  "b2b",
  "consumer",
  "narrow-niche",
  "landing-page-copy",
  "mvp-feature-list",
  "reddit-validation-post",
  "cold-email",
  "ads",
]);

export type RefinementAction = z.infer<typeof refinementActionSchema>;

export type IdeaRefinementResult = {
  id: string;
  ideaId: string;
  action: RefinementAction;
  title: string;
  content: Record<string, unknown>;
  createdAt: Date;
};

export function refineIdeaContent(
  idea: StartupIdea,
  action: RefinementAction
): Omit<IdeaRefinementResult, "id" | "ideaId" | "action" | "createdAt"> {
  switch (action) {
    case "cheaper":
      return {
        title: "Cheaper build path",
        content: {
          positioning: `Start as a concierge workflow for ${idea.audience} before writing deep integrations.`,
          cutScope: ["Remove dashboards", "Use manual signal review", "Use no-code intake forms", "Deliver weekly PDF reports"],
          firstVersionCost: "Under $500 if built with forms, spreadsheets, and a simple report template.",
        },
      };
    case "b2b":
      return {
        title: "B2B version",
        content: {
          buyer: "Ops, growth, or compliance owner with a measurable workflow cost.",
          pricing: "$199-$799/month depending on volume and team seats.",
          salesMotion: "Outbound with a problem-specific teardown and one evidence snippet.",
        },
      };
    case "consumer":
      return {
        title: "Consumer version",
        content: {
          user: `Individual ${idea.audience}`,
          offer: "Simple self-serve tool with templates, reminders, and shareable output.",
          pricing: "$9-$19/month or one-time template pack.",
        },
      };
    case "narrow-niche":
      return {
        title: "Narrower niche",
        content: {
          niche: `${idea.audience} using one dominant workflow tool`,
          promise: `Solve only the highest-friction part of: ${idea.problem}.`,
          reason: "A narrower niche makes evidence collection, copy, and outbound sharper.",
        },
      };
    case "landing-page-copy":
      return {
        title: "Landing page copy",
        content: {
          headline: idea.title,
          subheadline: idea.oneLiner,
          bullets: [
            "See the evidence behind every recommendation.",
            "Start with a concierge MVP before you overbuild.",
            "Prioritize by pain, budget hints, and founder fit.",
          ],
          cta: "Get the first workflow audit",
        },
      };
    case "mvp-feature-list":
      return {
        title: "MVP feature list",
        content: {
          mustHave: idea.mvp,
          niceToHave: ["Saved filters", "Team comments", "CSV export"],
          notNow: ["Full marketplace", "Advanced permissions", "Native mobile app"],
        },
      };
    case "reddit-validation-post":
      return {
        title: "Reddit validation post",
        content: {
          title: `How are you handling ${idea.problem}?`,
          body: `I'm researching a small tool for ${idea.audience}. I keep seeing people struggle with ${idea.problem}. What do you use today, and what is most annoying about it? Not selling anything; trying to understand if this is a real workflow pain.`,
        },
      };
    case "cold-email":
      return {
        title: "Cold email",
        content: {
          subject: `Question about ${idea.problem}`,
          body: `Hi {{firstName}}, I noticed teams like yours often deal with ${idea.problem}. I'm testing a lightweight ${idea.businessModel} that helps ${idea.audience} save repeated manual work. Would a 12-minute call next week be unreasonable?`,
        },
      };
    case "ads":
      return {
        title: "Ad angles",
        content: {
          searchAd: `Stop losing hours to ${idea.problem}. See a ranked fix plan in minutes.`,
          socialAd: `Your workaround is the signal. Turn repeated complaints into a workflow you can charge for.`,
          retargeting: `Still solving ${idea.problem} manually? Try the evidence-backed MVP path.`,
        },
      };
  }
}
