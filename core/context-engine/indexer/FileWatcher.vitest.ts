/**
 * Tests for FileWatcher
 *
 * The FileWatcher monitors file system changes and triggers
 * incremental indexing operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FileWatcher } from "./FileWatcher";
import { FileChangeEvent, FileChangeType } from "./types";

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  let mockIde: any;
  let changeEvents: FileChangeEvent[];

  beforeEach(() => {
    changeEvents = [];

    mockIde = {
      getWorkspaceDirs: vi.fn().mockResolvedValue(["/test/workspace"]),
    };

    fileWatcher = new FileWatcher(mockIde, {
      debounceMs: 100,
      ignorePatterns: ["node_modules/**", ".git/**"],
    });

    fileWatcher.on("change", (event: FileChangeEvent) => {
      changeEvents.push(event);
    });
  });

  afterEach(async () => {
    await fileWatcher.dispose();
  });

  describe("initialization", () => {
    it("should create a FileWatcher instance", () => {
      expect(fileWatcher).toBeDefined();
      expect(fileWatcher).toBeInstanceOf(FileWatcher);
    });

    it("should start watching after initialization", async () => {
      await fileWatcher.start();
      expect(fileWatcher.isWatching()).toBe(true);
    });

    it("should stop watching after disposal", async () => {
      await fileWatcher.start();
      await fileWatcher.dispose();
      expect(fileWatcher.isWatching()).toBe(false);
    });
  });

  describe("file change detection", () => {
    beforeEach(async () => {
      await fileWatcher.start();
    });

    it("should emit change event for file creation", async () => {
      const event: FileChangeEvent = {
        type: FileChangeType.CREATED,
        filepath: "/test/workspace/new-file.ts",
        timestamp: Date.now(),
      };

      fileWatcher.simulateChange(event);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBeGreaterThan(0);
      expect(changeEvents[0].type).toBe(FileChangeType.CREATED);
      expect(changeEvents[0].filepath).toBe("/test/workspace/new-file.ts");
    });

    it("should emit change event for file modification", async () => {
      const event: FileChangeEvent = {
        type: FileChangeType.MODIFIED,
        filepath: "/test/workspace/existing-file.ts",
        timestamp: Date.now(),
      };

      fileWatcher.simulateChange(event);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBeGreaterThan(0);
      expect(changeEvents[0].type).toBe(FileChangeType.MODIFIED);
    });

    it("should emit change event for file deletion", async () => {
      const event: FileChangeEvent = {
        type: FileChangeType.DELETED,
        filepath: "/test/workspace/deleted-file.ts",
        timestamp: Date.now(),
      };

      fileWatcher.simulateChange(event);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBeGreaterThan(0);
      expect(changeEvents[0].type).toBe(FileChangeType.DELETED);
    });
  });

  describe("debouncing", () => {
    beforeEach(async () => {
      await fileWatcher.start();
    });

    it("should debounce rapid changes to the same file", async () => {
      const filepath = "/test/workspace/rapid-changes.ts";

      for (let i = 0; i < 5; i++) {
        fileWatcher.simulateChange({
          type: FileChangeType.MODIFIED,
          filepath,
          timestamp: Date.now(),
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBe(1);
    });
  });

  describe("ignore patterns", () => {
    beforeEach(async () => {
      await fileWatcher.start();
    });

    it("should ignore files matching ignore patterns", async () => {
      const event: FileChangeEvent = {
        type: FileChangeType.CREATED,
        filepath: "/test/workspace/node_modules/package/index.js",
        timestamp: Date.now(),
      };

      fileWatcher.simulateChange(event);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBe(0);
    });

    it("should not ignore files not matching patterns", async () => {
      const event: FileChangeEvent = {
        type: FileChangeType.CREATED,
        filepath: "/test/workspace/src/index.ts",
        timestamp: Date.now(),
      };

      fileWatcher.simulateChange(event);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(changeEvents.length).toBeGreaterThan(0);
    });
  });
});
