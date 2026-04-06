import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;
const PROXIMITY_RADIUS = 120;

// users: { [socketId]: { id, name, x, y, room } }
const users = {};

function getNearby(id) {
  const me = users[id];
  if (!me) return [];
  return Object.values(users)
    .filter((u) => {
      if (u.id === id) return false;
      const dx = u.x - me.x;
      const dy = u.y - me.y;
      return Math.sqrt(dx * dx + dy * dy) <= PROXIMITY_RADIUS;
    })
    .map((u) => ({ id: u.id, name: u.name }));
}

function broadcastUsers() {
  const snapshot = {};
  Object.values(users).forEach((u) => {
    snapshot[u.id] = { name: u.name, x: u.x, y: u.y };
  });
  io.emit("updateUsers", snapshot);
}

function broadcastNearby(id) {
  const nearby = getNearby(id);
  const socket = io.sockets.sockets.get(id);
  if (socket) socket.emit("nearbyUsers", nearby);

  // Also update nearby players' lists (they need to know about us too)
  nearby.forEach((u) => {
    const theirNearby = getNearby(u.id);
    const theirSocket = io.sockets.sockets.get(u.id);
    if (theirSocket) theirSocket.emit("nearbyUsers", theirNearby);
  });

  // Update anyone who WAS nearby but no longer is
  Object.keys(users).forEach((otherId) => {
    if (otherId === id) return;
    const theirNearby = getNearby(otherId);
    const theirSocket = io.sockets.sockets.get(otherId);
    if (theirSocket) theirSocket.emit("nearbyUsers", theirNearby);
  });
}

io.on("connection", (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  socket.on("join", ({ name }) => {
    users[socket.id] = {
      id: socket.id,
      name: name || "Anonymous",
      x: 300 + Math.random() * 200,
      y: 300 + Math.random() * 200,
    };

    // Send init to the joining player
    socket.emit("init", { id: socket.id });

    // Broadcast updated user list
    broadcastUsers();
    broadcastNearby(socket.id);

    console.log(`[+] ${name} joined. Total: ${Object.keys(users).length}`);
  });

  socket.on("move", ({ x, y, anim }) => {
    if (!users[socket.id]) return;

    users[socket.id].x = x;
    users[socket.id].y = y;

    // Broadcast animation to others
    socket.broadcast.emit("playerMove", { id: socket.id, anim });

    broadcastUsers();
    broadcastNearby(socket.id);
  });

  socket.on("chatMessage", ({ text }) => {
    if (!users[socket.id] || !text?.trim()) return;

    const nearby = getNearby(socket.id);

    const msg = {
      name: users[socket.id].name,
      text: text.trim().slice(0, 300),
      timestamp: Date.now(),
    };

    // Send to sender
    socket.emit("chatMessage", msg);

    // Send to nearby players only
    nearby.forEach((u) => {
      const target = io.sockets.sockets.get(u.id);
      if (target) target.emit("chatMessage", msg);
    });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`[-] ${user.name} disconnected.`);
      delete users[socket.id];
      broadcastUsers();
      // Update nearby lists for remaining players
      Object.keys(users).forEach((id) => {
        const theirNearby = getNearby(id);
        const s = io.sockets.sockets.get(id);
        if (s) s.emit("nearbyUsers", theirNearby);
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`✦ Virtual Cosmos server running on http://localhost:${PORT}`);
});
