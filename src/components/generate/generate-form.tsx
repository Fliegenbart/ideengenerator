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
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-lg border bg-card p-5">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="topic">Niche or topic</FieldLabel>
            <Input id="topic" name="topic" placeholder="AI video tools" required />
            <FieldDescription>SignalIdeas researches recent demand around this area.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="audience">Target audience</FieldLabel>
            <Input
              id="audience"
              name="audience"
              placeholder="creator teams, compliance leads..."
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="skills">Your skills</FieldLabel>
          <Textarea
            id="skills"
            name="skills"
            placeholder="TypeScript, sales, automation, compliance, content marketing"
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="budget">Budget</FieldLabel>
            <Input id="budget" name="budget" type="number" min="0" defaultValue="3000" />
          </Field>
          <Field>
            <FieldLabel htmlFor="availableHoursPerWeek">Hours per week</FieldLabel>
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
            <FieldLabel htmlFor="preferredBusinessType">Business type</FieldLabel>
            <select
              id="preferredBusinessType"
              name="preferredBusinessType"
              defaultValue="SaaS"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          <FieldLabel htmlFor="riskTolerance">Risk tolerance</FieldLabel>
          <select
            id="riskTolerance"
            name="riskTolerance"
            defaultValue="medium"
            className="h-8 max-w-xs rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </FieldGroup>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2Icon data-icon="inline-start" /> : <RadarIcon data-icon="inline-start" />}
          {isPending ? "Researching" : "Run last 30 days research"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Mock mode returns a complete run immediately.
        </p>
      </div>
    </form>
  );
}
