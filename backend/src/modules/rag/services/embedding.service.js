import { Ollama } from "ollama";

const DEFAULT_MODEL = "nomic-embed-text";
const DEFAULT_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isConnectionError = (error) => {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("network") ||
    message.includes("connect")
  );
};

/**
 * Generates vector embeddings via Ollama for the RAG document pipeline.
 * Deliberately knows nothing about the database or HTTP layer.
 */
export class EmbeddingService {
  constructor(options = {}) {
    this.client = new Ollama({
      host: options.host ?? DEFAULT_HOST,
    });
    this.model =
      options.model ?? process.env.OLLAMA_EMBED_MODEL ?? DEFAULT_MODEL;
  }

  async generateEmbedding(text) {
    if (!text || !text.trim()) {
      throw createServiceError("Cannot generate embedding for empty text", 400);
    }

    try {
      const response = await this.client.embed({
        model: this.model,
        input: text.trim(),
      });

      const embedding = response.embeddings?.[0];

      if (!embedding?.length) {
        throw createServiceError(
          "Ollama returned an empty embedding vector",
          502,
        );
      }

      return embedding;
    } catch (error) {
      if (error?.statusCode) {
        throw error;
      }

      if (isConnectionError(error)) {
        throw createServiceError(
          "Unable to reach Ollama. Ensure the Ollama server is running and OLLAMA_HOST is correct",
          503,
        );
      }

      const message =
        error instanceof Error ? error.message : "Unknown embedding error";

      if (/model.*not found|pull/i.test(message)) {
        throw createServiceError(
          `Embedding model "${this.model}" is not available. Run: ollama pull ${this.model}`,
          503,
        );
      }

      throw createServiceError(
        `Failed to generate embedding: ${message}`,
        502,
      );
    }
  }
}

export const embeddingService = new EmbeddingService();
