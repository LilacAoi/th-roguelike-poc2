import React from 'react';
import type { GameState } from '../types/game';
import { calculatePlayerStats } from '../utils/combat';

interface HUDProps {
  gameState: GameState;
}

export const HUD: React.FC<HUDProps> = ({ gameState }) => {
  const { player, boss, enemies, turnCount } = gameState;
  const playerStats = calculatePlayerStats(player);

  const hpPercentage = (playerStats.hp / playerStats.maxHp) * 100;
  const hpColor = hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 space-y-4">
      {/* Player Info */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-blue-400">Freya - Champion</h2>
          <span className="text-sm text-gray-400">Level {player.level}</span>
        </div>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">HP</span>
            <span className="text-white font-semibold">
              {playerStats.hp} / {playerStats.maxHp}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`${hpColor} h-full transition-all duration-300`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Attack:</span>
            <span className="text-red-400 font-semibold">{playerStats.attack}</span>
          </div>
          <div className="flex justify-between bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Defense:</span>
            <span className="text-blue-400 font-semibold">{playerStats.defense}</span>
          </div>
          <div className="flex justify-between bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Speed:</span>
            <span className="text-purple-400 font-semibold">{playerStats.speed}</span>
          </div>
          <div className="flex justify-between bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Crit:</span>
            <span className="text-yellow-400 font-semibold">
              {(playerStats.critChance * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Weapon Info */}
      <div className="space-y-2">
        {/* Melee Weapon */}
        {player.meleeWeapon && (
          <div className="bg-gray-900 p-3 rounded">
            <h3 className="text-sm font-semibold text-orange-400 mb-2">Melee Weapon</h3>
            <div className="text-sm">
              <p className={`font-semibold mb-1 rarity-${player.meleeWeapon.rarity}`}>
                {player.meleeWeapon.name}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <span>Damage: {player.meleeWeapon.damage}</span>
                <span>Range: {player.meleeWeapon.range}</span>
                <span>Crit: {(player.meleeWeapon.critChance * 100).toFixed(0)}%</span>
                <span>Mult: {player.meleeWeapon.critMultiplier.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        )}

        {/* Ranged Weapon */}
        {player.rangedWeapon && (
          <div className="bg-gray-900 p-3 rounded">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Ranged Weapon</h3>
            <div className="text-sm">
              <p className={`font-semibold mb-1 rarity-${player.rangedWeapon.rarity}`}>
                {player.rangedWeapon.name}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <span>Damage: {player.rangedWeapon.damage}</span>
                <span>Range: {player.rangedWeapon.range}</span>
                <span>Crit: {(player.rangedWeapon.critChance * 100).toFixed(0)}%</span>
                <span>Mult: {player.rangedWeapon.critMultiplier.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boss HP Bar */}
      {boss && (
        <div className="bg-gray-900 p-3 rounded border-2 border-red-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-red-400">{boss.name}</h3>
            <span className="text-xs text-yellow-400">Phase {boss.phase}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            {boss.stats.hp} / {boss.stats.maxHp}
          </div>
        </div>
      )}

      {/* Enemy Count */}
      <div className="bg-gray-900 p-3 rounded">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Enemies Remaining:</span>
          <span className="text-red-400 font-semibold">{enemies.length}</span>
        </div>
        {enemies.length === 0 && !boss && (
          <p className="text-xs text-yellow-400 mt-1">All enemies defeated! Prepare for the boss...</p>
        )}
      </div>

      {/* Turn Count */}
      <div className="text-xs text-gray-500 text-center">
        Turn: {turnCount}
      </div>
    </div>
  );
};
