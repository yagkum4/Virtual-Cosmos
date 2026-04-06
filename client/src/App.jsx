import { useState, useEffect } from "react";
import Game from "./Game";
import "./App.css";

const ROOMS = ["DSA", "UI/UX", "MERN", "System Design", "DevOps", "Open Space"];

const ROOM_COLORS = {
  "DSA":           { bg: "#1e40af", glow: "#3b82f6" },
  "UI/UX":         { bg: "#6b21a8", glow: "#a855f7" },
  "MERN":          { bg: "#065f46", glow: "#10b981" },
  "System Design": { bg: "#92400e", glow: "#f59e0b" },
  "DevOps":        { bg: "#1e3a5f", glow: "#38bdf8" },
  "Open Space":    { bg: "#3f3f46", glow: "#a1a1aa" },
};

// Floating particles component
function Particles() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 0.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.6 + 0.1,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}
    </div>
  );
}

// Animated grid lines
function GridLines() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [entered, setEntered]   = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [error, setError]       = useState("");
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [focused, setFocused]   = useState(false);
  const [shaking, setShaking]   = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Inject keyframe animations into document head
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes floatUp {
        0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
      }
      @keyframes pulseRing {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-8px); }
        40%     { transform: translateX(8px); }
        60%     { transform: translateX(-5px); }
        80%     { transform: translateX(5px); }
      }
      @keyframes orbitSpin {
        from { transform: rotate(0deg) translateX(54px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(54px) rotate(-360deg); }
      }
      @keyframes orbitSpinRev {
        from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
        to   { transform: rotate(-360deg) translateX(38px) rotate(360deg); }
      }
      @keyframes hexPulse {
        0%,100% { opacity: 0.8; filter: brightness(1); }
        50%     { opacity: 1;   filter: brightness(1.3); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const enter = () => {
    const name = inputVal.trim();
    if (!name) {
      setError("Enter a call sign to continue.");
      triggerShake();
      return;
    }
    if (name.length > 20) {
      setError("Keep it under 20 characters.");
      triggerShake();
      return;
    }
    setUsername(name);
    setEntered(true);
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputVal(val);
    setCharCount(val.length);
    setError("");
  };

  if (entered) return <Game username={username} />;

  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "radial-gradient(ellipse at 60% 30%, #0c1a3a 0%, #0a0f1e 50%, #050810 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
    }}>

      {/* Background layers */}
      <GridLines />
      <Particles />

      {/* Ambient glow orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%",  width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%",  left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* ── MAIN CARD ── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "min(480px, 92vw)",
        animation: "fadeSlideUp 0.7s ease both",
      }}>

        {/* Card glass panel */}
        <div style={{
          background: "rgba(15,23,42,0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(56,189,248,0.18)",
          borderRadius: 20,
          padding: "40px 36px 32px",
          boxShadow: "0 0 80px rgba(56,189,248,0.07), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>

          {/* ── LOGO ── */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>

            {/* Orbit rings + hex logo */}
            <div style={{ position: "relative", display: "inline-block", width: 88, height: 88, marginBottom: 16 }}>
              {/* Outer ring */}
              <div style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                border: "1px solid rgba(56,189,248,0.2)",
              }} />
              {/* Pulsing ring */}
              <div style={{
                position: "absolute", inset: -8,
                borderRadius: "50%",
                border: "1px solid rgba(56,189,248,0.15)",
                animation: "pulseRing 2.5s ease-out infinite",
              }} />

              {/* Orbiting dot 1 */}
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                marginTop: -4, marginLeft: -4,
                width: 8, height: 8,
                animation: "orbitSpin 6s linear infinite",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
              </div>

              {/* Orbiting dot 2 */}
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                marginTop: -3, marginLeft: -3,
                width: 6, height: 6,
                animation: "orbitSpinRev 4s linear infinite",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 5px #a855f7" }} />
              </div>

              {/* Center hex */}
              <div style={{
                position: "absolute", inset: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36,
                animation: "hexPulse 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 12px rgba(56,189,248,0.6))",
              }}>
                ⬡
              </div>
            </div>

            {/* Title */}
            <div style={{
              fontSize: 22,
              fontWeight: "bold",
              letterSpacing: 5,
              background: "linear-gradient(90deg, #e2e8f0 0%, #38bdf8 40%, #a855f7 70%, #e2e8f0 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
              marginBottom: 6,
            }}>
              VIRTUAL COSMOS
            </div>

            <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>
              Multiplayer 2D Collaboration Space
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent)",
            marginBottom: 28,
          }} />

          {/* ── INPUT SECTION ── */}
          <div style={{ marginBottom: 20, animation: "fadeSlideUp 0.7s 0.15s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <label style={{
              display: "block",
              fontSize: 10,
              letterSpacing: 3,
              color: "#38bdf8",
              marginBottom: 8,
              textTransform: "uppercase",
            }}>
              CALL SIGN
            </label>

            {/* Input wrapper */}
            <div style={{
              position: "relative",
              animation: shaking ? "shake 0.4s ease" : "none",
            }}>
              {/* Glow border effect */}
              <div style={{
                position: "absolute", inset: -1,
                borderRadius: 10,
                background: focused
                  ? "linear-gradient(135deg, rgba(56,189,248,0.5), rgba(168,85,247,0.5))"
                  : "transparent",
                transition: "all 0.3s ease",
                pointerEvents: "none",
              }} />

              <input
                value={inputVal}
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && enter()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your username..."
                maxLength={20}
                autoFocus
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 48px 13px 16px",
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${focused ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 1,
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
              />

              {/* Character count */}
              <div style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 10,
                color: charCount > 16 ? "#f87171" : "#334155",
                fontFamily: "'Courier New', monospace",
                transition: "color 0.2s",
              }}>
                {charCount}/20
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                marginTop: 8,
                fontSize: 11,
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.5,
              }}>
                <span style={{ fontSize: 12 }}>⚠</span> {error}
              </div>
            )}
          </div>

          {/* ── ENTER BUTTON ── */}
          <button
            onClick={enter}
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(168,85,247,0.15) 100%)",
              border: "1px solid rgba(56,189,248,0.35)",
              borderRadius: 10,
              color: "#e2e8f0",
              fontSize: 12,
              fontFamily: "'Courier New', monospace",
              fontWeight: "bold",
              letterSpacing: 3,
              cursor: "pointer",
              transition: "all 0.25s ease",
              marginBottom: 28,
              animation: "fadeSlideUp 0.7s 0.25s ease both",
              animationFillMode: "forwards",
              opacity: 0,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(56,189,248,0.28) 0%, rgba(168,85,247,0.28) 100%)";
              e.target.style.borderColor = "rgba(56,189,248,0.6)";
              e.target.style.boxShadow = "0 0 24px rgba(56,189,248,0.2)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(168,85,247,0.15) 100%)";
              e.target.style.borderColor = "rgba(56,189,248,0.35)";
              e.target.style.boxShadow = "none";
              e.target.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => { e.target.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.target.style.transform = "translateY(-1px)"; }}
          >
            ENTER COSMOS →
          </button>

          {/* ── ROOMS GRID ── */}
          <div style={{ animation: "fadeSlideUp 0.7s 0.35s ease both", animationFillMode: "forwards", opacity: 0 }}>
            <div style={{
              fontSize: 9,
              letterSpacing: 3,
              color: "#334155",
              textTransform: "uppercase",
              marginBottom: 10,
              textAlign: "center",
            }}>
              Active Rooms
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
            }}>
              {ROOMS.map((room) => {
                const c = ROOM_COLORS[room];
                const isHovered = hoveredRoom === room;
                return (
                  <div
                    key={room}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{
                      padding: "7px 6px",
                      borderRadius: 7,
                      background: isHovered
                        ? `${c.bg}55`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isHovered ? c.glow + "55" : "rgba(255,255,255,0.06)"}`,
                      cursor: "default",
                      transition: "all 0.2s ease",
                      textAlign: "center",
                    }}
                  >
                    {/* Accent dot */}
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: c.glow,
                      margin: "0 auto 4px",
                      boxShadow: isHovered ? `0 0 8px ${c.glow}` : "none",
                      transition: "box-shadow 0.2s ease",
                    }} />
                    <div style={{
                      fontSize: 9,
                      color: isHovered ? "#e2e8f0" : "#475569",
                      letterSpacing: 0.5,
                      transition: "color 0.2s ease",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {room}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 10,
          color: "#1e293b",
          letterSpacing: 1.5,
          animation: "fadeSlideUp 0.7s 0.45s ease both",
          animationFillMode: "forwards",
          opacity: 0,
        }}>
          WASD / ARROW KEYS TO MOVE · PROXIMITY CHAT ENABLED
        </div>
      </div>
    </div>
  );
}