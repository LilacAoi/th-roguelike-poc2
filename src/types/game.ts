// ゲームの基本型定義

export interface Position {
  x: number;
  y: number;
}

export const TileType = {
  Floor: 'floor',
  Wall: 'wall',
  Door: 'door',
  UpStairs: 'upstairs',
  DownStairs: 'downstairs',
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export interface Tile {
  type: TileType;
  walkable: boolean;
  transparent: boolean;
  explored: boolean;
  visible: boolean;
}

export const Rarity = {
  Common: 'common',
  LessCommon: 'less_common',
  Uncommon: 'uncommon',
  Rare: 'rare',
  VeryRare: 'very_rare',
  Epic: 'epic',
} as const;

export type Rarity = typeof Rarity[keyof typeof Rarity];

export const RarityColors: Record<Rarity, string> = {
  [Rarity.Common]: 'text-rarity-common',
  [Rarity.LessCommon]: 'text-rarity-less-common',
  [Rarity.Uncommon]: 'text-rarity-uncommon',
  [Rarity.Rare]: 'text-rarity-rare',
  [Rarity.VeryRare]: 'text-rarity-very-rare',
  [Rarity.Epic]: 'text-rarity-epic',
};

export const RarityDropRates: Record<Rarity, number> = {
  [Rarity.Common]: 0.50,
  [Rarity.LessCommon]: 0.30,
  [Rarity.Uncommon]: 0.15,
  [Rarity.Rare]: 0.04,
  [Rarity.VeryRare]: 0.009,
  [Rarity.Epic]: 0.001,
};

export const WeaponType = {
  // Melee
  Sword: 'sword',
  Staff: 'staff',
  Hammer: 'hammer',
  // Ranged
  Pistol: 'pistol',
  Rifle: 'rifle',
  Cannon: 'cannon',
} as const;

export type WeaponType = typeof WeaponType[keyof typeof WeaponType];

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: Rarity;
  damage: number;
  range: number; // 1 for melee, higher for ranged
  critChance: number;
  critMultiplier: number;
  runeSlots: number;
  equippedRunes: Rune[];
}

export const EquipmentSlot = {
  Helm: 'helm',
  Torso: 'torso',
  Shoulder: 'shoulder',
  Gauntlet: 'gauntlet',
  Legging: 'legging',
  Boots: 'boots',
} as const;

export type EquipmentSlot = typeof EquipmentSlot[keyof typeof EquipmentSlot];

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  defense: number;
  health: number;
  strength: number;
  agility: number;
  runeSlots: number;
  equippedRunes: Rune[];
}

export const RuneType = {
  Strength: 'strength',
  Agility: 'agility',
  Vitality: 'vitality',
  Power: 'power',
  Defense: 'defense',
  CriticalChance: 'critical_chance',
} as const;

export type RuneType = typeof RuneType[keyof typeof RuneType];

export interface Rune {
  id: string;
  name: string;
  type: RuneType;
  rarity: Rarity;
  bonus: number;
}

export interface Stats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critMultiplier: number;
}

export const EnemyType = {
  Mephit: 'mephit',
  MissileMephit: 'missile_mephit',
  Golem: 'golem',
  EliteMephit: 'elite_mephit',
  Boss: 'boss',
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  position: Position;
  stats: Stats;
  flying: boolean;
  aiState: 'idle' | 'chasing' | 'attacking' | 'fleeing';
  level: number;
}

export interface Boss extends Enemy {
  phase: 1 | 2;
  specialAbilities: string[];
  droneCount: number;
}

export interface Player {
  position: Position;
  stats: Stats;
  level: number;
  experience: number;
  meleeWeapon: Weapon | null;
  rangedWeapon: Weapon | null;
  equipment: Record<EquipmentSlot, Equipment | null>;
  inventory: {
    weapons: Weapon[];
    equipment: Equipment[];
    runes: Rune[];
  };
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  boss: Boss | null;
  map: Tile[][];
  turnCount: number;
  gameStatus: 'menu' | 'playing' | 'victory' | 'defeat';
  messageLog: string[];
  targetMode: boolean;
  targetPosition: Position | null;
  isResting: boolean;
  restingForFullHP: boolean;
}
