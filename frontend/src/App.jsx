import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    const aiMsg = { role: "ai", text: data.reply };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "600px",
          height: "80vh",
          background: "#1e293b",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #334155",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#f1f5f9", margin: 0, fontSize: "20px" }}>
            🧠 TinyAI Chatbot
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "13px" }}>
            Built from scratch with PyTorch
          </p>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                color: "#475569",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              <p>Type exactly 3 words to start!</p>
              <p style={{ fontSize: "13px" }}>Example: "the cat sat"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  maxWidth: "75%",
                  fontSize: "14px",
                  background: msg.role === "user" ? "#3b82f6" : "#334155",
                  color: "#f1f5f9",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "#334155",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #334155",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            style={{
              flex: 1,
              background: "#334155",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              color: "#f1f5f9",
              fontSize: "14px",
              outline: "none",
            }}
            placeholder='Type 3 words... (e.g. "the cat sat")'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{
              background: "#3b82f6",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
