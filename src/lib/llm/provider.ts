export type LlmRequest = {
  prompt: string;
  schemaName: string;
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

export function getLlmProvider(): LlmProvider {
  return new MockLlmProvider();
}
