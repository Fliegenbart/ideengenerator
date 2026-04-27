import { ZodError } from "zod";
import { getFounderProfile, updateFounderProfile } from "@/lib/demo-store";

export async function GET() {
  return Response.json({ founderProfile: await getFounderProfile() });
}

export async function PUT(request: Request) {
  try {
    const founderProfile = await updateFounderProfile(await request.json());
    return Response.json({ founderProfile });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid founder profile", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: "Unable to update founder profile" }, { status: 500 });
  }
}
