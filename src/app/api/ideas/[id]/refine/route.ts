import { ZodError, z } from "zod";
import { parseRefinementAction, refineIdea } from "@/lib/demo-store";

const bodySchema = z.object({
  action: z.unknown(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = bodySchema.parse(await request.json());
    const refinement = await refineIdea(id, parseRefinementAction(body.action));

    if (!refinement) {
      return Response.json({ error: "Idea not found" }, { status: 404 });
    }

    return Response.json({ refinement }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid refinement request", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: "Unable to refine idea" }, { status: 500 });
  }
}
