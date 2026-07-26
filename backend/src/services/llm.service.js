const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3.2";

export const chatCompletion = async (messages) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: CHAT_MODEL, messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.message?.content) {
      throw new Error("Ollama returned no message content");
    }

    return data.message.content;
  } catch (error) {
    console.error("[llm.service] Ollama chat call failed:", error.message);
    const err = new Error(
      `Failed to generate AI response. Make sure Ollama is running and '${CHAT_MODEL}' is pulled (ollama pull ${CHAT_MODEL}).`
    );
    err.statusCode = 502;
    throw err;
  }
};