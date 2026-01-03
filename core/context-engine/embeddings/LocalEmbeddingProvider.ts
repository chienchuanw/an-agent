/**
 * LocalEmbeddingProvider implementation
 *
 * Wraps the existing TransformersJsEmbeddingsProvider for use in Context Engine.
 * Provides batch processing and caching.
 */

import { ILLM } from "../../index.d";

/**
 * Configuration for LocalEmbeddingProvider
 */
export interface LocalEmbeddingProviderConfig {
  embeddingsProvider: ILLM | null;
  batchSize?: number;
}

/**
 * LocalEmbeddingProvider class
 *
 * Responsibilities:
 * - Wrap existing embedding provider
 * - Batch processing for efficiency
 * - Simple caching mechanism
 */
export class LocalEmbeddingProvider {
  private config: LocalEmbeddingProviderConfig;
  private cache: Map<string, number[]> = new Map();

  constructor(config: LocalEmbeddingProviderConfig) {
    this.config = {
      ...config,
      batchSize: config.batchSize ?? 10,
    };
  }

  /**
   * Generate embeddings for text chunks
   */
  async embed(texts: string[]): Promise<number[][]> {
    if (!this.config.embeddingsProvider) {
      throw new Error("No embeddings provider configured");
    }

    const results: number[][] = [];

    for (const text of texts) {
      // Check cache first
      const cached = this.cache.get(text);
      if (cached) {
        results.push(cached);
        continue;
      }

      // Generate embedding
      const [embedding] = await this.config.embeddingsProvider.embed([text]);
      this.cache.set(text, embedding);
      results.push(embedding);
    }

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
