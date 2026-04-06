import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function Canvas({ users, myId }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 1000,
      height: 600,
      backgroundColor: 0x1e293b
    });

    canvasRef.current.innerHTML = "";
    canvasRef.current.appendChild(app.view);

    appRef.current = app;

    const world = new PIXI.Container();
    worldRef.current = world;
    app.stage.addChild(world);

    // FLOOR
    const floor = new PIXI.Graphics();
    floor.beginFill(0x2d2d2d);
    floor.drawRect(0, 0, 1000, 600);
    floor.endFill();
    world.addChild(floor);

    // WALLS
    const walls = new PIXI.Graphics();
    walls.beginFill(0x444444);

    walls.drawRect(300, 0, 20, 300);
    walls.drawRect(600, 300, 20, 300);

    walls.endFill();
    world.addChild(walls);

    // DESKS
    const desks = new PIXI.Graphics();
    desks.beginFill(0x3b82f6);

    for (let i = 0; i < 5; i++) {
      desks.drawRect(350 + i * 100, 100, 60, 40);
    }

    desks.endFill();
    world.addChild(desks);

    // LABELS
    const style = { fontSize: 16, fill: "white" };

    const mern = new PIXI.Text("MERN", style);
    mern.x = 80; mern.y = 20;
    world.addChild(mern);

    const ui = new PIXI.Text("UI/UX", style);
    ui.x = 400; ui.y = 20;
    world.addChild(ui);

    const dsa = new PIXI.Text("DSA", style);
    dsa.x = 700; dsa.y = 350;
    world.addChild(dsa);

  }, []);

  useEffect(() => {
    if (!worldRef.current) return;

    const world = worldRef.current;

    while (world.children.length > 5) {
      world.removeChildAt(5);
    }

    Object.keys(users).forEach(id => {
      const { x, y } = users[id];

      const player = new PIXI.Graphics();
      player.beginFill(id === myId ? 0x3b82f6 : 0xef4444);
      player.drawCircle(0, 0, 10);
      player.endFill();

      player.x = x;
      player.y = y;

      world.addChild(player);
    });

  }, [users, myId]);

  return <div ref={canvasRef}></div>;
}