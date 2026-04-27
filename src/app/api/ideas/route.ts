import { ideaFilterSchema, listIdeas } from "@/lib/demo-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = ideaFilterSchema.parse({
    niche: url.searchParams.get("niche") ?? undefined,
    minScore: url.searchParams.get("minScore") ?? undefined,
    maxDifficulty: url.searchParams.get("maxDifficulty") ?? undefined,
    businessModel: url.searchParams.get("businessModel") ?? undefined,
    source: url.searchParams.get("source") ?? undefined,
  });

  return Response.json({ ideas: await listIdeas(filters) });
}
