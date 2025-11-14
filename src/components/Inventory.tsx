import React from 'react';
import type { Player, Weapon, Equipment, Rune } from '../types/game';
import { RarityColors } from '../types/game';

interface InventoryProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onEquipWeapon: (weapon: Weapon) => void;
  onEquipEquipment: (equipment: Equipment) => void;
  onEquipRune: (rune: Rune, itemId: string, isWeapon: boolean) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  player,
  isOpen,
  onClose,
  onEquipWeapon,
  onEquipEquipment,
  onEquipRune: _onEquipRune,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-400">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Equipped Items */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-yellow-400 mb-3">Equipped</h3>

          {/* Current Weapons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Melee Weapon */}
            <div className="bg-gray-800 p-3 rounded">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Melee Weapon</h4>
              {player.meleeWeapon ? (
                <div className="text-sm">
                  <p className={`font-semibold ${RarityColors[player.meleeWeapon.rarity]}`}>
                    {player.meleeWeapon.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {player.meleeWeapon.type} | Damage: {player.meleeWeapon.damage}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Crit: {(player.meleeWeapon.critChance * 100).toFixed(0)}% | Mult: {player.meleeWeapon.critMultiplier.toFixed(1)}x
                  </p>
                  {player.meleeWeapon.runeSlots > 0 && (
                    <p className="text-gray-400 text-xs">
                      Rune Slots: {player.meleeWeapon.equippedRunes.length}/{player.meleeWeapon.runeSlots}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">None</p>
              )}
            </div>

            {/* Ranged Weapon */}
            <div className="bg-gray-800 p-3 rounded">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Ranged Weapon</h4>
              {player.rangedWeapon ? (
                <div className="text-sm">
                  <p className={`font-semibold ${RarityColors[player.rangedWeapon.rarity]}`}>
                    {player.rangedWeapon.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {player.rangedWeapon.type} | Damage: {player.rangedWeapon.damage} | Range: {player.rangedWeapon.range}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Crit: {(player.rangedWeapon.critChance * 100).toFixed(0)}% | Mult: {player.rangedWeapon.critMultiplier.toFixed(1)}x
                  </p>
                  {player.rangedWeapon.runeSlots > 0 && (
                    <p className="text-gray-400 text-xs">
                      Rune Slots: {player.rangedWeapon.equippedRunes.length}/{player.rangedWeapon.runeSlots}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">None</p>
              )}
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(player.equipment).map(([slot, equip]) => (
              <div key={slot} className="bg-gray-800 p-3 rounded">
                <h4 className="text-sm font-semibold text-cyan-400 mb-1 capitalize">
                  {slot.replace('_', ' ')}
                </h4>
                {equip ? (
                  <div className="text-xs">
                    <p className={`font-semibold ${RarityColors[equip.rarity]}`}>
                      {equip.name}
                    </p>
                    <p className="text-gray-400">
                      DEF: {equip.defense} | HP: +{equip.health}
                    </p>
                    <p className="text-gray-400">
                      STR: +{equip.strength} | AGI: +{equip.agility}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Empty</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Tabs */}
        <div className="space-y-4">
          {/* Weapons */}
          {player.inventory.weapons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Weapons ({player.inventory.weapons.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {player.inventory.weapons.map((weapon) => (
                  <div
                    key={weapon.id}
                    className="bg-gray-800 p-3 rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => onEquipWeapon(weapon)}
                  >
                    <p className={`font-semibold text-sm ${RarityColors[weapon.rarity]}`}>
                      {weapon.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {weapon.type} | DMG: {weapon.damage} | RNG: {weapon.range}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Crit: {(weapon.critChance * 100).toFixed(0)}% | x{weapon.critMultiplier.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {player.inventory.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Equipment ({player.inventory.equipment.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {player.inventory.equipment.map((equip) => (
                  <div
                    key={equip.id}
                    className="bg-gray-800 p-3 rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => onEquipEquipment(equip)}
                  >
                    <p className={`font-semibold text-sm ${RarityColors[equip.rarity]}`}>
                      {equip.name}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {equip.slot.replace('_', ' ')}
                    </p>
                    <p className="text-gray-400 text-xs">
                      DEF: {equip.defense} | HP: +{equip.health}
                    </p>
                    <p className="text-gray-400 text-xs">
                      STR: +{equip.strength} | AGI: +{equip.agility}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Runes */}
          {player.inventory.runes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                Runes ({player.inventory.runes.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {player.inventory.runes.map((rune) => (
                  <div
                    key={rune.id}
                    className="bg-gray-800 p-2 rounded hover:bg-gray-700 cursor-pointer"
                  >
                    <p className={`font-semibold text-xs ${RarityColors[rune.rarity]}`}>
                      {rune.name}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {rune.type.replace('_', ' ')}: +{rune.bonus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Inventory */}
          {player.inventory.weapons.length === 0 &&
            player.inventory.equipment.length === 0 &&
            player.inventory.runes.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Your inventory is empty.</p>
                <p className="text-sm mt-2">Defeat enemies to collect loot!</p>
              </div>
            )}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Click on an item to equip it
        </div>
      </div>
    </div>
  );
};
