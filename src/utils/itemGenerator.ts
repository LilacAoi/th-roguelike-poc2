import type {
  Weapon,
  Equipment,
  Rune,
} from '../types/game';
import {
  Rarity,
  RarityDropRates,
  WeaponType,
  EquipmentSlot,
  RuneType,
} from '../types/game';

let itemIdCounter = 0;

function generateId(): string {
  return `item_${itemIdCounter++}_${Date.now()}`;
}

export function getRandomRarity(isBoss: boolean = false): Rarity {
  const multiplier = isBoss ? 4 : 1;
  const random = Math.random();
  let cumulativeProbability = 0;

  // Iterate through rarities from Epic to Common
  const rarities = [
    Rarity.Epic,
    Rarity.VeryRare,
    Rarity.Rare,
    Rarity.Uncommon,
    Rarity.LessCommon,
    Rarity.Common,
  ];

  for (const rarity of rarities) {
    const probability = RarityDropRates[rarity] * multiplier;
    cumulativeProbability += probability;

    if (random < cumulativeProbability) {
      return rarity;
    }
  }

  return Rarity.Common;
}

function getRarityMultiplier(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.Common:
      return 1.0;
    case Rarity.LessCommon:
      return 1.2;
    case Rarity.Uncommon:
      return 1.5;
    case Rarity.Rare:
      return 2.0;
    case Rarity.VeryRare:
      return 3.0;
    case Rarity.Epic:
      return 5.0;
    default:
      return 1.0;
  }
}

function getRuneSlots(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.Common:
      return 0;
    case Rarity.LessCommon:
      return 1;
    case Rarity.Uncommon:
      return 1;
    case Rarity.Rare:
      return 2;
    case Rarity.VeryRare:
      return 3;
    case Rarity.Epic:
      return 4;
    default:
      return 0;
  }
}

const weaponNames: Record<WeaponType, string[]> = {
  [WeaponType.Sword]: [
    'Iron Blade',
    'Steel Sword',
    'Valkyrie Edge',
    'Frost Reaver',
    'Doom Bringer',
  ],
  [WeaponType.Staff]: [
    'Oak Staff',
    'Crystal Rod',
    'Arcane Scepter',
    'Mystic Conduit',
    'Staff of Eternity',
  ],
  [WeaponType.Hammer]: [
    'War Hammer',
    'Crushing Maul',
    "Thor's Might",
    'Titanfall',
    'World Breaker',
  ],
  [WeaponType.Pistol]: [
    'Hand Cannon',
    'Freya\'s Sidearm',
    'Precision Pistol',
    'Thunder Shot',
    'Divine Enforcer',
  ],
  [WeaponType.Rifle]: [
    'Sniper Rifle',
    'Valkyrie Rifle',
    'Plasma Repeater',
    'Cyber Hunter',
    'Final Judgement',
  ],
  [WeaponType.Cannon]: [
    'Heavy Cannon',
    'Siege Destroyer',
    'Mjolnir Cannon',
    'Orbital Strike',
    'Apocalypse Engine',
  ],
};

export function generateWeapon(
  type?: WeaponType,
  rarity?: Rarity,
  level: number = 1
): Weapon {
  const weaponType =
    type ||
    [
      WeaponType.Sword,
      WeaponType.Staff,
      WeaponType.Hammer,
      WeaponType.Pistol,
      WeaponType.Rifle,
      WeaponType.Cannon,
    ][Math.floor(Math.random() * 6)];

  const weaponRarity = rarity || getRandomRarity();
  const rarityMult = getRarityMultiplier(weaponRarity);

  const names = weaponNames[weaponType];
  const name = names[Math.floor(Math.random() * names.length)];

  // Base stats vary by weapon type
  let baseDamage = 10;
  let baseRange = 1;
  let baseCritChance = 0.05;
  let baseCritMult = 2.0;

  switch (weaponType) {
    case WeaponType.Sword:
      baseDamage = 15;
      baseCritChance = 0.15;
      break;
    case WeaponType.Staff:
      baseDamage = 12;
      baseCritChance = 0.1;
      break;
    case WeaponType.Hammer:
      baseDamage = 20;
      baseCritChance = 0.05;
      baseCritMult = 2.5;
      break;
    case WeaponType.Pistol:
      baseDamage = 12;
      baseRange = 6;
      baseCritChance = 0.2;
      break;
    case WeaponType.Rifle:
      baseDamage = 18;
      baseRange = 10;
      baseCritChance = 0.15;
      break;
    case WeaponType.Cannon:
      baseDamage = 25;
      baseRange = 8;
      baseCritChance = 0.05;
      baseCritMult = 3.0;
      break;
  }

  return {
    id: generateId(),
    name,
    type: weaponType,
    rarity: weaponRarity,
    damage: Math.floor(baseDamage * rarityMult * (1 + level * 0.1)),
    range: baseRange,
    critChance: Math.min(baseCritChance + (rarityMult - 1) * 0.05, 0.5),
    critMultiplier: baseCritMult + (rarityMult - 1) * 0.2,
    runeSlots: getRuneSlots(weaponRarity),
    equippedRunes: [],
  };
}

