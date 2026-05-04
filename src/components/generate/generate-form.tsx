"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, RadarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function GenerateForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/research-runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: form.get("topic"),
        audience: form.get("audience"),
        skills: form.get("skills"),
        budget: Number(form.get("budget")),
        preferredBusinessType: form.get("preferredBusinessType"),
        availableHoursPerWeek: Number(form.get("availableHoursPerWeek")),
        riskTolerance: form.get("riskTolerance"),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Research run failed.");
      setIsPending(false);
      return;
    }

    router.push(`/research-runs/${payload.researchRun.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="surface-panel flex flex-col gap-5 rounded-[34px] border border-border/70 p-5 sm:p-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="topic">Thema oder Nische</FieldLabel>
            <Input id="topic" name="topic" placeholder="KI-Video-Tools" required />
            <FieldDescription>SignalIdeas erzeugt dazu neue, bewertete Startup-Ideen.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="audience">Zielgruppe</FieldLabel>
            <Input
              id="audience"
              name="audience"
              placeholder="Creator-Teams, Handwerker, Compliance-Leads..."
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="skills">Deine Fähigkeiten</FieldLabel>
          <Textarea
            id="skills"
            name="skills"
            placeholder="Vertrieb, Automatisierung, Design, Programmierung, Content Marketing"
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="budget">Budget</FieldLabel>
            <Input id="budget" name="budget" type="number" min="0" defaultValue="3000" />
          </Field>
          <Field>
            <FieldLabel htmlFor="availableHoursPerWeek">Stunden pro Woche</FieldLabel>
            <Input
              id="availableHoursPerWeek"
              name="availableHoursPerWeek"
              type="number"
              min="1"
              max="80"
              defaultValue="12"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="preferredBusinessType">Geschäftsmodell</FieldLabel>
            <select
              id="preferredBusinessType"
              name="preferredBusinessType"
              defaultValue="SaaS"
              className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="SaaS">SaaS</option>
              <option value="AI tool">AI tool</option>
              <option value="agency">Agency</option>
              <option value="marketplace">Marketplace</option>
              <option value="content">Content</option>
              <option value="mobile app">Mobile app</option>
              <option value="local business">Local business</option>
            </select>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="riskTolerance">Risikobereitschaft</FieldLabel>
          <select
            id="riskTolerance"
            name="riskTolerance"
            defaultValue="medium"
            className="h-10 max-w-xs rounded-xl border border-input bg-background/80 px-3 text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
          </select>
        </Field>
      </FieldGroup>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <Loader2Icon data-icon="inline-start" /> : <RadarIcon data-icon="inline-start" />}
          {isPending ? "Ideen werden gemischt" : "Ideen mischen"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Mit OpenAI API Key entstehen neue Vorschlaege. Ohne Key bleibt der Demo-Modus aktiv.
        </p>
      </div>
    </form>
  );
}
