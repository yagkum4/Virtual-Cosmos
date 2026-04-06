import { useEffect } from "react";
import Phaser from "phaser";
import { io } from "socket.io-client";

export default function Game({ username }) {
  useEffect(() => {
    window.username = username; // store globally

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      backgroundColor: "#1e293b",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: {
        preload,
        create,
        update
      }
    };

    new Phaser.Game(config);
  }, []);

  return <div id="game-container"></div>;
}

// GLOBALS
let player;
let cursors;
let socket;
let players = {};
let myId;

// LOAD
function preload() {
  this.load.spritesheet(
    "player",
    "https://labs.phaser.io/assets/sprites/dude.png",
    { frameWidth: 32, frameHeight: 48 }
  );
}

// CREATE
function create() {
  this.physics.world.setBounds(0, 0, 2000, 1200);

  socket = io("http://localhost:5000");

  // JOIN WITH NAME
  socket.emit("join", { name: window.username });

  // 🟫 FLOOR
  const floor = this.add.graphics();
  floor.fillStyle(0x8b5a2b, 1);
  floor.fillRect(0, 0, 2000, 1200);

  for (let i = 0; i < 2000; i += 40) {
    floor.fillStyle(0x7a4e24, 0.3);
    floor.fillRect(i, 0, 20, 1200);
  }

  // 🌳 BORDER
  const trees = this.add.graphics();
  trees.fillStyle(0x14532d, 1);
  trees.fillRect(0, 0, 2000, 60);
  trees.fillRect(0, 1140, 2000, 60);
  trees.fillRect(0, 0, 60, 1200);
  trees.fillRect(1940, 0, 60, 1200);

  // 🏢 ROOMS
  drawRoom(this, 120, 120, 260, 200, "DSA");
  drawRoom(this, 450, 120, 260, 200, "FLUTTER");
  drawRoom(this, 780, 120, 260, 200, "FINANCE");

  drawRoom(this, 120, 400, 260, 200, "DATA");
  drawRoom(this, 450, 400, 260, 200, "PYTHON");

  drawRoom(this, 1100, 150, 600, 400, "DEV HALL");

  // 💻 DESKS
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      drawDeskCluster(this, 500 + col * 180, 350 + row * 150);
    }
  }

  // 🎮 CONTROLS
  cursors = this.input.keyboard.createCursorKeys();

  // 🎬 ANIMATIONS
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "player", frame: 4 }]
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // 🔥 INIT PLAYER
  socket.on("init", (data) => {
    myId = data.id;

    player = this.physics.add.sprite(100, 100, "player");
    player.setCollideWorldBounds(true);

    const text = this.add.text(100, 60, window.username, {
      color: "#fff"
    });

    players[myId] = { sprite: player, text };

    this.cameras.main.startFollow(player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 2000, 1200);
  });

  // 🔥 UPDATE USERS
  socket.on("updateUsers", (serverUsers) => {
    Object.keys(serverUsers).forEach((id) => {
      const data = serverUsers[id];

      if (!players[id]) {
        const sprite = this.physics.add.sprite(data.x, data.y, "player");

        const text = this.add.text(data.x, data.y - 40, data.name, {
          color: "#fff"
        });

        players[id] = { sprite, text };
      }

      if (id !== myId) {
        players[id].sprite.setPosition(data.x, data.y);
      }

      players[id].text.setPosition(
        players[id].sprite.x - 20,
        players[id].sprite.y - 40
      );
    });
  });

  // 🔍 ZOOM
  this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
    const cam = this.cameras.main;
    cam.zoom = Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.5, 2);
  });
}

// UPDATE
function update() {
  if (!player) return;

  const speed = 200;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    player.anims.play("right", true);
  } else {
    player.anims.play("turn");
  }

  if (cursors.up.isDown) player.setVelocityY(-speed);
  if (cursors.down.isDown) player.setVelocityY(speed);

  // SEND POSITION
  socket.emit("move", {
    x: player.x,
    y: player.y
  });
}

// ROOM
function drawRoom(scene, x, y, w, h, label) {
  const room = scene.add.rectangle(x, y, w, h, 0x3b82f6);
  room.setOrigin(0);
  room.setStrokeStyle(2, 0xffffff);

  scene.add.text(x + 10, y + 10, label, {
    color: "#fff",
    fontSize: "16px"
  });
}

// DESKS
function drawDeskCluster(scene, x, y) {
  scene.add.rectangle(x + 5, y + 5, 80, 50, 0x000000, 0.2);
  scene.add.rectangle(x, y, 80, 50, 0x1e40af);

  scene.add.circle(x - 30, y, 10, 0x8b5a2b);
  scene.add.circle(x + 30, y, 10, 0x8b5a2b);
  scene.add.circle(x, y - 30, 10, 0x8b5a2b);
  scene.add.circle(x, y + 30, 10, 0x8b5a2b);
}