import { describe, expect, test } from "vitest";
import type { ChatMessage } from "../index.js";
import { BaseLLM } from "./index.js";

// Mock LLM for testing
class TestLLM extends BaseLLM {
  static providerName = "test";
  static defaultOptions = {};

  // 覆寫 templateMessages 避免使用 _streamComplete
  templateMessages = undefined;

  protected async *_streamChat(
    messages: ChatMessage[],
  ): AsyncGenerator<ChatMessage> {
    // 模擬 LLM 返回帶有 usage 的 chunk
    yield {
      role: "assistant",
      content: "Hello",
    };
    yield {
      role: "assistant",
      content: " World",
      usage: {
        promptTokens: 500,
        completionTokens: 150,
      },
    };
  }
}

describe("streamChat actionId tracking", () => {
  test("should include actionId in PromptLog when provided", async () => {
    // Arrange
    const llm = new TestLLM({
      model: "test-model",
      title: "Test Model",
      apiKey: "test-key",
    });

    const messages: ChatMessage[] = [{ role: "user", content: "Test message" }];

    const actionId = "tool-call-123";

    // Act: 調用 streamChat 並傳入 actionId
    const generator = llm.streamChat(
      messages,
      new AbortController().signal,
      {},
      { actionId, precompiled: false }, // 傳入 actionId 和必要的 precompiled
    );

    // 消耗所有 chunks 並取得最終的 PromptLog
    const chunks: ChatMessage[] = [];
    let promptLog;
    let next = await generator.next();
    while (!next.done) {
      chunks.push(next.value);
      next = await generator.next();
    }
    promptLog = next.value; // generator 的返回值是 PromptLog

    // Assert: 驗證返回的 PromptLog 包含 actionId
    expect(promptLog).toBeDefined();
    expect(promptLog.actionId).toBe("tool-call-123");
  });

  test("should not include actionId in PromptLog when not provided", async () => {
    // Arrange
    const llm = new TestLLM({
      model: "test-model",
      title: "Test Model",
      apiKey: "test-key",
    });

    const messages: ChatMessage[] = [{ role: "user", content: "Test message" }];

    // Act: 調用 streamChat 不傳入 actionId
    const generator = llm.streamChat(
      messages,
      new AbortController().signal,
      {},
    );

    // 消耗所有 chunks 並取得最終的 PromptLog
    let promptLog;
    let next = await generator.next();
    while (!next.done) {
      next = await generator.next();
    }
    promptLog = next.value;

    // Assert: 驗證返回的 PromptLog 不包含 actionId
    expect(promptLog).toBeDefined();
    expect(promptLog.actionId).toBeUndefined();
  });

  test("should include both usage and actionId when both provided", async () => {
    // Arrange
    const llm = new TestLLM({
      model: "test-model",
      title: "Test Model",
      apiKey: "test-key",
    });

    const messages: ChatMessage[] = [{ role: "user", content: "Test message" }];

    const actionId = "tool-call-456";

    // Act
    const generator = llm.streamChat(
      messages,
      new AbortController().signal,
      {},
      { actionId, precompiled: false },
    );

    let promptLog;
    let next = await generator.next();
    while (!next.done) {
      next = await generator.next();
    }
    promptLog = next.value;

    // Assert
    expect(promptLog.actionId).toBe("tool-call-456");
    expect(promptLog.usage).toBeDefined();
    expect(promptLog.usage?.promptTokens).toBe(500);
    expect(promptLog.usage?.completionTokens).toBe(150);
  });
});
