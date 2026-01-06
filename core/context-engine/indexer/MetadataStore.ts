/**
 * MetadataStore implementation
 *
 * Manages file metadata and indexing state using SQLite.
 * Stores file hashes, timestamps, and indexing status.
 */

/**
 * File metadata structure
 */
export interface FileMetadata {
  filepath: string;
  hash: string;
  lastModified: number;
  indexed: boolean;
  indexedAt?: number;
}

/**
 * Configuration for MetadataStore
 */
export interface MetadataStoreConfig {
  dbPath: string;
}

/**
 * MetadataStore interface
 * 定義 MetadataStore 的公開方法
 */
export interface IMetadataStore {
  initialize(): Promise<void>;
  fullTextSearch(query: string, limit: number): Promise<any[]>;
  getRecentlyModifiedFiles(threshold: Date, limit: number): Promise<any[]>;
}

/**
 * MetadataStore class
 *
 * Responsibilities:
 * - Store file metadata
 * - Track indexing status
 * - Persist file hashes
 * - Query metadata
 */
export class MetadataStore implements IMetadataStore {
  private config: MetadataStoreConfig;
  private db: any = null;
  private initialized: boolean = false;

  constructor(config: MetadataStoreConfig) {
    this.config = config;
  }

  /**
   * Initialize the metadata store
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // TODO: Initialize SQLite database in Phase 1.6
    // For now, use in-memory storage
    this.db = new Map<string, FileMetadata>();
    this.initialized = true;
  }

  /**
   * Save file metadata
   */
  async saveMetadata(metadata: FileMetadata): Promise<void> {
    if (!this.initialized) {
      throw new Error("MetadataStore must be initialized before use");
    }

    this.db.set(metadata.filepath, metadata);
  }

  /**
   * Get file metadata
   */
  async getMetadata(filepath: string): Promise<FileMetadata | null> {
    if (!this.initialized) {
      throw new Error("MetadataStore must be initialized before use");
    }

    return this.db.get(filepath) || null;
  }

  /**
   * Delete file metadata
   */
  async deleteMetadata(filepath: string): Promise<void> {
    if (!this.initialized) {
      throw new Error("MetadataStore must be initialized before use");
    }

    this.db.delete(filepath);
  }

  /**
   * Get all indexed files
   */
  async getIndexedFiles(): Promise<FileMetadata[]> {
    if (!this.initialized) {
      throw new Error("MetadataStore must be initialized before use");
    }

    const files: FileMetadata[] = [];
    for (const metadata of this.db.values()) {
      if (metadata.indexed) {
        files.push(metadata);
      }
    }
    return files;
  }

  /**
   * Full-text search (stub implementation)
   */
  async fullTextSearch(query: string, limit: number): Promise<any[]> {
    // TODO: Implement FTS5 full-text search
    // For now, return empty array
    return [];
  }

  /**
   * Get recently modified files (stub implementation)
   */
  async getRecentlyModifiedFiles(
    threshold: Date,
    limit: number,
  ): Promise<any[]> {
    // TODO: Implement recently modified files query
    // For now, return empty array
    return [];
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    if (this.db) {
      this.db.clear();
    }
    this.initialized = false;
  }
}
