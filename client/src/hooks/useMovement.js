import { useEffect, useRef } from "react";
import { walls } from "../utils/collisions";
import { isColliding } from "../utils/collisioncheck";
import { doors } from "../utils/doors";
import { chairs } from "../utils/chairs";

export default function useMovement(socket) {
  const pos = useRef({ x: 100, y: 100 });
  const keys = useRef({});
  const sitting = useRef(false);

  useEffect(() => {
    const isTyping = () => {
      const active = document.activeElement;
      return (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable)
      );
    };

    const down = (e) => {
      if (isTyping()) return; // 🚀 FIX
      keys.current[e.key.toLowerCase()] = true;
    };

    const up = (e) => {
      if (isTyping()) return; // 🚀 FIX
      keys.current[e.key.toLowerCase()] = false;

      if (e.key.toLowerCase() === "x") sitting.current = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const loop = setInterval(() => {
      let { x, y } = pos.current;
      const speed = 3;

      if (sitting.current) {
        socket.emit("move", pos.current);
        return;
      }

      let nx = x;
      let ny = y;

      if (keys.current["w"]) ny -= speed;
      if (keys.current["s"]) ny += speed;
      if (keys.current["a"]) nx -= speed;
      if (keys.current["d"]) nx += speed;

      nx = Math.max(0, Math.min(980, nx));
      ny = Math.max(0, Math.min(580, ny));

      if (!isColliding(nx, ny, walls)) {
        pos.current = { x: nx, y: ny };
      }

      doors.forEach((d) => {
        if (
          pos.current.x >= d.from.x &&
          pos.current.x <= d.from.x + d.from.w &&
          pos.current.y >= d.from.y &&
          pos.current.y <= d.from.y + d.from.h
        ) {
          pos.current = { ...d.to };
        }
      });

      if (keys.current["x"]) {
        chairs.forEach((c) => {
          if (
            Math.abs(pos.current.x - c.x) < 20 &&
            Math.abs(pos.current.y - c.y) < 20
          ) {
            pos.current = { ...c };
            sitting.current = true;
          }
        });
      }

      socket.emit("move", pos.current);
    }, 16);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      clearInterval(loop);
    };
  }, [socket]);
}