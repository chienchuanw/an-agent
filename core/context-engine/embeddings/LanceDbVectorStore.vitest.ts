/**
 * Tests for LanceDbVectorStore
 *
 * The LanceDbVectorStore manages vector storage and retrieval using LanceDB.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeChunk } from "../types";
import { LanceDbVectorStore } from "./LanceDbVectorStore";

describe("LanceDbVectorStore", () => {
  let vectorStore: LanceDbVectorStore;
  let mockLanceDb: any;
  let mockTable: any;

  beforeEach(() => {
    mockTable = {
      add: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([]),
      }),
    };

    mockLanceDb = {
      tableNames: vi.fn().mockResolvedValue([]),
      createTable: vi.fn().mockResolvedValue(mockTable),
      openTable: vi.fn().mockResolvedValue(mockTable),
    };

    vectorStore = new LanceDbVectorStore({
      lanceDb: mockLanceDb,
      tableName: "test_table",
    });
  });

  afterEach(async () => {
    await vectorStore.dispose();
  });

  describe("initialization", () => {
    it("should create a LanceDbVectorStore instance", () => {
      expect(vectorStore).toBeDefined();
      expect(vectorStore).toBeInstanceOf(LanceDbVectorStore);
    });

    it("should initialize successfully", async () => {
      await expect(vectorStore.initialize()).resolves.not.toThrow();
    });

    it("should create table if not exists", async () => {
      await vectorStore.initialize();

      expect(mockLanceDb.tableNames).toHaveBeenCalled();
    });
  });

  describe("adding vectors", () => {
    beforeEach(async () => {
      // Mock table exists
      mockLanceDb.tableNames.mockResolvedValue(["test_table"]);
      await vectorStore.initialize();
    });

    it("should add chunks with embeddings", async () => {
      const chunks: CodeChunk[] = [
        {
          filepath: "/test/file.ts",
          content: "function test() {}",
          startLine: 1,
          endLine: 1,
        },
      ];

      const embeddings = [[0.1, 0.2, 0.3]];

      await vectorStore.add("/test/file.ts", chunks, embeddings);

      expect(mockTable.add).toHaveBeenCalled();
    });

    it("should handle multiple chunks", async () => {
      const chunks: CodeChunk[] = [
        {
          filepath: "/test/file.ts",
          content: "function test1() {}",
          startLine: 1,
          endLine: 1,
        },
        {
          filepath: "/test/file.ts",
          content: "function test2() {}",
          startLine: 3,
          endLine: 3,
        },
      ];

      const embeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ];

      await vectorStore.add("/test/file.ts", chunks, embeddings);

      expect(mockTable.add).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            filepath: "/test/file.ts",
            content: "function test1() {}",
          }),
          expect.objectContaining({
            filepath: "/test/file.ts",
            content: "function test2() {}",
          }),
        ]),
      );
    });
  });

  describe("removing vectors", () => {
    beforeEach(async () => {
      // Mock table exists
      mockLanceDb.tableNames.mockResolvedValue(["test_table"]);
      await vectorStore.initialize();
    });

    it("should remove file from vector store", async () => {
      await vectorStore.remove("/test/file.ts");

      expect(mockTable.delete).toHaveBeenCalledWith(
        "filepath = '/test/file.ts'",
      );
    });
  });

  describe("searching vectors", () => {
    beforeEach(async () => {
      // Mock table exists
      mockLanceDb.tableNames.mockResolvedValue(["test_table"]);
      await vectorStore.initialize();
      mockTable.search.mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([
          {
            filepath: "/test/file.ts",
            content: "function test() {}",
            startLine: 1,
            endLine: 1,
            _distance: 0.1,
          },
        ]),
      });
    });

    it("should search for similar vectors", async () => {
      const queryVector = [0.1, 0.2, 0.3];
      const results = await vectorStore.search(queryVector, 5);

      expect(mockTable.search).toHaveBeenCalledWith(queryVector);
      expect(results).toHaveLength(1);
      expect(results[0].filepath).toBe("/test/file.ts");
    });
  });
});
