import { listExecutionItems } from "@/lib/demo-store";

export async function GET() {
  return Response.json(await listExecutionItems());
}
