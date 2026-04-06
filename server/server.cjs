const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (data) => {
    users[socket.id] = {
      x: 100,
      y: 100,
      name: data.name || "Guest"
    };

    socket.emit("init", { id: socket.id });
    io.emit("updateUsers", users);
  });

  socket.on("move", (pos) => {
    if (users[socket.id]) {
      users[socket.id].x = pos.x;
      users[socket.id].y = pos.y;
    }

    io.emit("updateUsers", users);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUsers", users);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});