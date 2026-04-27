"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function IdeasFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <form
      className="rounded-lg border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = new URLSearchParams();

        for (const [key, value] of form.entries()) {
          if (String(value).trim()) {
            next.set(key, String(value).trim());
          }
        }

        router.push(`/ideas?${next.toString()}`);
      }}
    >
      <FieldGroup className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <Field>
          <FieldLabel htmlFor="niche">Niche</FieldLabel>
          <Input
            id="niche"
            name="niche"
            defaultValue={params.get("niche") ?? ""}
            placeholder="compliance, video, CI..."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="minScore">Min score</FieldLabel>
          <Input
            id="minScore"
            name="minScore"
            type="number"
            min="0"
            max="100"
            defaultValue={params.get("minScore") ?? ""}
            placeholder="70"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxDifficulty">Max difficulty</FieldLabel>
          <Input
            id="maxDifficulty"
            name="maxDifficulty"
            type="number"
            min="0"
            max="100"
            defaultValue={params.get("maxDifficulty") ?? ""}
            placeholder="65"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="businessModel">Business model</FieldLabel>
          <select
            id="businessModel"
            name="businessModel"
            defaultValue={params.get("businessModel") ?? ""}
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Any</option>
            <option value="SaaS">SaaS</option>
            <option value="AI tool">AI tool</option>
            <option value="agency">Agency</option>
            <option value="marketplace">Marketplace</option>
            <option value="content">Content</option>
            <option value="mobile app">Mobile app</option>
            <option value="local business">Local business</option>
          </select>
        </Field>
        <div className="flex items-end gap-2">
          <Button type="submit">
            <FilterIcon data-icon="inline-start" />
            Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push("/ideas")}
            aria-label="Clear filters"
          >
            <XIcon />
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
