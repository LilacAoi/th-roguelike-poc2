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

  // Use shadowcasting algorithm for FOV
  map[origin.y][origin.x].visible = true;
  map[origin.y][origin.x].explored = true;

  // 8 octants for shadowcasting
  for (let octant = 0; octant < 8; octant++) {
    castLight(map, origin, radius, 1, 1.0, 0.0, octant);
  }
}

function castLight(
  map: Tile[][],
  origin: Position,
  radius: number,
  row: number,
  startSlope: number,
  endSlope: number,
  octant: number
): void {
  if (startSlope < endSlope) {
    return;
  }

  let nextStartSlope = startSlope;

  for (let i = row; i <= radius; i++) {
    let blocked = false;

    for (let dx = -i, dy = -i; dx <= 0; dx++) {
      const currentSlope = (dx - 0.5) / (dy + 0.5);
      if (currentSlope < endSlope) {
        continue;
      }
      if (currentSlope > startSlope) {
        break;
      }

      const pos = transformOctant(origin, dx, dy, octant);

      if (!isInBounds(map, pos)) {
        continue;
      }

      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared <= radius * radius) {
        map[pos.y][pos.x].visible = true;
        map[pos.y][pos.x].explored = true;
      }

      if (blocked) {
        if (!map[pos.y][pos.x].transparent) {
          nextStartSlope = currentSlope;
          continue;
        } else {
          blocked = false;
          startSlope = nextStartSlope;
        }
      } else {
        if (!map[pos.y][pos.x].transparent && i < radius) {
          blocked = true;
          castLight(map, origin, radius, i + 1, startSlope, currentSlope, octant);
          nextStartSlope = currentSlope;
        }
      }
    }

    if (blocked) {
      break;
    }
  }
}

function transformOctant(
  origin: Position,
  dx: number,
  dy: number,
  octant: number
): Position {
  switch (octant) {
    case 0:
      return { x: origin.x - dx, y: origin.y - dy };
    case 1:
      return { x: origin.x - dy, y: origin.y - dx };
    case 2:
      return { x: origin.x + dy, y: origin.y - dx };
    case 3:
      return { x: origin.x + dx, y: origin.y - dy };
    case 4:
      return { x: origin.x + dx, y: origin.y + dy };
    case 5:
      return { x: origin.x + dy, y: origin.y + dx };
    case 6:
      return { x: origin.x - dy, y: origin.y + dx };
    case 7:
      return { x: origin.x - dx, y: origin.y + dy };
    default:
      return origin;
  }
}

function isInBounds(map: Tile[][], pos: Position): boolean {
  return pos.y >= 0 && pos.y < map.length && pos.x >= 0 && pos.x < map[0].length;
}
