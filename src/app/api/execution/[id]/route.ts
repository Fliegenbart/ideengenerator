import { ZodError } from "zod";
import { updateExecutionItem } from "@/lib/demo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await updateExecutionItem(id, await request.json());

    if (!item) {
      return Response.json({ error: "Execution item not found" }, { status: 404 });
    }

    return Response.json({ executionItem: item });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid execution update", issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Could not update execution item" },
      { status: 400 }
    );
  }
}
