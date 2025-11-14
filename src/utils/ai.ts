import type { Enemy, Position, Tile } from '../types/game';
import { EnemyType } from '../types/game';
import { getDistance } from './mapGenerator';

interface PathNode {
  position: Position;
  parent: PathNode | null;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost
}

export function findPath(
  map: Tile[][],
  start: Position,
  goal: Position,
  enemies: Enemy[]
): Position[] {
  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();

  const startNode: PathNode = {
    position: start,
    parent: null,
    g: 0,
    h: getDistance(start, goal),
    f: getDistance(start, goal),
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    const posKey = `${current.position.x},${current.position.y}`;
    if (closedSet.has(posKey)) {
      continue;
    }

    closedSet.add(posKey);

    // Goal reached
    if (
      current.position.x === goal.x &&
      current.position.y === goal.y
    ) {
      return reconstructPath(current);
    }

    // Check neighbors
    const neighbors = getNeighbors(current.position);
    for (const neighborPos of neighbors) {
      const neighborKey = `${neighborPos.x},${neighborPos.y}`;

      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Check if walkable
      if (
        neighborPos.y < 0 ||
        neighborPos.y >= map.length ||
        neighborPos.x < 0 ||
        neighborPos.x >= map[0].length ||
        !map[neighborPos.y][neighborPos.x].walkable
      ) {
        continue;
      }

      // Check if enemy is on this tile (except goal)
      const enemyOnTile = enemies.some(
        (e) =>
          e.position.x === neighborPos.x &&
          e.position.y === neighborPos.y &&
          !(neighborPos.x === goal.x && neighborPos.y === goal.y)
      );

      if (enemyOnTile) {
        continue;
      }

      const g = current.g + 1;
      const h = getDistance(neighborPos, goal);
      const f = g + h;

      const neighborNode: PathNode = {
        position: neighborPos,
        parent: current,
        g,
        h,
        f,
      };

      openSet.push(neighborNode);
    }
  }

  // No path found
  return [];
}

function reconstructPath(node: PathNode): Position[] {
  const path: Position[] = [];
  let current: PathNode | null = node;

  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }

  // Remove the first position (current position)
  path.shift();

  return path;
}

function getNeighbors(pos: Position): Position[] {
  return [
    { x: pos.x + 1, y: pos.y },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x, y: pos.y - 1 },
  ];
}

export function moveEnemy(
  enemy: Enemy,
  playerPos: Position,
  map: Tile[][],
  enemies: Enemy[]
): void {
  const distance = getDistance(enemy.position, playerPos);

  // Different behavior based on enemy type
  switch (enemy.type) {
    case EnemyType.Mephit:
    case EnemyType.EliteMephit:
      // Aggressive, always chase if in range
      if (distance <= 10) {
        enemy.aiState = 'chasing';
        moveTowardsPlayer(enemy, playerPos, map, enemies);
      } else {
        enemy.aiState = 'idle';
        randomMove(enemy, map, enemies);
      }
      break;

    case EnemyType.MissileMephit:
      // Keep distance and shoot
      if (distance <= 8 && distance > 3) {
        enemy.aiState = 'attacking';
        // Stay in place or move to maintain distance
      } else if (distance <= 3) {
        enemy.aiState = 'fleeing';
        moveAwayFromPlayer(enemy, playerPos, map, enemies);
      } else if (distance <= 12) {
        enemy.aiState = 'chasing';
        moveTowardsPlayer(enemy, playerPos, map, enemies);
      } else {
        enemy.aiState = 'idle';
        randomMove(enemy, map, enemies);
      }
      break;

    case EnemyType.Golem:
      // Slow but powerful, only chase if close
      if (distance <= 6) {
        enemy.aiState = 'chasing';
        moveTowardsPlayer(enemy, playerPos, map, enemies);
      } else {
        enemy.aiState = 'idle';
      }
      break;

    case EnemyType.Boss:
      // Boss always chases
      enemy.aiState = 'chasing';
      moveTowardsPlayer(enemy, playerPos, map, enemies);
      break;

    default:
      enemy.aiState = 'idle';
  }
}

function moveTowardsPlayer(
  enemy: Enemy,
  playerPos: Position,
  map: Tile[][],
  enemies: Enemy[]
): void {
  const path = findPath(map, enemy.position, playerPos, enemies);

  if (path.length > 0) {
    const nextPos = path[0];
    // Check if the next position is occupied by another enemy
    const occupied = enemies.some(
      (e) =>
        e.id !== enemy.id &&
        e.position.x === nextPos.x &&
        e.position.y === nextPos.y
    );

    if (!occupied) {
      enemy.position = nextPos;
    }
  }
}

function moveAwayFromPlayer(
  enemy: Enemy,
  playerPos: Position,
  map: Tile[][],
  enemies: Enemy[]
): void {
  const neighbors = getNeighbors(enemy.position);
  let bestPos = enemy.position;
  let maxDistance = getDistance(enemy.position, playerPos);

  for (const neighbor of neighbors) {
    if (
      neighbor.y >= 0 &&
      neighbor.y < map.length &&
      neighbor.x >= 0 &&
      neighbor.x < map[0].length &&
      map[neighbor.y][neighbor.x].walkable
    ) {
      const occupied = enemies.some(
        (e) =>
          e.id !== enemy.id &&
          e.position.x === neighbor.x &&
          e.position.y === neighbor.y
      );

      if (!occupied) {
        const dist = getDistance(neighbor, playerPos);
        if (dist > maxDistance) {
          maxDistance = dist;
          bestPos = neighbor;
        }
      }
    }
  }

  enemy.position = bestPos;
}

function randomMove(
  enemy: Enemy,
  map: Tile[][],
  enemies: Enemy[]
): void {
  if (Math.random() < 0.5) {
    return; // 50% chance to not move
  }

  const neighbors = getNeighbors(enemy.position);
  const validMoves = neighbors.filter((neighbor) => {
    if (
      neighbor.y < 0 ||
      neighbor.y >= map.length ||
      neighbor.x < 0 ||
      neighbor.x >= map[0].length ||
      !map[neighbor.y][neighbor.x].walkable
    ) {
      return false;
    }

    const occupied = enemies.some(
      (e) =>
        e.id !== enemy.id &&
        e.position.x === neighbor.x &&
        e.position.y === neighbor.y
    );

    return !occupied;
  });

  if (validMoves.length > 0) {
    enemy.position = validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

export function canEnemyAttackPlayer(
  enemy: Enemy,
  playerPos: Position
): boolean {
  const distance = getDistance(enemy.position, playerPos);

  switch (enemy.type) {
    case EnemyType.Mephit:
    case EnemyType.EliteMephit:
    case EnemyType.Golem:
    case EnemyType.Boss:
      return distance <= 1; // Melee range

    case EnemyType.MissileMephit:
      return distance <= 8 && distance > 0; // Ranged attack

    default:
      return false;
  }
}
