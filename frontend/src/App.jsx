import { useState, useEffect } from "react";
import bg from "./assets/background.png";
import {
  SendHorizontal,
  Trash2,
  Plus,
  RefreshCw,
  Brain,
  Database,
  Rocket,
} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [newSentence, setNewSentence] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [retraining, setRetraining] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logInterval, setLogInterval] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("http://127.0.0.1:8000/data");
    const data = await res.json();
    setSentences(data.sentences);
  };

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

  const retrain = async () => {
    setRetraining(true);
    setLogs([]);
    setDataMessage("");
    await fetch("http://127.0.0.1:8000/retrain", { method: "POST" });

    const interval = setInterval(async () => {
      const res = await fetch("http://127.0.0.1:8000/retrain/logs");
      const data = await res.json();
      console.log("Logs:", data.logs);
      setLogs(data.logs);

      if (data.logs.some((log) => log.includes("complete"))) {
        clearInterval(interval);
        setRetraining(false);
        setDataMessage("✅ Retrained successfully!");
        setTimeout(() => setDataMessage(""), 3000);
      }
    }, 1000);

    setLogInterval(interval);
  };

  const addSentence = async () => {
    if (!newSentence.trim()) return;
    await fetch("http://127.0.0.1:8000/data/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: newSentence }),
    });
    setDataMessage("✅ Sentence added!");
    setNewSentence("");
    fetchData();
    setTimeout(() => setDataMessage(""), 2000);
  };

  const removeSentence = async (sentence) => {
    await fetch("http://127.0.0.1:8000/data/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });
    setDataMessage("🗑️ Sentence removed!");
    fetchData();
    setTimeout(() => setDataMessage(""), 2000);
  };

  const glassStyle = {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-5"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div
        className="relative z-10 flex gap-4"
        style={{
          width: logs.length > 0 ? "1400px" : "1100px",
          height: "85vh",
          transition: "width 0.3s ease",
        }}
      >
        {/* Chat Panel */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={glassStyle}
        >
          {/* Header */}
          <div
            className="p-5 flex flex-col items-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Brain size={22} color="#facc15" />
              <h1 className="text-xl font-bold text-slate-100 m-0">
                Neural Network Tester
              </h1>
            </div>
            <p className="text-slate-500 text-sm m-0">
              Built from scratch with PyTorch
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-slate-500 text-center mt-10">
                <p className="text-base">Type exactly 3 words to start!</p>
                <p className="text-sm">Example: "the cat sat"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="px-4 py-2 rounded-xl text-sm text-slate-100"
                  style={{
                    maxWidth: "75%",
                    background:
                      msg.role === "user"
                        ? "rgba(59, 130, 246, 0.8)"
                        : "rgba(51, 65, 85, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 flex items-center gap-2"
                  style={{
                    background: "rgba(51, 65, 85, 0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <RefreshCw size={12} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="p-4 flex gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              className="flex-1 rounded-lg px-4 py-2 text-sm text-slate-100 outline-none"
              style={{
                background: "rgba(51, 65, 85, 0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              placeholder='Type 3 words... (e.g. "the cat sat")'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-sm cursor-pointer border-none flex items-center gap-2"
            >
              <SendHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Dataset Panel */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{ width: "320px", ...glassStyle }}
        >
          {/* Header */}
          <div
            className="p-5 flex flex-col items-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <Database size={18} color="#a78bfa" />
              <h2 className="text-slate-100 m-0 text-base font-bold">
                Dataset
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              {sentences.length} sentences
            </p>
          </div>

          {/* Sentences List */}
          <div className="flex-1 overflow-y-auto p-3">
            {sentences.map((sentence, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 mb-2 rounded-lg gap-2"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-slate-400 text-xs flex-1">
                  {sentence}
                </span>
                <button
                  onClick={() => removeSentence(sentence)}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs px-2 py-1 rounded-md cursor-pointer border-none flex-shrink-0 flex items-center"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Sentence */}
          <div
            className="p-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {dataMessage && (
              <p className="text-green-400 text-xs text-center mb-2">
                {dataMessage}
              </p>
            )}
            <input
              className="w-full rounded-lg px-3 py-2 text-slate-100 text-sm outline-none mb-2"
              style={{
                background: "rgba(51, 65, 85, 0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxSizing: "border-box",
              }}
              placeholder="Add new sentence..."
              value={newSentence}
              onChange={(e) => setNewSentence(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSentence()}
            />
            <button
              onClick={addSentence}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm cursor-pointer border-none mb-2 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Add Sentence
            </button>
            <button
              onClick={retrain}
              disabled={retraining}
              className={`w-full text-white font-bold py-2 rounded-lg text-sm border-none flex items-center justify-center gap-2 ${
                retraining
                  ? "bg-slate-500 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800 cursor-pointer"
              }`}
            >
              {retraining ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <Rocket size={14} />
                  Retrain AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Training Logs Panel */}
        {logs.length > 0 && (
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{ width: "280px", ...glassStyle }}
          >
            {/* Header */}
            <div
              className="p-5 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <RefreshCw
                size={18}
                color="#a78bfa"
                className={retraining ? "animate-spin" : ""}
              />
              <div>
                <h2 className="text-slate-100 m-0 text-base font-bold">
                  Training Logs
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {retraining ? "Training in progress..." : "Complete!"}
                </p>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-3">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className={`text-xs m-0 mb-1 font-mono break-all ${
                    log.includes("complete")
                      ? "text-green-400"
                      : log.includes("Loss")
                        ? "text-blue-400"
                        : log.includes("Vocab")
                          ? "text-yellow-400"
                          : "text-slate-400"
                  }`}
                >
                  {log}
                </p>
              ))}
            </div>

            {/* Status */}
            <div
              className="p-3 flex items-center justify-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              {retraining ? (
                <span className="text-purple-400 text-xs flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" />
                  Training...
                </span>
              ) : (
                <span className="text-green-400 text-xs">
                  ✅ Training complete!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
