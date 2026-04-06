import { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import { io } from "socket.io-client";
import ChatBox from "./components/ChatBox";

const PROXIMITY_RADIUS = 120;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const SPEED = 220;

const ROOMS = [
  { x: 120,  y: 100,  w: 380, h: 260, label: "DSA",          color: 0x1e40af, accent: 0x3b82f6 },
  { x: 580,  y: 100,  w: 380, h: 260, label: "UI / UX",      color: 0x6b21a8, accent: 0xa855f7 },
  { x: 1040, y: 100,  w: 380, h: 260, label: "MERN",         color: 0x065f46, accent: 0x10b981 },
  { x: 120,  y: 440,  w: 380, h: 260, label: "System Design",color: 0x92400e, accent: 0xf59e0b },
  { x: 580,  y: 440,  w: 380, h: 260, label: "DevOps",       color: 0x1e3a5f, accent: 0x38bdf8 },
  { x: 1040, y: 440,  w: 380, h: 260, label: "Open Space",   color: 0x3f3f46, accent: 0xa1a1aa },
];

export default function Game({ username }) {
  const [socketInstance, setSocketInstance] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    setSocketInstance(socket);

    let game;
    let player;
    let playerLabel;
    let cursors;
    let players = {};
    let myId;
    let proximityCircle;
    let lastEmit = 0;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      backgroundColor: "#0f172a",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: { preload, create, update },
    };

    function preload() {
      this.load.spritesheet("player", "https://labs.phaser.io/assets/sprites/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
      });
    }

    function create() {
      const scene = this;

      // Disable global capture so keyboard events still reach the DOM (chat input)
      scene.input.keyboard.disableGlobalCapture();

      socket.emit("join", { name: username });

      // ── WORLD ──────────────────────────────────────────────
      scene.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x1e293b).setOrigin(0);

      // Subtle grid
      const grid = scene.add.graphics();
      grid.lineStyle(1, 0x334155, 0.3);
      for (let x = 0; x <= WORLD_WIDTH; x += 80) grid.lineBetween(x, 0, x, WORLD_HEIGHT);
      for (let y = 0; y <= WORLD_HEIGHT; y += 80) grid.lineBetween(0, y, WORLD_WIDTH, y);

      // ── ROOMS ──────────────────────────────────────────────
      ROOMS.forEach((r) => drawRoom(scene, r));

      // ── PHYSICS WORLD BOUNDS ──────────────────────────────
      scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // ── CURSORS (with capture=false so letters reach chat input) ──
      const { KeyCodes } = Phaser.Input.Keyboard;
      const addKey = (code) => scene.input.keyboard.addKey(code, false); // false = don't preventDefault

      cursors = {
        up:       addKey(KeyCodes.W),
        down:     addKey(KeyCodes.S),
        left:     addKey(KeyCodes.A),
        right:    addKey(KeyCodes.D),
        upArr:    addKey(KeyCodes.UP),
        downArr:  addKey(KeyCodes.DOWN),
        leftArr:  addKey(KeyCodes.LEFT),
        rightArr: addKey(KeyCodes.RIGHT),
      };

      // ── ANIMATIONS ──────────────────────────────────────
      scene.anims.create({ key: "left",  frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
      scene.anims.create({ key: "right", frames: scene.anims.generateFrameNumbers("player", { start: 5, end: 8 }), frameRate: 10, repeat: -1 });
      scene.anims.create({ key: "idle",  frames: [{ key: "player", frame: 4 }] });
      scene.anims.create({ key: "up",    frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
      scene.anims.create({ key: "down",  frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

      // ── SOCKET: INIT ──────────────────────────────────
      socket.on("init", (data) => {
        myId = data.id;

        player = scene.physics.add.sprite(300, 300, "player").setDepth(10);
        player.setCollideWorldBounds(true);

        // Proximity glow ring
        proximityCircle = scene.add.circle(player.x, player.y, PROXIMITY_RADIUS, 0x38bdf8, 0.07).setDepth(5);

        // Name label
        playerLabel = scene.add
          .text(player.x, player.y - 38, username, {
            fontSize: "12px",
            fontFamily: "'Courier New', monospace",
            color: "#e2e8f0",
            stroke: "#0f172a",
            strokeThickness: 3,
            padding: { x: 4, y: 2 },
          })
          .setOrigin(0.5, 1)
          .setDepth(11);

        players[myId] = { sprite: player, label: playerLabel };

        scene.cameras.main.startFollow(player, true, 0.08, 0.08);
        scene.cameras.main.setZoom(1.1);
        scene.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      });

      // ── SOCKET: UPDATE USERS ─────────────────────────
      socket.on("updateUsers", (users) => {
        // Remove disconnected players
        Object.keys(players).forEach((id) => {
          if (!users[id] && id !== myId) {
            players[id].sprite.destroy();
            players[id].label.destroy();
            if (players[id].indicator) players[id].indicator.destroy();
            delete players[id];
          }
        });

        Object.keys(users).forEach((id) => {
          if (id === myId) return;

          if (!players[id]) {
            const sprite = scene.physics.add.sprite(users[id].x, users[id].y, "player").setDepth(10);
            const label = scene.add
              .text(users[id].x, users[id].y - 38, users[id].name, {
                fontSize: "12px",
                fontFamily: "'Courier New', monospace",
                color: "#94a3b8",
                stroke: "#0f172a",
                strokeThickness: 3,
                padding: { x: 4, y: 2 },
              })
              .setOrigin(0.5, 1)
              .setDepth(11);

            players[id] = { sprite, label };
          } else {
            // Smooth lerp for remote players
            const p = players[id];
            p.sprite.x = Phaser.Math.Linear(p.sprite.x, users[id].x, 0.2);
            p.sprite.y = Phaser.Math.Linear(p.sprite.y, users[id].y, 0.2);
            p.label.setPosition(p.sprite.x, p.sprite.y - 38);
          }
        });
      });

      // ── SOCKET: NEARBY ──────────────────────────────
      socket.on("nearbyUsers", (data) => {
        setNearby(data);

        // Tint nearby players green
        Object.keys(players).forEach((id) => {
          if (id === myId) return;
          const isNearby = data.some((u) => u.id === id);
          players[id].sprite.setTint(isNearby ? 0x86efac : 0xffffff);
        });
      });

      // ── SOCKET: PLAYER ANIMATIONS ───────────────────
      socket.on("playerMove", ({ id, anim }) => {
        if (players[id] && id !== myId) {
          players[id].sprite.anims.play(anim, true);
        }
      });
    }

    function update(time) {
      if (!player) return;

      // If user is typing in chat, stop movement but still allow key events to reach input
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        player.setVelocity(0);
        player.anims.play("idle", true);
        return;
      }

      player.setVelocity(0);
      let anim = "idle";
      let moved = false;

      if (cursors.left.isDown || cursors.leftArr.isDown) {
        player.setVelocityX(-SPEED); anim = "left"; moved = true;
      } else if (cursors.right.isDown || cursors.rightArr.isDown) {
        player.setVelocityX(SPEED); anim = "right"; moved = true;
      }

      if (cursors.up.isDown || cursors.upArr.isDown) {
        player.setVelocityY(-SPEED); if (!moved) anim = "up"; moved = true;
      } else if (cursors.down.isDown || cursors.downArr.isDown) {
        player.setVelocityY(SPEED); if (!moved) anim = "down"; moved = true;
      }

      player.anims.play(anim, true);

      // Update label and proximity ring positions
      playerLabel.setPosition(player.x, player.y - 38);
      proximityCircle.setPosition(player.x, player.y);

      // Detect current room
      const room = ROOMS.find(
        (r) => player.x >= r.x && player.x <= r.x + r.w && player.y >= r.y && player.y <= r.y + r.h
      );
      setCurrentRoom(room ? room.label : null);

      // Throttle emit to ~20/s
      if (time - lastEmit > 50) {
        socket.emit("move", { x: Math.round(player.x), y: Math.round(player.y), anim });
        lastEmit = time;
      }
    }

    game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
      socket.disconnect();
    };
  }, [username]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div id="game-container" style={{ width: "100%", height: "100%" }} />

      {/* Room indicator */}
      {currentRoom && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(56,189,248,0.3)", borderRadius: 8,
          padding: "6px 18px", color: "#38bdf8",
          fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold",
          letterSpacing: 2, zIndex: 100,
          boxShadow: "0 0 20px rgba(56,189,248,0.15)",
        }}>
          ⬡ {currentRoom.toUpperCase()}
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: "fixed", bottom: 16, right: 16,
        background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
        padding: "8px 14px", color: "#64748b",
        fontFamily: "'Courier New', monospace", fontSize: 11,
        zIndex: 100, lineHeight: 1.7,
      }}>
        WASD / ↑↓←→ to move
      </div>

      {socketInstance && (
        <ChatBox socket={socketInstance} nearby={nearby} username={username} />
      )}
    </div>
  );
}

function drawRoom(scene, r) {
  // Shadow
  scene.add.rectangle(r.x + 4, r.y + 4, r.w, r.h, 0x000000, 0.4).setOrigin(0);

  // Floor
  scene.add.rectangle(r.x, r.y, r.w, r.h, r.color, 0.9).setOrigin(0);

  // Accent border top
  scene.add.rectangle(r.x, r.y, r.w, 4, r.accent).setOrigin(0);

  // Inner glow line
  const g = scene.add.graphics();
  g.lineStyle(1, r.accent, 0.3);
  g.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);

  // Label
  scene.add.text(r.x + 14, r.y + 14, r.label, {
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
    color: "#e2e8f0",
    fontStyle: "bold",
    letterSpacing: 2,
  }).setDepth(2);

  // Desks (small rectangles inside rooms)
  const desk = scene.add.graphics();
  desk.fillStyle(r.accent, 0.25);
  const cols = Math.floor((r.w - 40) / 80);
  for (let i = 0; i < cols; i++) {
    desk.fillRect(r.x + 20 + i * 80, r.y + 60, 60, 36);
  }
}