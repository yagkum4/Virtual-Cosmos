import { useEffect, useState } from "react";

export default function ChatBox({ socket, nearby }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });
  }, [socket]);

  if (nearby.length === 0) {
    return <p>Move closer to chat</p>;
  }

  const send = () => {
    socket.emit("sendMessage", {
      to: nearby[0],
      message
    });

    setChat([...chat, { from: "Me", message }]);
    setMessage("");
  };

  return (
    <div>
      <h3>💬 Chat</h3>

      <div style={{ height: "200px", overflow: "auto" }}>
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.from}:</b> {c.message}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}