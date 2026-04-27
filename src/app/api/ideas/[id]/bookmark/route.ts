import { z } from "zod";
import { setIdeaBookmark } from "@/lib/demo-store";

const bookmarkSchema = z.object({
  bookmarked: z.boolean().default(true),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = bookmarkSchema.parse(await request.json());
  const idea = await setIdeaBookmark(id, body.bookmarked);

  if (!idea) {
    return Response.json({ error: "Idea not found" }, { status: 404 });
  }

  return Response.json({ idea });
}
