/**
 * IncrementalIndexer implementation
 *
 * Manages incremental indexing of files using hash-based change detection.
 * Only re-indexes files when their content has changed.
 */

import { createHash } from "crypto";
import { IDE, ILLM } from "../../index.d";
import { IIndexer, IndexingStatus } from "../types";

/**
 * Vector store interface for storing embeddings
 */
export interface IVectorStore {
  add(filepath: string, chunks: any[]): Promise<void>;
  remove(filepath: string): Promise<void>;
}

/**
 * Configuration for IncrementalIndexer
 */
export interface IncrementalIndexerConfig {
  ide: IDE;
  embeddingProvider: ILLM | null;
  vectorStore: IVectorStore;
}

/**
 * IncrementalIndexer class
 *
 * Responsibilities:
 * - Track file hashes to detect changes
 * - Index only changed files
 * - Manage indexing queue
 * - Report indexing status
 */
export class IncrementalIndexer implements IIndexer {
  private config: IncrementalIndexerConfig;
  private fileHashes: Map<string, string> = new Map();
  private indexedFiles: Set<string> = new Set();
  private isIndexingFlag: boolean = false;
  private initialized: boolean = false;

  constructor(config: IncrementalIndexerConfig) {
    this.config = config;
  }

  /**
   * Initialize the indexer
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // TODO: Load cached hashes from metadata store in Phase 1.6
    this.initialized = true;
  }

  /**
   * Index a file
   *
   * Steps:
   * 1. Read file content
   * 2. Calculate hash
   * 3. Check if hash changed
   * 4. If changed, chunk and embed
   * 5. Store in vector database
   * 6. Update hash cache
   */
  async indexFile(filepath: string): Promise<void> {
    if (!this.initialized) {
      throw new Error("IncrementalIndexer must be initialized before use");
    }

    this.isIndexingFlag = true;

    try {
      // Read file content
      const content = await this.config.ide.readFile(filepath);

      // Calculate hash
      const hash = this.calculateHash(content);

      // Check if file changed
      const previousHash = this.fileHashes.get(filepath);
      if (previousHash === hash) {
        // File unchanged, skip indexing
        return;
      }

      // File changed or new, proceed with indexing
      if (this.config.embeddingProvider) {
        // TODO: Implement chunking in Phase 3
        // For now, treat whole file as one chunk
        const chunks = [
          {
            filepath,
            content,
            startLine: 1,
            endLine: content.split("\n").length,
          },
        ];

        // Generate embeddings (embed 方法期望接收 string[] 而非 string)
        await this.config.embeddingProvider.embed([content]);

        // Store in vector database
        await this.config.vectorStore.add(filepath, chunks);
      }

      // Update hash cache
      this.fileHashes.set(filepath, hash);
      this.indexedFiles.add(filepath);
    } finally {
      this.isIndexingFlag = false;
    }
  }

  /**
   * Remove a file from the index
   */
  async removeFile(filepath: string): Promise<void> {
    if (!this.initialized) {
      throw new Error("IncrementalIndexer must be initialized before use");
    }

    // Remove from vector store
    await this.config.vectorStore.remove(filepath);

    // Remove from caches
    this.fileHashes.delete(filepath);
    this.indexedFiles.delete(filepath);
  }

  /**
   * Get indexing status
   */
  async getStatus(): Promise<IndexingStatus> {
    const filesIndexed = this.indexedFiles.size;
    const totalFiles = this.indexedFiles.size;

    let progress = 0;
    if (totalFiles > 0) {
      progress = this.isIndexingFlag ? 0.5 : 1.0;
    }

    return {
      isIndexing: this.isIndexingFlag,
      filesIndexed,
      totalFiles,
      progress,
    };
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    // TODO: Save hash cache to metadata store in Phase 1.6
    this.fileHashes.clear();
    this.indexedFiles.clear();
    this.initialized = false;
  }

  /**
   * Calculate SHA-256 hash of content
   */
  private calculateHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }
}
