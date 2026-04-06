import { useState } from "react";
import Game from "./Game";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState("");
  const [entered, setEntered] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");

  const enter = () => {
    const name = inputVal.trim();
    if (!name) { setError("Enter a name to continue."); return; }
    if (name.length > 20) { setError("Keep it under 20 characters."); return; }
    setUsername(name);
    setEntered(true);
  };

  if (entered) return <Game username={username} />;

  return (
    <div className="entry-screen">
      {/* Star field */}
      <div className="stars" />
      <div className="stars2" />
      <div className="stars3" />

      <div className="entry-card">
        <div className="entry-logo">⬡</div>
        <h1 className="entry-title">VIRTUAL COSMOS</h1>
        <p className="entry-subtitle">A multiplayer 2D space for real-time collaboration</p>

        <div className="entry-form">
          <label className="entry-label">CALL SIGN</label>
          <input
            className="entry-input"
            value={inputVal}
            onChange={(e) => { setInputVal(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && enter()}
            placeholder="Enter your username..."
            maxLength={20}
            autoFocus
          />
          {error && <p className="entry-error">{error}</p>}
          <button className="entry-button" onClick={enter}>
            ENTER COSMOS
          </button>
        </div>

        <div className="entry-rooms">
          {["DSA", "UI/UX", "MERN", "System Design", "DevOps", "Open Space"].map((r) => (
            <span key={r} className="entry-room-badge">{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
