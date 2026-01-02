/**
 * Tests for ClaudeLLMClient adapter
 *
 * This adapter wraps the existing Anthropic provider to implement ILLMClient interface.
 * Following TDD: write tests first, then implementation.
 */

import { ChatMessage } from "../index.js";
import { ClaudeLLMClient } from "./ClaudeLLMClient.js";
import { LLMContext } from "./ILLMClient.interface.js";

describe("ClaudeLLMClient", () => {
  let client: ClaudeLLMClient;
  let abortController: AbortController;

  beforeEach(() => {
    // Create client with test API key
    client = new ClaudeLLMClient({
      apiKey: "test-api-key",
      model: "claude-3-5-sonnet-latest",
    });
    abortController = new AbortController();
  });

  describe("providerName", () => {
    it("should return anthropic as provider name", () => {
      expect(client.providerName).toBe("anthropic");
    });
  });

  describe("streamChat", () => {
    it("should implement streamChat method", () => {
      expect(typeof client.streamChat).toBe("function");
    });

    it("should accept messages and signal parameters", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

      // Should not throw
      const generator = client.streamChat(messages, abortController.signal);

      expect(generator).toBeDefined();
      expect(typeof generator[Symbol.asyncIterator]).toBe("function");
    });

    it("should accept optional context parameter", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

      const context: LLMContext = {
        tokenBudget: 1000,
        metadata: { intent: "explain" },
      };

      // Should not throw
      const generator = client.streamChat(
        messages,
        abortController.signal,
        context,
      );

      expect(generator).toBeDefined();
    });
  });

  describe("completeInline", () => {
    it("should implement completeInline method", () => {
      expect(typeof client.completeInline).toBe("function");
    });

    it("should accept prefix, suffix, and signal parameters", async () => {
      const prefix = "function add(a, b) {\n  ";
      const suffix = "\n}";

      // Should not throw
      const generator = client.completeInline(
        prefix,
        suffix,
        abortController.signal,
      );

      expect(generator).toBeDefined();
      expect(typeof generator[Symbol.asyncIterator]).toBe("function");
    });

    it("should accept optional context parameter", async () => {
      const prefix = "const x = ";
      const suffix = ";";

      const context: LLMContext = {
        tokenBudget: 100,
      };

      // Should not throw
      const generator = client.completeInline(
        prefix,
        suffix,
        abortController.signal,
        context,
      );

      expect(generator).toBeDefined();
    });
  });

  describe("model selection", () => {
    it("should support Haiku model", () => {
      const haikuClient = new ClaudeLLMClient({
        apiKey: "test-api-key",
        model: "claude-3-5-haiku-latest",
      });

      expect(haikuClient).toBeDefined();
    });

    it("should support Sonnet model", () => {
      const sonnetClient = new ClaudeLLMClient({
        apiKey: "test-api-key",
        model: "claude-3-5-sonnet-latest",
      });

      expect(sonnetClient).toBeDefined();
    });

    it("should support Opus model", () => {
      const opusClient = new ClaudeLLMClient({
        apiKey: "test-api-key",
        model: "claude-3-opus-latest",
      });

      expect(opusClient).toBeDefined();
    });
  });
});
