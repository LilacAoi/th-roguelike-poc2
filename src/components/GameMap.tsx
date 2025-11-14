import React from 'react';
import type { GameState } from '../types/game';
import { TileType, EnemyType } from '../types/game';

interface GameMapProps {
  gameState: GameState;
}

export const GameMap: React.FC<GameMapProps> = ({ gameState }) => {
  const { map, player, enemies, boss, targetPosition, targetMode } = gameState;

  const getTileChar = (x: number, y: number): string => {
    const tile = map[y][x];

    // Check if player is on this tile
    if (player.position.x === x && player.position.y === y) {
      return '@';
    }

    // Check if boss is on this tile
    if (boss && boss.position.x === x && boss.position.y === y) {
      return 'G';
    }

    // Check if any enemy is on this tile
    const enemy = enemies.find((e) => e.position.x === x && e.position.y === y);
    if (enemy) {
      switch (enemy.type) {
        case EnemyType.Mephit:
          return 'm';
        case EnemyType.MissileMephit:
          return 'M';
        case EnemyType.Golem:
          return 'g';
        case EnemyType.EliteMephit:
          return 'E';
        default:
          return 'e';
      }
    }

    // Check if this is the target position
    if (targetMode && targetPosition && targetPosition.x === x && targetPosition.y === y) {
      return 'X';
    }

    // Show tile based on visibility
    if (!tile.visible && !tile.explored) {
      return ' ';
    }

    if (!tile.visible && tile.explored) {
      // Show explored but not visible tiles in gray
      switch (tile.type) {
        case TileType.Wall:
          return '#';
        case TileType.Floor:
          return '·';
        default:
          return ' ';
      }
    }

    // Visible tiles
    switch (tile.type) {
      case TileType.Wall:
        return '#';
      case TileType.Floor:
        return '.';
      case TileType.Door:
        return '+';
      case TileType.UpStairs:
        return '<';
      case TileType.DownStairs:
        return '>';
      default:
        return ' ';
    }
  };

  const getTileColor = (x: number, y: number): string => {
    const tile = map[y][x];

    // Player is always bright white
    if (player.position.x === x && player.position.y === y) {
      return 'text-white font-bold';
    }

    // Only show enemies if tile is visible
    if (tile.visible) {
      // Boss is bright red
      if (boss && boss.position.x === x && boss.position.y === y) {
        return 'text-red-500 font-bold';
      }

      // Enemy colors (only if visible)
      const enemy = enemies.find((e) => e.position.x === x && e.position.y === y);
      if (enemy) {
        switch (enemy.type) {
          case EnemyType.Mephit:
            return 'text-yellow-300 font-bold';
          case EnemyType.MissileMephit:
            return 'text-orange-500 font-bold';
          case EnemyType.Golem:
            return 'text-cyan-400 font-bold';
          case EnemyType.EliteMephit:
            return 'text-purple-500 font-bold';
          default:
            return 'text-red-400 font-bold';
        }
      }

      // Target cursor
      if (targetMode && targetPosition && targetPosition.x === x && targetPosition.y === y) {
        return 'text-yellow-300 font-bold bg-yellow-900/30';
      }
    }

    // Explored but not currently visible - darker colors
    if (!tile.visible && tile.explored) {
      return 'text-gray-400';
    }

    // Not explored - completely dark
    if (!tile.visible && !tile.explored) {
      return 'text-gray-950';
    }

    // Currently visible tiles - bright colors
    switch (tile.type) {
      case TileType.Wall:
        return 'text-gray-500';
      case TileType.Floor:
        return 'text-gray-300';
      default:
        return 'text-gray-400';
    }
  };

  // Calculate viewport (center on player)
  const viewportWidth = 80;
  const viewportHeight = 35;

  const startX = Math.max(0, Math.min(player.position.x - Math.floor(viewportWidth / 2), map[0].length - viewportWidth));
  const startY = Math.max(0, Math.min(player.position.y - Math.floor(viewportHeight / 2), map.length - viewportHeight));
  const endX = Math.min(startX + viewportWidth, map[0].length);
  const endY = Math.min(startY + viewportHeight, map.length);

  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-600 overflow-hidden">
      <div className="font-mono text-base leading-tight whitespace-pre">
        {Array.from({ length: endY - startY }, (_, dy) => {
          const y = startY + dy;
          return (
            <div key={y} className="flex">
              {Array.from({ length: endX - startX }, (_, dx) => {
                const x = startX + dx;
                const char = getTileChar(x, y);
                const color = getTileColor(x, y);
                return (
                  <span key={x} className={`${color} w-4 text-center`}>
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
