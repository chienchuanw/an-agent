/**
 * Tests for IntentClassifier
 *
 * The IntentClassifier analyzes user input to determine their intent,
 * which guides the retrieval strategy selection.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { IntentType } from "../types";
import { IntentClassifier } from "./IntentClassifier";

describe("IntentClassifier", () => {
  let classifier: IntentClassifier;

  beforeEach(() => {
    classifier = new IntentClassifier();
  });

  describe("EXPLAIN intent", () => {
    it("should classify explanation requests", () => {
      const inputs = [
        "explain this function",
        "what does this code do",
        "how does this work",
        "can you explain the logic here",
        "what is the purpose of this",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.EXPLAIN);
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("BUG_FIX intent", () => {
    it("should classify bug fix requests", () => {
      const inputs = [
        "fix this error",
        "there's a bug in this code",
        "this is broken",
        "why is this failing",
        "debug this issue",
        "something is wrong here",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.BUG_FIX);
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("REFACTOR intent", () => {
    it("should classify refactoring requests", () => {
      const inputs = [
        "refactor this code",
        "improve this function",
        "clean up this mess",
        "optimize this algorithm",
        "make this more readable",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.REFACTOR);
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("GENERATE intent", () => {
    it("should classify generation requests", () => {
      const inputs = [
        "create a new function",
        "generate a class for user management",
        "add a method to handle authentication",
        "implement a feature for file upload",
        "write code to parse JSON",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.GENERATE);
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("TEST intent", () => {
    it("should classify testing requests", () => {
      const inputs = [
        "add tests for this function",
        "add test coverage",
        "need unit tests",
        "test this component",
        "add specs for this module",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.TEST);
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("confidence scoring", () => {
    it("should return higher confidence for clear intents", () => {
      const clearInput = "fix this critical bug in the authentication system";
      const vagueInput = "look at this";

      const clearResult = classifier.classify(clearInput);
      const vagueResult = classifier.classify(vagueInput);

      expect(clearResult.confidence).toBeGreaterThan(vagueResult.confidence);
    });

    it("should return confidence between 0 and 1", () => {
      const inputs = [
        "explain this",
        "fix the bug",
        "refactor code",
        "create function",
        "write tests",
      ];

      for (const input of inputs) {
        const result = classifier.classify(input);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("default behavior", () => {
    it("should default to EXPLAIN for ambiguous input", () => {
      const ambiguousInputs = ["this code", "look here", "check this out"];

      for (const input of ambiguousInputs) {
        const result = classifier.classify(input);
        expect(result.intent).toBe(IntentType.EXPLAIN);
      }
    });
  });
});
