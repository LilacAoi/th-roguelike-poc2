import type {
  GameState,
  Player,
  Enemy,
  Boss,
  Position,
} from '../types/game';
import { EnemyType, EquipmentSlot, WeaponType } from '../types/game';
import { generateMap, getRandomFloorPosition } from './mapGenerator';
import { generateWeapon, generateEquipment } from './itemGenerator';

let enemyIdCounter = 0;

function generateEnemyId(): string {
  return `enemy_${enemyIdCounter++}_${Date.now()}`;
}

function createMephit(position: Position, level: number): Enemy {
  return {
    id: generateEnemyId(),
    type: EnemyType.Mephit,
    name: 'Mephit Drone',
    position,
    stats: {
      maxHp: 30 + level * 5,
      hp: 30 + level * 5,
      attack: 8 + level * 2,
      defense: 3 + level,
      speed: 12,
      critChance: 0.05,
      critMultiplier: 1.5,
    },
    flying: true,
    aiState: 'idle',
    level,
  };
}

function createMissileMephit(position: Position, level: number): Enemy {
  return {
    id: generateEnemyId(),
    type: EnemyType.MissileMephit,
    name: 'Missile Mephit',
    position,
    stats: {
      maxHp: 35 + level * 5,
      hp: 35 + level * 5,
      attack: 12 + level * 3,
      defense: 2 + level,
      speed: 10,
      critChance: 0.1,
      critMultiplier: 1.8,
    },
    flying: true,
    aiState: 'idle',
    level,
  };
}

function createGolem(position: Position, level: number): Enemy {
  return {
    id: generateEnemyId(),
    type: EnemyType.Golem,
    name: 'Frost Golem',
    position,
    stats: {
      maxHp: 80 + level * 15,
      hp: 80 + level * 15,
      attack: 15 + level * 3,
      defense: 12 + level * 2,
      speed: 5,
      critChance: 0.03,
      critMultiplier: 2.0,
    },
    flying: false,
    aiState: 'idle',
    level,
  };
}

function createEliteMephit(position: Position, level: number): Enemy {
  return {
    id: generateEnemyId(),
    type: EnemyType.EliteMephit,
    name: 'Elite Mephit',
    position,
    stats: {
      maxHp: 50 + level * 8,
      hp: 50 + level * 8,
      attack: 15 + level * 3,
      defense: 8 + level * 2,
      speed: 14,
      critChance: 0.15,
      critMultiplier: 2.0,
    },
    flying: true,
    aiState: 'idle',
    level,
  };
}

function createBoss(position: Position): Boss {
  return {
    id: generateEnemyId(),
    type: EnemyType.Boss,
    name: 'Garm - Hound of Hel',
    position,
    stats: {
      maxHp: 500,
      hp: 500,
      attack: 30,
      defense: 20,
      speed: 10,
      critChance: 0.15,
      critMultiplier: 2.5,
    },
    flying: false,
    aiState: 'idle',
    level: 5,
    phase: 1,
    specialAbilities: ['Claw Strike', 'Charge', 'Beam Attack', 'Deploy Drones'],
    droneCount: 0,
  };
}

export function initializeGame(): GameState {
  const mapWidth = 80;
  const mapHeight = 45;
  const map = generateMap(mapWidth, mapHeight);

  // Create player
  const playerPos = getRandomFloorPosition(map);
  const startingWeapon = generateWeapon(WeaponType.Pistol, undefined, 1);

  const player: Player = {
    position: playerPos,
    stats: {
      maxHp: 100,
      hp: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      critChance: 0.2, // Pistol Master bonus
      critMultiplier: 2.0,
    },
    level: 1,
    experience: 0,
    weapon: startingWeapon,
    equipment: {
      [EquipmentSlot.Helm]: generateEquipment(EquipmentSlot.Helm, undefined, 1),
      [EquipmentSlot.Torso]: generateEquipment(EquipmentSlot.Torso, undefined, 1),
      [EquipmentSlot.Shoulder]: null,
      [EquipmentSlot.Gauntlet]: null,
      [EquipmentSlot.Legging]: null,
      [EquipmentSlot.Boots]: null,
    },
    inventory: {
      weapons: [],
      equipment: [],
      runes: [],
    },
  };

  // Create enemies
  const enemies: Enemy[] = [];
  const numMephits = 8;
  const numMissileMephits = 5;
  const numGolems = 3;
  const numEliteMephits = 2;

  for (let i = 0; i < numMephits; i++) {
    let pos = getRandomFloorPosition(map);
    // Ensure enemy is not on player position
    while (pos.x === playerPos.x && pos.y === playerPos.y) {
      pos = getRandomFloorPosition(map);
    }
    enemies.push(createMephit(pos, 1));
  }

  for (let i = 0; i < numMissileMephits; i++) {
    let pos = getRandomFloorPosition(map);
    while (pos.x === playerPos.x && pos.y === playerPos.y) {
      pos = getRandomFloorPosition(map);
    }
    enemies.push(createMissileMephit(pos, 1));
  }

  for (let i = 0; i < numGolems; i++) {
    let pos = getRandomFloorPosition(map);
    while (pos.x === playerPos.x && pos.y === playerPos.y) {
      pos = getRandomFloorPosition(map);
    }
    enemies.push(createGolem(pos, 1));
  }

  for (let i = 0; i < numEliteMephits; i++) {
    let pos = getRandomFloorPosition(map);
    while (pos.x === playerPos.x && pos.y === playerPos.y) {
      pos = getRandomFloorPosition(map);
    }
    enemies.push(createEliteMephit(pos, 1));
  }

  // Boss will spawn after all regular enemies are defeated

  return {
    player,
    enemies,
    boss: null, // Boss appears after clearing all enemies
    map,
    turnCount: 0,
    gameStatus: 'menu',
    messageLog: ['Welcome to TooHuman Roguelike!', 'Use arrow keys to move, F to target enemies.'],
    targetMode: false,
    targetPosition: null,
  };
}

export function spawnBoss(gameState: GameState): void {
  if (gameState.boss) {
    return;
  }

  const bossPos = getRandomFloorPosition(gameState.map);
  gameState.boss = createBoss(bossPos);
  gameState.messageLog.push('A terrifying presence emerges...');
  gameState.messageLog.push('Garm, the Hound of Hel, has appeared!');
}
