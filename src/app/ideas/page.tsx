import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeasFilterBar } from "@/components/ideas/ideas-filter-bar";
import { ideaFilterSchema, listIdeas } from "@/lib/demo-store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = ideaFilterSchema.parse({
    niche: first(params.niche),
    minScore: first(params.minScore),
    maxDifficulty: first(params.maxDifficulty),
    businessModel: first(params.businessModel),
    source: first(params.source),
  });
  const ideas = await listIdeas(filters);

  return (
    <>
      <header>
        <h1 className="font-heading text-3xl font-semibold">Ideas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter by niche, score, difficulty, business model, and source evidence.
        </p>
      </header>
      <IdeasFilterBar />
      {ideas.length === 0 ? (
        <Alert>
          <AlertCircleIcon data-icon="inline-start" />
          <AlertTitle>No ideas match these filters</AlertTitle>
          <AlertDescription>
            Clear filters or run a new research pass with a broader niche.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </>
  );
}
