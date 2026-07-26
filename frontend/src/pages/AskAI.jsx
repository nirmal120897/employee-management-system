import { useState, useRef, useEffect } from "react";
import axios from "../api/api.js";

function AskAI() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Poocho company policies ke baare mein — leave, attendance rules, HR policies, jo bhi document upload hua hai.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("/documents/ask", {
        question: userMessage.content,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.data.answer,
          sources: res.data.data.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Kuch galat ho gaya, dubara try karo.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">AI Policy Assistant</h3>

      <div
        className="card shadow-sm p-3 mb-3"
        style={{
          height: "500px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`p-2 px-3 rounded-3 ${
                msg.role === "user"
                  ? "bg-success text-white"
                  : msg.isError
                    ? "bg-danger-subtle text-danger"
                    : "bg-light"
              }`}
              style={{ maxWidth: "75%", whiteSpace: "pre-wrap" }}
            >
              {msg.content}
              {msg.sources?.length > 0 && (
                <div className="mt-2 pt-2 border-top small text-muted">
                  Sources: {msg.sources.length} document chunk(s) matched
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="d-flex justify-content-start">
            <div className="p-2 px-3 rounded-3 bg-light text-muted small">
              Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleAsk} className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="e.g. How many paid leaves do employees get?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          className="btn btn-success"
          type="submit"
          disabled={loading || !question.trim()}
        >
          Ask
        </button>
      </form>
    </div>
  );
}

export default AskAI;
