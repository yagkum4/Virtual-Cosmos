# 🌌 Virtual Cosmos

A real-time multiplayer virtual office built with **React**, **Phaser 3**, and **Socket.IO** — where users can walk around a 2D world, enter topic-based rooms, and chat with nearby players.

---

## ✨ Features

- 🕹️ **2D Movement** — Navigate the world using `WASD` or arrow keys
- 👥 **Real-time Multiplayer** — See other users move around live via WebSockets
- 💬 **Proximity Chat** — Chat only with users who are nearby (within radius)
- 🏢 **Topic Rooms** — Enter rooms like DSA, MERN, UI/UX, DevOps, System Design & Open Space
- 🟢 **Proximity Indicator** — Nearby players are highlighted with a green tint
- 📡 **Live Sync** — Player positions and animations are synced across all clients at ~20 updates/sec

---

## 🗂️ Project Structure

```
virtual-cosmos/
├── client/
│   └── src/
│       ├── utils/
│       │   ├── chairs.js
│       │   ├── collisioncheck.js
│       │   ├── collisions.js
│       │   └── doors.js
│       ├── components/
│       │   └── ChatBox.jsx
│       ├── App.jsx
│       ├── Game.jsx
│       ├── main.jsx
│       ├── App.css
│       └── index.css
└── server/
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/virtual-cosmos.git
cd virtual-cosmos
```

**2. Install server dependencies**
```bash
cd server
npm install
```

**3. Install client dependencies**
```bash
cd ../client
npm install
```

### Running the App

**Start the server**
```bash
cd server
node server.js
```

**Start the client** (in a new terminal)
```bash
cd client
npm run dev
```

Then open your browser at `http://localhost:5173`

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W` or `↑` | Move Up |
| `S` or `↓` | Move Down |
| `A` or `←` | Move Left |
| `D` or `→` | Move Right |

> **Note:** Movement is automatically disabled while typing in the chat box.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| 2D Game Engine | Phaser 3 |
| Real-time Communication | Socket.IO |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |

---

## 🌐 Rooms

| Room | Description |
|------|-------------|
| 🔵 DSA | Data Structures & Algorithms |
| 🟣 UI / UX | Design & User Experience |
| 🟢 MERN | Full Stack Web Development |
| 🟡 System Design | Architecture & Scalability |
| 🔷 DevOps | CI/CD, Cloud & Infrastructure |
| ⬜ Open Space | General Discussion |

---

## 📡 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Player joins with their username |
| `init` | Server → Client | Returns player's socket ID |
| `move` | Client → Server | Sends updated position and animation |
| `updateUsers` | Server → Client | Broadcasts all players' positions |
| `nearbyUsers` | Server → Client | List of players within proximity radius |
| `playerMove` | Server → Client | Broadcasts animation state of a player |

---

## 📸 Screenshots

> _Add screenshots here after deployment_

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ using React, Phaser 3 & Socket.IO
