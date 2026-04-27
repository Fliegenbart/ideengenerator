import { ZodError } from "zod";
import {
  createResearchRun,
  createResearchRunInputSchema,
  listResearchRuns,
} from "@/lib/demo-store";

export async function GET() {
  return Response.json({ researchRuns: await listResearchRuns() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createResearchRunInputSchema.parse(body);
    const result = await createResearchRun(input);

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid research request", issues: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create research run" },
      { status: 500 }
    );
  }
}
