import type { Player, Enemy, Boss, Stats, Position } from '../types/game';
import { getDistance } from './mapGenerator';

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  killed: boolean;
  message: string;
}

export function calculatePlayerStats(player: Player): Stats {
  let stats = { ...player.stats };

  // Add weapon bonuses
  if (player.weapon) {
    stats.attack += player.weapon.damage;
    stats.critChance = player.weapon.critChance;
    stats.critMultiplier = player.weapon.critMultiplier;

    // Add rune bonuses from weapon
    player.weapon.equippedRunes.forEach((rune) => {
      applyRuneBonus(stats, rune.type, rune.bonus);
    });
  }

  // Add equipment bonuses
  Object.values(player.equipment).forEach((equip) => {
    if (equip) {
      stats.defense += equip.defense;
      stats.maxHp += equip.health;
      stats.attack += equip.strength;
      stats.speed += equip.agility;

      // Add rune bonuses from equipment
      equip.equippedRunes.forEach((rune) => {
        applyRuneBonus(stats, rune.type, rune.bonus);
      });
    }
  });

  // Make sure HP doesn't exceed maxHp
  if (stats.hp > stats.maxHp) {
    stats.hp = stats.maxHp;
  }

  return stats;
}

function applyRuneBonus(
  stats: Stats,
  runeType: string,
  bonus: number
): void {
  switch (runeType) {
    case 'strength':
      stats.attack += bonus;
      break;
    case 'agility':
      stats.speed += bonus;
      break;
    case 'vitality':
      stats.maxHp += bonus;
      stats.hp += bonus;
      break;
    case 'power':
      stats.attack += bonus;
      break;
    case 'defense':
      stats.defense += bonus;
      break;
    case 'critical_chance':
      stats.critChance += bonus / 100;
      break;
  }
}

export function performAttack(
  attacker: Stats,
  defender: Stats,
  attackerName: string,
  defenderName: string
): CombatResult {
  const isCritical = Math.random() < attacker.critChance;
  const critMultiplier = isCritical ? attacker.critMultiplier : 1.0;

  const baseDamage = attacker.attack;
  const damageReduction = defender.defense * 0.5;
  const finalDamage = Math.max(
    1,
    Math.floor((baseDamage - damageReduction) * critMultiplier)
  );

  defender.hp -= finalDamage;
  const killed = defender.hp <= 0;

  let message = `${attackerName} attacks ${defenderName} for ${finalDamage} damage`;
  if (isCritical) {
    message += ' (CRITICAL!)';
  }
  if (killed) {
    message += ` and kills ${defenderName}!`;
  }

  return {
    damage: finalDamage,
    isCritical,
    killed,
    message,
  };
}

export function playerMeleeAttack(
  player: Player,
  enemy: Enemy
): CombatResult {
  const playerStats = calculatePlayerStats(player);
  return performAttack(playerStats, enemy.stats, 'Freya', enemy.name);
}

export function playerRangedAttack(
  player: Player,
  enemy: Enemy,
  distance: number
): CombatResult | null {
  if (!player.weapon) {
    return null;
  }

  if (player.weapon.range < distance) {
    return {
      damage: 0,
      isCritical: false,
      killed: false,
      message: 'Target is out of range!',
    };
  }

  const playerStats = calculatePlayerStats(player);
  return performAttack(playerStats, enemy.stats, 'Freya', enemy.name);
}

export function enemyAttack(enemy: Enemy, player: Player): CombatResult {
  const playerStats = calculatePlayerStats(player);
  const result = performAttack(enemy.stats, playerStats, enemy.name, 'Freya');

  // Update actual player HP
  player.stats.hp = playerStats.hp;

  return result;
}

export function bossSpecialAbility(
  boss: Boss,
  player: Player,
  _allEnemies: Enemy[]
): string[] {
  const messages: string[] = [];

  if (boss.phase === 1) {
    // Phase 1: Quick attacks and claw strikes
    if (Math.random() < 0.3) {
      messages.push(`${boss.name} performs a devastating claw strike!`);
      const playerStats = calculatePlayerStats(player);
      const damage = Math.floor(boss.stats.attack * 1.5);
      playerStats.hp -= damage;
      player.stats.hp = playerStats.hp;
      messages.push(`Freya takes ${damage} damage!`);
    }
  } else {
    // Phase 2: Drones, charge, and beam attacks
    if (boss.droneCount < 3 && Math.random() < 0.4) {
      messages.push(`${boss.name} deploys autonomous drones!`);
      boss.droneCount++;
    }

    if (Math.random() < 0.3) {
      messages.push(`${boss.name} charges forward!`);
      const playerStats = calculatePlayerStats(player);
      const damage = Math.floor(boss.stats.attack * 2.0);
      playerStats.hp -= damage;
      player.stats.hp = playerStats.hp;
      messages.push(`Freya takes ${damage} damage from the charge!`);
    }

    if (Math.random() < 0.2) {
      messages.push(`${boss.name} fires a devastating beam!`);
      const playerStats = calculatePlayerStats(player);
      const damage = Math.floor(boss.stats.attack * 1.8);
      playerStats.hp -= damage;
      player.stats.hp = playerStats.hp;
      messages.push(`Freya takes ${damage} damage from the beam!`);
    }
  }

  return messages;
}

export function checkPhaseTransition(boss: Boss): boolean {
  if (boss.phase === 1 && boss.stats.hp <= boss.stats.maxHp * 0.5) {
    boss.phase = 2;
    return true;
  }
  return false;
}

export function getEnemyAtPosition(
  enemies: Enemy[],
  position: Position
): Enemy | null {
  return (
    enemies.find(
      (e) => e.position.x === position.x && e.position.y === position.y
    ) || null
  );
}

export function isPlayerInRange(
  playerPos: Position,
  enemyPos: Position,
  range: number
): boolean {
  return getDistance(playerPos, enemyPos) <= range;
}
