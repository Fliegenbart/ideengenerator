"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { FounderProfileInput } from "@/lib/founder-fit/founder-fit";

export function ProfileForm({ profile }: { profile: FounderProfileInput }) {
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/founder-profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        skills: form.get("skills"),
        interests: form.get("interests"),
        budget: Number(form.get("budget")),
        availableHoursPerWeek: Number(form.get("availableHoursPerWeek")),
        preferredBusinessModel: form.get("preferredBusinessModel"),
        riskTolerance: form.get("riskTolerance"),
      }),
    });
    setSaved(true);
  }

  return (
    <form onSubmit={submit} className="rounded-lg border bg-card p-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="skills">Skills</FieldLabel>
          <Textarea id="skills" name="skills" defaultValue={profile.skills.join(", ")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="interests">Interests</FieldLabel>
          <Textarea id="interests" name="interests" defaultValue={profile.interests.join(", ")} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="budget">Budget</FieldLabel>
            <Input id="budget" name="budget" type="number" defaultValue={profile.budget} />
          </Field>
          <Field>
            <FieldLabel htmlFor="availableHoursPerWeek">Hours per week</FieldLabel>
            <Input
              id="availableHoursPerWeek"
              name="availableHoursPerWeek"
              type="number"
              defaultValue={profile.availableHoursPerWeek}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="preferredBusinessModel">Preferred business model</FieldLabel>
            <select
              id="preferredBusinessModel"
              name="preferredBusinessModel"
              defaultValue={profile.preferredBusinessModel}
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
          <Field>
            <FieldLabel htmlFor="riskTolerance">Risk tolerance</FieldLabel>
            <select
              id="riskTolerance"
              name="riskTolerance"
              defaultValue={profile.riskTolerance}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>
      </FieldGroup>
      <div className="mt-5 flex items-center gap-3">
        <Button type="submit">
          <SaveIcon data-icon="inline-start" />
          Save profile
        </Button>
        {saved ? <span className="text-sm text-muted-foreground">Saved locally.</span> : null}
      </div>
    </form>
  );
}
