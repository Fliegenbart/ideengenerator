import { getResearchRun } from "@/lib/demo-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const researchRun = await getResearchRun(id);

  if (!researchRun) {
    return Response.json({ error: "Research run not found" }, { status: 404 });
  }

  return Response.json({ researchRun });
}
