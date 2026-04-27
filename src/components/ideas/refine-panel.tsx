"use client";

import { useState } from "react";
import {
  BriefcaseBusinessIcon,
  CoinsIcon,
  MailIcon,
  MegaphoneIcon,
  MousePointerClickIcon,
  PackageIcon,
  PenLineIcon,
  UsersIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const actions = [
  { id: "cheaper", label: "Cheaper", icon: CoinsIcon },
  { id: "b2b", label: "B2B", icon: BriefcaseBusinessIcon },
  { id: "consumer", label: "Consumer", icon: UsersIcon },
  { id: "narrow-niche", label: "Narrow", icon: MousePointerClickIcon },
  { id: "landing-page-copy", label: "Landing copy", icon: PenLineIcon },
  { id: "mvp-feature-list", label: "MVP list", icon: PackageIcon },
  { id: "reddit-validation-post", label: "Reddit post", icon: MegaphoneIcon },
  { id: "cold-email", label: "Cold email", icon: MailIcon },
  { id: "ads", label: "Ads", icon: WandSparklesIcon },
];

type Refinement = {
  title: string;
  content: Record<string, unknown>;
};

export function RefinePanel({ ideaId }: { ideaId: string }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [refinement, setRefinement] = useState<Refinement | null>(null);

  async function refine(action: string) {
    setLoadingAction(action);
    const response = await fetch(`/api/ideas/${ideaId}/refine`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json();
    setRefinement(payload.refinement ?? null);
    setLoadingAction(null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="font-heading text-lg font-semibold">Refine idea</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate practical next-step assets from the same evidence.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => refine(action.id)}
              disabled={Boolean(loadingAction)}
              className="justify-start"
            >
              <Icon data-icon="inline-start" />
              {loadingAction === action.id ? "Working" : action.label}
            </Button>
          );
        })}
      </div>
      {refinement ? (
        <Alert>
          <AlertTitle>{refinement.title}</AlertTitle>
          <AlertDescription>
            <div className="mt-3 flex flex-col gap-3">
              {Object.entries(refinement.content).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-muted p-3">
                  <Badge variant="outline">{key}</Badge>
                  <div className="mt-2 text-sm leading-6 text-foreground/85">
                    {Array.isArray(value) ? (
                      <ul className="flex flex-col gap-1">
                        {value.map((item) => (
                          <li key={String(item)}>{String(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
