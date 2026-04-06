import { useState, useEffect, useRef } from "react";

export default function ChatBox({ socket, nearby, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const isConnected = nearby.length > 0;

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev.slice(-99), { ...msg, id: Date.now() + Math.random() }]);
      if (!isOpen) setUnread((u) => u + 1);
    });
    return () => socket.off("chatMessage");
  }, [socket, isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  const send = () => {
    const text = input.trim();
    if (!text || !isConnected) return;
    socket.emit("chatMessage", { text });
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 20, zIndex: 200,
      width: 300, display: "flex", flexDirection: "column",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 14px",
          background: "rgba(15,23,42,0.92)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: isOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: isOpen ? "10px 10px 0 0" : "10px",
          color: "#e2e8f0", cursor: "pointer", width: "100%",
          fontSize: 12, letterSpacing: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isConnected ? "#4ade80" : "#f87171",
            boxShadow: isConnected ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          }} />
          <span style={{ color: isConnected ? "#e2e8f0" : "#64748b" }}>
            {isConnected
              ? `${nearby.length} NEARBY — CHAT OPEN`
              : "NO ONE NEARBY"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isOpen && unread > 0 && (
            <span style={{
              background: "#38bdf8", color: "#0f172a",
              borderRadius: "50%", width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: "bold",
            }}>
              {unread}
            </span>
          )}
          <span style={{ color: "#475569", fontSize: 14 }}>{isOpen ? "▼" : "▲"}</span>
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <>
          {/* Nearby users list */}
          {isConnected && (
            <div style={{
              background: "rgba(15,23,42,0.88)", backdropFilter: "blur(10px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              padding: "6px 14px",
              display: "flex", gap: 6, flexWrap: "wrap",
            }}>
              {nearby.map((u) => (
                <span key={u.id} style={{
                  fontSize: 10, background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.25)",
                  color: "#38bdf8", borderRadius: 4, padding: "2px 7px",
                  letterSpacing: 0.5,
                }}>
                  {u.name}
                </span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{
            height: 220, overflowY: "auto", padding: "10px 14px",
            background: "rgba(15,23,42,0.88)", backdropFilter: "blur(10px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.length === 0 && (
              <div style={{
                color: "#334155", fontSize: 11, textAlign: "center",
                marginTop: 60, letterSpacing: 1,
              }}>
                {isConnected
                  ? "SAY SOMETHING..."
                  : "WALK NEAR SOMEONE TO CHAT"}
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.name === username;
              return (
                <div key={msg.id} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}>
                  {!isMine && (
                    <span style={{ fontSize: 9, color: "#38bdf8", marginBottom: 2, letterSpacing: 1 }}>
                      {msg.name}
                    </span>
                  )}
                  <div style={{
                    maxWidth: "80%", padding: "6px 10px",
                    background: isMine ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isMine ? "rgba(56,189,248,0.25)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: isMine ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                    color: isMine ? "#bae6fd" : "#cbd5e1",
                    fontSize: 12, lineHeight: 1.5, wordBreak: "break-word",
                  }}>
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <span style={{ fontSize: 9, color: "#1e3a5f", marginTop: 2 }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            display: "flex", gap: 0,
            background: "rgba(15,23,42,0.92)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "0 0 10px 10px", overflow: "hidden",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!isConnected}
              placeholder={isConnected ? "Type a message..." : "Move near someone..."}
              style={{
                flex: 1, background: "transparent",
                border: "none", outline: "none",
                padding: "10px 14px", color: "#e2e8f0",
                fontFamily: "'Courier New', monospace", fontSize: 12,
                caretColor: "#38bdf8",
                opacity: isConnected ? 1 : 0.4,
              }}
            />
            <button
              onClick={send}
              disabled={!isConnected || !input.trim()}
              style={{
                background: isConnected && input.trim() ? "rgba(56,189,248,0.15)" : "transparent",
                border: "none", borderLeft: "1px solid rgba(255,255,255,0.06)",
                color: isConnected && input.trim() ? "#38bdf8" : "#334155",
                padding: "10px 16px", cursor: isConnected ? "pointer" : "not-allowed",
                fontFamily: "'Courier New', monospace", fontSize: 12,
                transition: "all 0.15s",
              }}
            >
              SEND
            </button>
          </div>
        </>
      )}
    </div>
  );
}
