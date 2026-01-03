/**
 * Type definitions for the Indexer module
 */

/**
 * File change types
 */
export enum FileChangeType {
  CREATED = "created",
  MODIFIED = "modified",
  DELETED = "deleted",
}

/**
 * File change event
 */
export interface FileChangeEvent {
  type: FileChangeType;
  filepath: string;
  timestamp: number;
}

/**
 * File watcher configuration
 */
export interface FileWatcherConfig {
  debounceMs?: number;
  ignorePatterns?: string[];
}

/**
 * Event emitter interface for FileWatcher
 */
export interface IFileWatcherEventEmitter {
  on(event: "change", listener: (event: FileChangeEvent) => void): void;
  off(event: "change", listener: (event: FileChangeEvent) => void): void;
  emit(event: "change", data: FileChangeEvent): void;
}