const equipmentNames: Record<EquipmentSlot, string[]> = {
  [EquipmentSlot.Helm]: [
    'Leather Cap',
    'Iron Helm',
    'Valkyrie Crown',
    'Cyber Visor',
    'Divine Circlet',
  ],
  [EquipmentSlot.Torso]: [
    'Padded Armor',
    'Chain Mail',
    'Battle Plate',
    'Cyber Chassis',
    'Immortal Aegis',
  ],
  [EquipmentSlot.Shoulder]: [
    'Cloth Pauldrons',
    'Steel Shoulders',
    'Valkyrie Mantle',
    'Cyber Pauldrons',
    'Celestial Guards',
  ],
  [EquipmentSlot.Gauntlet]: [
    'Leather Gloves',
    'Iron Gauntlets',
    'War Fists',
    'Cyber Grips',
    'Titan Hands',
  ],
  [EquipmentSlot.Legging]: [
    'Cloth Pants',
    'Chain Leggings',
    'Battle Greaves',
    'Cyber Legs',
    'Eternal Greaves',
  ],
  [EquipmentSlot.Boots]: [
    'Leather Boots',
    'Steel Boots',
    'Swift Treads',
    'Cyber Boots',
    'Wings of Valkyrie',
  ],
};

export function generateEquipment(
  slot?: EquipmentSlot,
  rarity?: Rarity,
  level: number = 1
): Equipment {
  const equipSlot =
    slot ||
    [
      EquipmentSlot.Helm,
      EquipmentSlot.Torso,
      EquipmentSlot.Shoulder,
      EquipmentSlot.Gauntlet,
      EquipmentSlot.Legging,
      EquipmentSlot.Boots,
    ][Math.floor(Math.random() * 6)];

  const equipRarity = rarity || getRandomRarity();
  const rarityMult = getRarityMultiplier(equipRarity);

  const names = equipmentNames[equipSlot];
  const name = names[Math.floor(Math.random() * names.length)];

  // Base stats vary by slot
  let baseDefense = 5;
  let baseHealth = 10;
  let baseStrength = 2;
  let baseAgility = 2;

  switch (equipSlot) {
    case EquipmentSlot.Helm:
      baseDefense = 8;
      baseHealth = 15;
      break;
    case EquipmentSlot.Torso:
      baseDefense = 12;
      baseHealth = 25;
      break;
    case EquipmentSlot.Shoulder:
      baseDefense = 6;
      baseStrength = 3;
      break;
    case EquipmentSlot.Gauntlet:
      baseDefense = 5;
      baseStrength = 4;
      break;
    case EquipmentSlot.Legging:
      baseDefense = 8;
      baseHealth = 20;
      break;
    case EquipmentSlot.Boots:
      baseDefense = 5;
      baseAgility = 4;
      break;
  }

  return {
    id: generateId(),
    name,
    slot: equipSlot,
    rarity: equipRarity,
    defense: Math.floor(baseDefense * rarityMult * (1 + level * 0.1)),
    health: Math.floor(baseHealth * rarityMult * (1 + level * 0.1)),
    strength: Math.floor(baseStrength * rarityMult * (1 + level * 0.05)),
    agility: Math.floor(baseAgility * rarityMult * (1 + level * 0.05)),
    runeSlots: getRuneSlots(equipRarity),
    equippedRunes: [],
  };
}

const runeNames: Record<RuneType, string[]> = {
  [RuneType.Strength]: ['Rune of Power', 'Strength Sigil', 'Might Glyph'],
  [RuneType.Agility]: ['Rune of Speed', 'Agility Sigil', 'Swift Glyph'],
  [RuneType.Vitality]: ['Rune of Life', 'Vitality Sigil', 'Health Glyph'],
  [RuneType.Power]: ['Rune of Destruction', 'Power Sigil', 'Force Glyph'],
  [RuneType.Defense]: ['Rune of Protection', 'Defense Sigil', 'Ward Glyph'],
  [RuneType.CriticalChance]: ['Rune of Precision', 'Critical Sigil', 'Crit Glyph'],
};

export function generateRune(type?: RuneType, rarity?: Rarity): Rune {
  const runeType =
    type ||
    [
      RuneType.Strength,
      RuneType.Agility,
      RuneType.Vitality,
      RuneType.Power,
      RuneType.Defense,
      RuneType.CriticalChance,
    ][Math.floor(Math.random() * 6)];

  const runeRarity = rarity || getRandomRarity();
  const rarityMult = getRarityMultiplier(runeRarity);

  const names = runeNames[runeType];
  const name = names[Math.floor(Math.random() * names.length)];

  let baseBonus = 5;

  switch (runeType) {
    case RuneType.Strength:
    case RuneType.Agility:
      baseBonus = 3;
      break;
    case RuneType.Vitality:
      baseBonus = 10;
      break;
    case RuneType.Power:
      baseBonus = 5;
      break;
    case RuneType.Defense:
      baseBonus = 4;
      break;
    case RuneType.CriticalChance:
      baseBonus = 2;
      break;
  }

  return {
    id: generateId(),
    name,
    type: runeType,
    rarity: runeRarity,
    bonus: Math.floor(baseBonus * rarityMult),
  };
}
