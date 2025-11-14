import type { Tile, Position } from '../types/game';

export function calculateFOV(
  map: Tile[][],
  origin: Position,
  radius: number
): void {
  // Clear all visible flags first
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].visible = false;
    }
  }

  // Simple distance-based FOV with line-of-sight checking
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const dx = x - origin.x;
      const dy = y - origin.y;
      const distSquared = dx * dx + dy * dy;
      const radiusSquared = radius * radius;

      // Check if within radius
      if (distSquared <= radiusSquared) {
        // Check line of sight with simple raycasting
        if (hasLineOfSight(map, origin, { x, y }, radius)) {
          map[y][x].visible = true;
          map[y][x].explored = true;
        }
      }
    }
  }
}

function hasLineOfSight(
  map: Tile[][],
  origin: Position,
  target: Position,
  _radius: number
): boolean {
  // Simple line-of-sight check using Bresenham's algorithm
  const dx = Math.abs(target.x - origin.x);
  const dy = Math.abs(target.y - origin.y);
  const sx = origin.x < target.x ? 1 : -1;
  const sy = origin.y < target.y ? 1 : -1;
  let err = dx - dy;

  let currentX = origin.x;
  let currentY = origin.y;

  while (true) {
    // Always mark current position as visible
    if (isInBounds(map, { x: currentX, y: currentY })) {
      map[currentY][currentX].visible = true;
      map[currentY][currentX].explored = true;
    }

    if (currentX === target.x && currentY === target.y) {
      return true;
    }

    // Stop if we hit a wall (except at the target)
    if (
      isInBounds(map, { x: currentX, y: currentY }) &&
      !map[currentY][currentX].transparent &&
      !(currentX === target.x && currentY === target.y)
    ) {
      return false;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currentX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currentY += sy;
    }
  }
}

function isInBounds(map: Tile[][], pos: Position): boolean {
  return pos.y >= 0 && pos.y < map.length && pos.x >= 0 && pos.x < map[0].length;
}
