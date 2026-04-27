import { runLast30DaysResearch } from "@/services/last30days";
import type { ResearchAdapter, ResearchRequest, ResearchResult } from "./types";

export class Last30DaysAdapter implements ResearchAdapter {
  name = "last30days";

  async research(request: ResearchRequest): Promise<ResearchResult> {
    return runLast30DaysResearch(request.topic, request);
  }
}
