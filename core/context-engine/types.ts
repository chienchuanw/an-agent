/**
 * Core type definitions for the Context Engine
 *
 * This file defines the fundamental types and interfaces used throughout
 * the Context Engine implementation.
 */

import { ContextItem, IDE, ILLM, ContinueConfig } from "../index.d";

/**
 * Intent types for context retrieval strategy selection
 */
export enum IntentType {
  EXPLAIN = "explain",
  BUG_FIX = "bug_fix",
  REFACTOR = "refactor",
  GENERATE = "generate",
  TEST = "test",
}

/**
 * Result of intent classification
 */
export interface IntentResult {
  intent: IntentType;
  confidence: number;
}

/**
 * Query input for the Context Engine
 */
export interface ContextQuery {
  intent?: IntentType;
  input: string;
  activeFile?: string;
  selection?: string;
  tokenBudget: number;
}

/**
 * A chunk of code with metadata
 */
export interface CodeChunk {
  filepath: string;
  content: string;
  startLine: number;
  endLine: number;
  score?: number;
}

/**
 * Result from the Context Engine
 */
export interface ContextResult {
  items: ContextItem[];
  intent: IntentType;
  tokensUsed: number;
  retrievalMethods: string[];
}

/**
 * Configuration for the Context Engine
 */
export interface ContextEngineConfig {
  workspaceDirs: string[];
  embeddingsProvider: ILLM | null;
  reranker: ILLM | null;
  ide: IDE;
  config: ContinueConfig;
}

/**
 * Main Context Engine interface
 */
export interface IContextEngine {
  /**
   * Query the Context Engine for relevant context
   */
  query(query: ContextQuery): Promise<ContextResult>;

  /**
   * Initialize the Context Engine
   */
  initialize(): Promise<void>;

  /**
   * Dispose of resources
   */
  dispose(): Promise<void>;
}

/**
 * Indexer interface for managing codebase indexing
 */
export interface IIndexer {
  /**
   * Index a file
   */
  indexFile(filepath: string): Promise<void>;

  /**
   * Remove a file from the index
   */
  removeFile(filepath: string): Promise<void>;

  /**
   * Get indexing status
   */
  getStatus(): Promise<IndexingStatus>;
}

/**
 * Indexing status information
 */
export interface IndexingStatus {
  isIndexing: boolean;
  filesIndexed: number;
  totalFiles: number;
  progress: number;
}

/**
 * Retriever interface for fetching relevant code chunks
 */
export interface IRetriever {
  /**
   * Retrieve relevant chunks based on query
   */
  retrieve(query: string, n: number): Promise<CodeChunk[]>;

  /**
   * Get the retriever's name
   */
  getName(): string;
}

/**
 * Ranker interface for scoring and sorting chunks
 */
export interface IRanker {
  /**
   * Rank chunks by relevance
   */
  rank(chunks: CodeChunk[], query: string): CodeChunk[];
}
