export type LlmRequest = {
  prompt: string;
  schemaName: string;
  schema?: Record<string, unknown>;
};

export type LlmProvider = {
  generateJson: <T>(request: LlmRequest) => Promise<T>;
};

export class MockLlmProvider implements LlmProvider {
  async generateJson<T>(): Promise<T> {
    throw new Error(
      "MockLlmProvider is a boundary only. The local MVP uses deterministic generators so it works without API keys."
    );
  }
}

function extractResponseText(payload: unknown) {
  const response = payload as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string; refusal?: string }>;
    }>;
  };

  if (response.output_text) {
    return response.output_text;
  }

  for (const output of response.output ?? []) {
    for (const item of output.content ?? []) {
      if (item.refusal) {
        throw new Error(item.refusal);
      }

      if (item.text) {
        return item.text;
      }
    }
  }

  throw new Error("OpenAI response did not include text output.");
}

export class OpenAILlmProvider implements LlmProvider {
  private apiKey = process.env.OPENAI_API_KEY;
  private model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  async generateJson<T>(request: LlmRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const body: Record<string, unknown> = {
      model: this.model,
      input: [
        {
          role: "system",
          content:
            "Du bist ein pragmatischer Startup-Ideen-Analyst. Antworte als valides JSON und erfinde keine echten Quellen-URLs.",
        },
        {
          role: "user",
          content: request.prompt,
        },
      ],
    };

    if (request.schema) {
      body.text = {
        format: {
          type: "json_schema",
          name: request.schemaName,
          strict: true,
          schema: request.schema,
        },
      };
    } else {
      body.text = { format: { type: "json_object" } };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed with ${response.status}: ${errorText}`);
    }

    return JSON.parse(extractResponseText(await response.json())) as T;
  }
}

export function getLlmProvider(): LlmProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAILlmProvider();
  }

  return new MockLlmProvider();
}
