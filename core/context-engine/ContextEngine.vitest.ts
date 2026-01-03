/**
 * Tests for the main Context Engine implementation
 *
 * Following TDD principles, these tests define the expected behavior
 * of the Context Engine before implementation.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContextEngine } from "./ContextEngine";
import { ContextQuery, IntentType, ContextEngineConfig } from "./types";

describe("ContextEngine", () => {
  let contextEngine: ContextEngine;
  let mockConfig: ContextEngineConfig;

  beforeEach(() => {
    mockConfig = {
      workspaceDirs: ["/test/workspace"],
      embeddingsProvider: null,
      reranker: null,
      ide: {} as any,
      config: {} as any,
    };

    contextEngine = new ContextEngine(mockConfig);
  });

  describe("initialization", () => {
    it("should create a ContextEngine instance", () => {
      expect(contextEngine).toBeDefined();
      expect(contextEngine).toBeInstanceOf(ContextEngine);
    });

    it("should initialize successfully", async () => {
      await expect(contextEngine.initialize()).resolves.not.toThrow();
    });

    it("should be able to dispose resources", async () => {
      await contextEngine.initialize();
      await expect(contextEngine.dispose()).resolves.not.toThrow();
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      await contextEngine.initialize();
    });

    it("should accept a basic query", async () => {
      const query: ContextQuery = {
        input: "explain this function",
        tokenBudget: 1000,
      };

      const result = await contextEngine.query(query);

      expect(result).toBeDefined();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.intent).toBeDefined();
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
      expect(result.retrievalMethods).toBeInstanceOf(Array);
    });

    it("should respect token budget", async () => {
      const query: ContextQuery = {
        input: "test query",
        tokenBudget: 100,
      };

      const result = await contextEngine.query(query);

      expect(result.tokensUsed).toBeLessThanOrEqual(query.tokenBudget);
    });

    it("should use provided intent if specified", async () => {
      const query: ContextQuery = {
        input: "fix this bug",
        intent: IntentType.BUG_FIX,
        tokenBudget: 1000,
      };

      const result = await contextEngine.query(query);

      expect(result.intent).toBe(IntentType.BUG_FIX);
    });

    it("should classify intent if not provided", async () => {
      const query: ContextQuery = {
        input: "explain how this works",
        tokenBudget: 1000,
      };

      const result = await contextEngine.query(query);

      expect(result.intent).toBeDefined();
      expect(Object.values(IntentType)).toContain(result.intent);
    });

    it("should return empty items when no context found", async () => {
      const query: ContextQuery = {
        input: "nonexistent code pattern",
        tokenBudget: 1000,
      };

      const result = await contextEngine.query(query);

      expect(result.items).toBeInstanceOf(Array);
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
    });

    it("should include retrieval methods used", async () => {
      const query: ContextQuery = {
        input: "test query",
        tokenBudget: 1000,
      };

      const result = await contextEngine.query(query);

      expect(result.retrievalMethods).toBeInstanceOf(Array);
      expect(result.retrievalMethods.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("should throw error when querying before initialization", async () => {
      const uninitializedEngine = new ContextEngine(mockConfig);
      const query: ContextQuery = {
        input: "test",
        tokenBudget: 1000,
      };

      await expect(uninitializedEngine.query(query)).rejects.toThrow();
    });

    it("should handle invalid token budget", async () => {
      await contextEngine.initialize();
      const query: ContextQuery = {
        input: "test",
        tokenBudget: -100,
      };

      await expect(contextEngine.query(query)).rejects.toThrow();
    });
  });
});
