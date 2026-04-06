import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function useSocket() {
  const [users, setUsers] = useState({});
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    socket.on("init", ({ id }) => setMyId(id));
    socket.on("updateUsers", setUsers);
  }, []);

  return { socket, users, myId };
}