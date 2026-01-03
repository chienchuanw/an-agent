/**
 * FileWatcher implementation
 *
 * Monitors file system changes and emits events for indexing.
 * Implements debouncing to avoid excessive indexing operations.
 */

import { minimatch } from "minimatch";
import { IDE } from "../../index.d";
import {
  FileChangeEvent,
  FileWatcherConfig,
  IFileWatcherEventEmitter,
} from "./types";

/**
 * FileWatcher class
 *
 * Responsibilities:
 * - Monitor file system changes
 * - Debounce rapid changes
 * - Filter ignored files
 * - Emit change events
 */
export class FileWatcher implements IFileWatcherEventEmitter {
  private ide: IDE;
  private config: FileWatcherConfig;
  private watching: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private pendingChanges: Map<string, FileChangeEvent> = new Map();

  constructor(ide: IDE, config: FileWatcherConfig = {}) {
    this.ide = ide;
    this.config = {
      debounceMs: config.debounceMs ?? 300,
      ignorePatterns: config.ignorePatterns ?? [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**",
        "*.log",
      ],
    };
  }

  /**
   * Start watching for file changes
   */
  async start(): Promise<void> {
    if (this.watching) {
      return;
    }

    this.watching = true;

    // TODO: Integrate with VSCode FileSystemWatcher in Phase 1
    // For now, this is a placeholder that can be triggered manually
  }

  /**
   * Stop watching for file changes
   */
  async dispose(): Promise<void> {
    if (!this.watching) {
      return;
    }

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.pendingChanges.clear();

    this.watching = false;
  }

  /**
   * Check if currently watching
   */
  isWatching(): boolean {
    return this.watching;
  }

  /**
   * Register event listener
   */
  on(event: "change", listener: (event: FileChangeEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(event: "change", listener: (event: FileChangeEvent) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event: "change", data: FileChangeEvent): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data);
      }
    }
  }

  /**
   * Simulate a file change (for testing and manual triggering)
   */
  simulateChange(event: FileChangeEvent): void {
    this.handleFileChange(event);
  }

  /**
   * Handle file change with debouncing and filtering
   */
  private handleFileChange(event: FileChangeEvent): void {
    // Check if file should be ignored
    if (this.shouldIgnore(event.filepath)) {
      return;
    }

    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(event.filepath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Store the latest change
    this.pendingChanges.set(event.filepath, event);

    // Set new debounce timer
    const timer = setTimeout(() => {
      const pendingEvent = this.pendingChanges.get(event.filepath);
      if (pendingEvent) {
        this.emit("change", pendingEvent);
        this.pendingChanges.delete(event.filepath);
      }
      this.debounceTimers.delete(event.filepath);
    }, this.config.debounceMs);

    this.debounceTimers.set(event.filepath, timer);
  }

  /**
   * Check if file should be ignored based on patterns
   */
  private shouldIgnore(filepath: string): boolean {
    if (!this.config.ignorePatterns) {
      return false;
    }

    for (const pattern of this.config.ignorePatterns) {
      // Match against full path or just the relative portion
      if (
        minimatch(filepath, pattern, { matchBase: true }) ||
        minimatch(filepath, `**/${pattern}`)
      ) {
        return true;
      }
    }

    return false;
  }
}
