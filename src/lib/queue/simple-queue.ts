export type QueueJob<TInput, TResult> = {
  id: string;
  name: string;
  input: TInput;
  status: "queued" | "running" | "completed" | "failed";
  result?: TResult;
  error?: string;
};

export class SimpleQueue {
  private jobs = new Map<string, QueueJob<unknown, unknown>>();

  async enqueue<TInput, TResult>(
    name: string,
    input: TInput,
    worker: (input: TInput) => Promise<TResult>
  ) {
    const job: QueueJob<TInput, TResult> = {
      id: `job-${Date.now()}-${this.jobs.size + 1}`,
      name,
      input,
      status: "queued",
    };

    this.jobs.set(job.id, job as QueueJob<unknown, unknown>);

    try {
      job.status = "running";
      job.result = await worker(input);
      job.status = "completed";
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown queue error";
    }

    this.jobs.set(job.id, job as QueueJob<unknown, unknown>);
    return job;
  }

  getJob(id: string) {
    return this.jobs.get(id);
  }
}

export const researchQueue = new SimpleQueue();
