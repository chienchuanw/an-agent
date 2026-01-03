/**
 * Tests for IncrementalIndexer
 *
 * The IncrementalIndexer manages incremental indexing of files,
 * using file hashes to detect changes and avoid redundant work.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IncrementalIndexer } from "./IncrementalIndexer";
import { IndexingStatus } from "../types";

describe("IncrementalIndexer", () => {
  let indexer: IncrementalIndexer;
  let mockIde: any;
  let mockEmbeddingProvider: any;
  let mockVectorStore: any;

  beforeEach(() => {
    mockIde = {
      readFile: vi.fn().mockResolvedValue("file content"),
      getWorkspaceDirs: vi.fn().mockResolvedValue(["/test/workspace"]),
    };

    mockEmbeddingProvider = {
      embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    };

    mockVectorStore = {
      add: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    indexer = new IncrementalIndexer({
      ide: mockIde,
      embeddingProvider: mockEmbeddingProvider,
      vectorStore: mockVectorStore,
    });
  });

  afterEach(async () => {
    await indexer.dispose();
  });

  describe("initialization", () => {
    it("should create an IncrementalIndexer instance", () => {
      expect(indexer).toBeDefined();
      expect(indexer).toBeInstanceOf(IncrementalIndexer);
    });

    it("should initialize successfully", async () => {
      await expect(indexer.initialize()).resolves.not.toThrow();
    });

    it("should return initial status", async () => {
      const status = await indexer.getStatus();

      expect(status).toBeDefined();
      expect(status.isIndexing).toBe(false);
      expect(status.filesIndexed).toBe(0);
      expect(status.totalFiles).toBe(0);
      expect(status.progress).toBe(0);
    });
  });

  describe("file indexing", () => {
    beforeEach(async () => {
      await indexer.initialize();
    });

    it("should index a new file", async () => {
      const filepath = "/test/workspace/new-file.ts";

      await indexer.indexFile(filepath);

      expect(mockIde.readFile).toHaveBeenCalledWith(filepath);
      expect(mockEmbeddingProvider.embed).toHaveBeenCalled();
      expect(mockVectorStore.add).toHaveBeenCalled();
    });

    it("should skip indexing if file hash unchanged", async () => {
      const filepath = "/test/workspace/unchanged-file.ts";

      // Index first time
      await indexer.indexFile(filepath);

      // Reset mocks
      vi.clearAllMocks();

      // Index again with same content
      await indexer.indexFile(filepath);

      // Should not re-index
      expect(mockEmbeddingProvider.embed).not.toHaveBeenCalled();
      expect(mockVectorStore.add).not.toHaveBeenCalled();
    });

    it("should re-index if file hash changed", async () => {
      const filepath = "/test/workspace/changed-file.ts";

      // Index first time
      await indexer.indexFile(filepath);

      // Change file content
      mockIde.readFile.mockResolvedValue("new content");

      // Reset mocks
      vi.clearAllMocks();

      // Index again with different content
      await indexer.indexFile(filepath);

      // Should re-index
      expect(mockEmbeddingProvider.embed).toHaveBeenCalled();
      expect(mockVectorStore.add).toHaveBeenCalled();
    });

    it("should update status during indexing", async () => {
      const filepath = "/test/workspace/file.ts";

      const indexPromise = indexer.indexFile(filepath);

      // Check status while indexing
      const statusDuring = await indexer.getStatus();
      expect(statusDuring.isIndexing).toBe(true);

      await indexPromise;

      // Check status after indexing
      const statusAfter = await indexer.getStatus();
      expect(statusAfter.isIndexing).toBe(false);
      expect(statusAfter.filesIndexed).toBe(1);
    });
  });

  describe("file removal", () => {
    beforeEach(async () => {
      await indexer.initialize();
    });

    it("should remove file from index", async () => {
      const filepath = "/test/workspace/to-remove.ts";

      // Index first
      await indexer.indexFile(filepath);

      // Then remove
      await indexer.removeFile(filepath);

      expect(mockVectorStore.remove).toHaveBeenCalledWith(filepath);
    });

    it("should update status after removal", async () => {
      const filepath = "/test/workspace/file.ts";

      await indexer.indexFile(filepath);
      await indexer.removeFile(filepath);

      const status = await indexer.getStatus();
      expect(status.filesIndexed).toBe(0);
    });
  });
});
