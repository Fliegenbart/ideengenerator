import { getIdea } from "@/lib/demo-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const idea = await getIdea(id);

  if (!idea) {
    return Response.json({ error: "Idea not found" }, { status: 404 });
  }

  return Response.json({ idea });
}
