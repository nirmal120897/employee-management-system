const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export const generateEmbedding = async (text) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embeddings request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error("Ollama returned no embedding - is the model pulled? Run: ollama pull nomic-embed-text");
    }

    return data.embedding;
  } catch (error) {
    console.error("[embedding.service] Ollama embedding call failed:", error.message);
    const err = new Error(
      "Failed to generate embedding. Make sure Ollama is running (ollama serve) and nomic-embed-text is pulled."
    );
    err.statusCode = 502;
    throw err;
  }
};