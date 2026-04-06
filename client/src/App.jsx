import { useState } from "react";
import Game from "./Game";

function App() {
  const [name, setName] = useState("");
  const [start, setStart] = useState(false);

  if (!start) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#0f172a",
        color: "white"
      }}>
        <h1>Enter Your Name</h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            padding: "10px",
            fontSize: "16px",
            marginBottom: "10px"
          }}
        />
        <button onClick={() => setStart(true)}>
          Enter World
        </button>
      </div>
    );
  }

  return <Game username={name} />;
}

export default App;