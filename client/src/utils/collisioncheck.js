export function isColliding(x, y, walls) {
  const size = 16;

  return walls.some(w =>
    x < w.x + w.w &&
    x + size > w.x &&
    y < w.y + w.h &&
    y + size > w.y
  );
}