/**
 * LanceDbVectorStore implementation
 *
 * Manages vector storage and retrieval using LanceDB.
 * Provides a simplified interface for the Context Engine.
 */

import { CodeChunk } from "../types";

/**
 * LanceDB row structure
 */
interface LanceDbRow {
  filepath: string;
  content: string;
  startLine: number;
  endLine: number;
  vector: number[];
  _distance?: number;
}

/**
 * Configuration for LanceDbVectorStore
 */
export interface LanceDbVectorStoreConfig {
  lanceDb: any; // LanceDB connection
  tableName: string;
}

/**
 * LanceDbVectorStore interface
 * 定義 LanceDbVectorStore 的公開方法
 */
export interface ILanceDbVectorStore {
  initialize(): Promise<void>;
  add(
    filepath: string,
    chunks: CodeChunk[],
    embeddings: number[][],
  ): Promise<void>;
  search(
    queryEmbedding: number[],
    limit: number,
  ): Promise<Array<{ chunk: CodeChunk; score: number }>>;
  delete(filepath: string): Promise<void>;
  dispose(): Promise<void>;
}

/**
 * LanceDbVectorStore class
 *
 * Responsibilities:
 * - Store code chunks with embeddings
 * - Search for similar vectors
 * - Manage table lifecycle
 */
export class LanceDbVectorStore implements ILanceDbVectorStore {
  private config: LanceDbVectorStoreConfig;
  private table: any = null;
  private initialized: boolean = false;

  constructor(config: LanceDbVectorStoreConfig) {
    this.config = config;
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const tableNames = await this.config.lanceDb.tableNames();

    if (tableNames.includes(this.config.tableName)) {
      // Table exists, open it
      this.table = await this.config.lanceDb.openTable(this.config.tableName);
    } else {
      // Table doesn't exist, will be created on first add
      this.table = null;
    }

    this.initialized = true;
  }

  /**
   * Add chunks with embeddings to the vector store
   */
  async add(
    filepath: string,
    chunks: CodeChunk[],
    embeddings: number[][],
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error("LanceDbVectorStore must be initialized before use");
    }

    if (chunks.length !== embeddings.length) {
      throw new Error("Number of chunks must match number of embeddings");
    }

    // Create rows for LanceDB
    const rows: LanceDbRow[] = chunks.map((chunk, i) => ({
      filepath: chunk.filepath,
      content: chunk.content,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      vector: embeddings[i],
    }));

    // Create table if it doesn't exist
    if (!this.table) {
      this.table = await this.config.lanceDb.createTable(
        this.config.tableName,
        rows,
      );
    } else {
      // Add to existing table
      await this.table.add(rows);
    }
  }

  /**
   * Remove all chunks for a file
   */
  async delete(filepath: string): Promise<void> {
    if (!this.initialized) {
      throw new Error("LanceDbVectorStore must be initialized before use");
    }

    if (!this.table) {
      // Table doesn't exist, nothing to remove
      return;
    }

    await this.table.delete(`filepath = '${filepath}'`);
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    limit: number,
  ): Promise<Array<{ chunk: CodeChunk; score: number }>> {
    if (!this.initialized) {
      throw new Error("LanceDbVectorStore must be initialized before use");
    }

    if (!this.table) {
      // Table doesn't exist, return empty results
      return [];
    }

    const results: LanceDbRow[] = await this.table
      .search(queryVector)
      .limit(limit)
      .execute();

    return results.map((row) => ({
      chunk: {
        filepath: row.filepath,
        content: row.content,
        startLine: row.startLine,
        endLine: row.endLine,
      },
      score: row._distance ? 1 - row._distance : 0,
    }));
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    this.table = null;
    this.initialized = false;
  }
}
