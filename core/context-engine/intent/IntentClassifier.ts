/**
 * IntentClassifier implementation
 *
 * Analyzes user input to determine their intent using rule-based patterns.
 * This is a Phase 2 implementation that will be replaced with ML-based
 * classification in Phase 5.
 */

import { IntentResult, IntentType } from "../types";

/**
 * Pattern matching rules for each intent type
 */
interface IntentPattern {
  keywords: string[];
  weight: number;
}

/**
 * IntentClassifier class
 *
 * Responsibilities:
 * - Analyze user input text
 * - Match against intent patterns
 * - Calculate confidence scores
 * - Return classified intent
 */
export class IntentClassifier {
  private patterns: Map<IntentType, IntentPattern[]>;

  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Classify user input to determine intent
   */
  classify(input: string): IntentResult {
    const lowerInput = input.toLowerCase();
    const scores = new Map<IntentType, number>();

    // Calculate scores for each intent type
    for (const [intentType, patterns] of this.patterns.entries()) {
      let score = 0;

      for (const pattern of patterns) {
        for (const keyword of pattern.keywords) {
          if (lowerInput.includes(keyword)) {
            score += pattern.weight;
          }
        }
      }

      scores.set(intentType, score);
    }

    // Find intent with highest score
    let maxScore = 0;
    let bestIntent = IntentType.EXPLAIN; // Default

    for (const [intentType, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intentType;
      }
    }

    // Calculate confidence (normalize score)
    const confidence = Math.min(maxScore / 10, 1.0);

    return {
      intent: bestIntent,
      confidence: confidence > 0 ? confidence : 0.3, // Minimum confidence
    };
  }

  /**
   * Initialize pattern matching rules
   */
  private initializePatterns(): Map<IntentType, IntentPattern[]> {
    const patterns = new Map<IntentType, IntentPattern[]>();

    // EXPLAIN patterns
    patterns.set(IntentType.EXPLAIN, [
      {
        keywords: ["explain", "what", "how", "why", "describe", "tell me"],
        weight: 3,
      },
      {
        keywords: ["does", "work", "mean", "purpose", "do"],
        weight: 2,
      },
    ]);

    // BUG_FIX patterns
    patterns.set(IntentType.BUG_FIX, [
      {
        keywords: ["bug", "error", "fix", "broken", "issue", "problem"],
        weight: 5,
      },
      {
        keywords: ["debug", "failing", "crash", "wrong", "incorrect"],
        weight: 4,
      },
      {
        keywords: ["not working", "doesn't work", "fails", "fail"],
        weight: 4,
      },
    ]);

    // REFACTOR patterns
    patterns.set(IntentType.REFACTOR, [
      {
        keywords: ["refactor", "improve", "optimize", "clean"],
        weight: 5,
      },
      {
        keywords: ["better", "simplify", "reorganize", "restructure"],
        weight: 4,
      },
      {
        keywords: ["readable", "maintainable", "performance"],
        weight: 3,
      },
    ]);

    // GENERATE patterns
    patterns.set(IntentType.GENERATE, [
      {
        keywords: ["create", "generate", "implement", "write"],
        weight: 4,
      },
      {
        keywords: ["add", "new", "build", "make", "develop"],
        weight: 3,
      },
      {
        keywords: ["function", "class", "method", "component", "feature"],
        weight: 2,
      },
    ]);

    // TEST patterns
    patterns.set(IntentType.TEST, [
      {
        keywords: ["test", "tests", "spec", "specs", "coverage", "unit test"],
        weight: 6,
      },
      {
        keywords: ["testing", "assert", "expect", "mock"],
        weight: 5,
      },
    ]);

    return patterns;
  }
}
