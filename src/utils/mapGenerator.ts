import type { Tile, Position } from '../types/game';
import { TileType } from '../types/game';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function generateMap(width: number, height: number): Tile[][] {
  // Initialize map with walls
  const map: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      map[y][x] = {
        type: TileType.Wall,
        walkable: false,
        transparent: false,
        explored: false,
        visible: false,
      };
    }
  }

  // Generate rooms
  const rooms: Room[] = [];
  const maxRooms = 15;
  const minSize = 4;
  const maxSize = 10;

  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const h = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const x = Math.floor(Math.random() * (width - w - 1)) + 1;
    const y = Math.floor(Math.random() * (height - h - 1)) + 1;

    const newRoom: Room = { x, y, width: w, height: h };

    // Check for overlap with existing rooms
    let overlaps = false;
    for (const room of rooms) {
      if (roomsIntersect(newRoom, room)) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      carveRoom(map, newRoom);

      // Connect to previous room with corridor
      if (rooms.length > 0) {
        const prevRoom = rooms[rooms.length - 1];
        const prevCenter = getRoomCenter(prevRoom);
        const newCenter = getRoomCenter(newRoom);

        // Randomly decide horizontal-first or vertical-first corridor
        if (Math.random() < 0.5) {
          carveHorizontalCorridor(map, prevCenter.x, newCenter.x, prevCenter.y);
          carveVerticalCorridor(map, prevCenter.y, newCenter.y, newCenter.x);
        } else {
          carveVerticalCorridor(map, prevCenter.y, newCenter.y, prevCenter.x);
          carveHorizontalCorridor(map, prevCenter.x, newCenter.x, newCenter.y);
        }
      }

      rooms.push(newRoom);
    }
  }

  return map;
}

function roomsIntersect(room1: Room, room2: Room): boolean {
  return (
    room1.x < room2.x + room2.width + 1 &&
    room1.x + room1.width + 1 > room2.x &&
    room1.y < room2.y + room2.height + 1 &&
    room1.y + room1.height + 1 > room2.y
  );
}

function carveRoom(map: Tile[][], room: Room): void {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
        map[y][x] = {
          type: TileType.Floor,
          walkable: true,
          transparent: true,
          explored: false,
          visible: false,
        };
      }
    }
  }
}

function carveHorizontalCorridor(
  map: Tile[][],
  x1: number,
  x2: number,
  y: number
): void {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  for (let x = minX; x <= maxX; x++) {
    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
      map[y][x] = {
        type: TileType.Floor,
        walkable: true,
        transparent: true,
        explored: false,
        visible: false,
      };
    }
  }
}

function carveVerticalCorridor(
  map: Tile[][],
  y1: number,
  y2: number,
  x: number
): void {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (let y = minY; y <= maxY; y++) {
    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
      map[y][x] = {
        type: TileType.Floor,
        walkable: true,
        transparent: true,
        explored: false,
        visible: false,
      };
    }
  }
}

function getRoomCenter(room: Room): Position {
  return {
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2),
  };
}

export function getRandomFloorPosition(map: Tile[][]): Position {
  const floorTiles: Position[] = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].walkable) {
        floorTiles.push({ x, y });
      }
    }
  }

  if (floorTiles.length === 0) {
    return { x: 1, y: 1 }; // Fallback
  }

  return floorTiles[Math.floor(Math.random() * floorTiles.length)];
}

export function isPositionWalkable(map: Tile[][], pos: Position): boolean {
  if (pos.y < 0 || pos.y >= map.length || pos.x < 0 || pos.x >= map[0].length) {
    return false;
  }
  return map[pos.y][pos.x].walkable;
}

export function getDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}
