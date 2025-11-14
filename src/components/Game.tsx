import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Position, Weapon, Equipment, Rune } from '../types/game';
import { initializeGame, spawnBoss } from '../utils/gameInit';
import { calculateFOV } from '../utils/fov';
import { isPositionWalkable, getDistance } from '../utils/mapGenerator';
import {
  playerMeleeAttack,
  playerRangedAttack,
  enemyAttack,
  getEnemyAtPosition,
  bossSpecialAbility,
  checkPhaseTransition,
} from '../utils/combat';
import { moveEnemy, canEnemyAttackPlayer } from '../utils/ai';
import { getRandomRarity, generateWeapon, generateEquipment, generateRune } from '../utils/itemGenerator';
import { CharacterSelect } from './CharacterSelect';
import { GameMap } from './GameMap';
import { HUD } from './HUD';
import { MessageLog } from './MessageLog';
import { Inventory } from './Inventory';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Update FOV when player moves
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      calculateFOV(gameState.map, gameState.player.position, 10);
    }
  }, [gameState.player.position, gameState.gameStatus]);

  const addMessage = useCallback((message: string) => {
    setGameState((prev) => ({
      ...prev,
      messageLog: [...prev.messageLog, message],
    }));
  }, []);

  const handlePlayerMove = useCallback(
    (dx: number, dy: number) => {
      if (gameState.gameStatus !== 'playing') return;
      if (gameState.targetMode) return; // Can't move in target mode

      const newPos: Position = {
        x: gameState.player.position.x + dx,
        y: gameState.player.position.y + dy,
      };

      // Check if position is walkable
      if (!isPositionWalkable(gameState.map, newPos)) {
        return;
      }

      // Check for enemy at position (melee attack)
      const enemy = getEnemyAtPosition(gameState.enemies, newPos);
      const boss = gameState.boss && gameState.boss.position.x === newPos.x && gameState.boss.position.y === newPos.y
        ? gameState.boss
        : null;

      if (enemy) {
        // Melee attack enemy
        const result = playerMeleeAttack(gameState.player, enemy);
        addMessage(result.message);

        if (result.killed) {
          // Drop loot
          dropLoot(enemy.level, enemy.type === 'elite_mephit');

          // Remove enemy
          setGameState((prev) => {
            const newEnemies = prev.enemies.filter((e) => e.id !== enemy.id);

            // Check if all enemies defeated, spawn boss
            if (newEnemies.length === 0 && !prev.boss) {
              spawnBoss(prev);
            }

            return {
              ...prev,
              enemies: newEnemies,
            };
          });
        }

        // Enemy turn after player attacks
        processTurn();
        return;
      }

      if (boss) {
        // Melee attack boss
        const result = playerMeleeAttack(gameState.player, boss);
        addMessage(result.message);

        if (result.killed) {
          addMessage('Victory! Garm has been defeated!');
          addMessage('You have completed Stage 1!');
          setGameState((prev) => ({ ...prev, gameStatus: 'victory' }));
          return;
        }

        // Check phase transition
        if (checkPhaseTransition(boss)) {
          addMessage(`${boss.name} enters Phase 2!`);
          addMessage('The battle intensifies!');
        }

        // Enemy turn after player attacks
        processTurn();
        return;
      }

      // Move player
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          position: newPos,
        },
      }));

      // Enemy turn after player moves
      processTurn();
    },
    [gameState, addMessage]
  );

  const handleRangedAttack = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    if (!gameState.targetMode || !gameState.targetPosition) return;

    const targetEnemy = getEnemyAtPosition(gameState.enemies, gameState.targetPosition);
    const targetBoss =
      gameState.boss &&
      gameState.boss.position.x === gameState.targetPosition.x &&
      gameState.boss.position.y === gameState.targetPosition.y
        ? gameState.boss
        : null;

    const target = targetEnemy || targetBoss;

    if (!target) {
      addMessage('No enemy at target location!');
      setGameState((prev) => ({ ...prev, targetMode: false, targetPosition: null }));
      return;
    }

    const distance = getDistance(gameState.player.position, gameState.targetPosition);
    const result = playerRangedAttack(gameState.player, target, distance);

    if (!result) {
      addMessage('No ranged weapon equipped!');
      setGameState((prev) => ({ ...prev, targetMode: false, targetPosition: null }));
      return;
    }

    addMessage(result.message);

    if (result.killed) {
      if (targetEnemy) {
        // Drop loot
        dropLoot(targetEnemy.level, targetEnemy.type === 'elite_mephit');

        // Remove enemy
        setGameState((prev) => {
          const newEnemies = prev.enemies.filter((e) => e.id !== targetEnemy.id);

          // Check if all enemies defeated, spawn boss
          if (newEnemies.length === 0 && !prev.boss) {
            spawnBoss(prev);
          }

          return {
            ...prev,
            enemies: newEnemies,
            targetMode: false,
            targetPosition: null,
          };
        });
      } else if (targetBoss) {
        addMessage('Victory! Garm has been defeated!');
        addMessage('You have completed Stage 1!');
        setGameState((prev) => ({
          ...prev,
          gameStatus: 'victory',
          targetMode: false,
          targetPosition: null,
        }));
        return;
      }
    } else {
      // Check boss phase transition
      if (targetBoss && checkPhaseTransition(targetBoss)) {
        addMessage(`${targetBoss.name} enters Phase 2!`);
        addMessage('The battle intensifies!');
      }
    }

    // Exit target mode
    setGameState((prev) => ({ ...prev, targetMode: false, targetPosition: null }));

    // Enemy turn after player attacks
    processTurn();
  }, [gameState, addMessage]);

  const dropLoot = useCallback((enemyLevel: number, isBoss: boolean) => {
    const dropChance = isBoss ? 1.0 : 0.7;

    if (Math.random() < dropChance) {
      const lootType = Math.random();
      let item: Weapon | Equipment | Rune;

      if (lootType < 0.4) {
        // Weapon
        item = generateWeapon(undefined, getRandomRarity(isBoss), enemyLevel);
        addMessage(`Dropped: ${item.name}`);
        setGameState((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            inventory: {
              ...prev.player.inventory,
              weapons: [...prev.player.inventory.weapons, item as Weapon],
            },
          },
        }));
      } else if (lootType < 0.8) {
        // Equipment
        item = generateEquipment(undefined, getRandomRarity(isBoss), enemyLevel);
        addMessage(`Dropped: ${item.name}`);
        setGameState((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            inventory: {
              ...prev.player.inventory,
              equipment: [...prev.player.inventory.equipment, item as Equipment],
            },
          },
        }));
      } else {
        // Rune
        item = generateRune(undefined, getRandomRarity(isBoss));
        addMessage(`Dropped: ${item.name}`);
        setGameState((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            inventory: {
              ...prev.player.inventory,
              runes: [...prev.player.inventory.runes, item as Rune],
            },
          },
        }));
      }
    }
  }, [addMessage]);

  const processTurn = useCallback(() => {
    setGameState((prev) => {
      const newState = { ...prev };

      // Move enemies
      newState.enemies.forEach((enemy) => {
        moveEnemy(enemy, newState.player.position, newState.map, newState.enemies);

        // Check if enemy can attack player
        if (canEnemyAttackPlayer(enemy, newState.player.position)) {
          const result = enemyAttack(enemy, newState.player);
          newState.messageLog.push(result.message);

          // Check if player died
          if (result.killed) {
            newState.gameStatus = 'defeat';
          }
        }
      });

      // Boss turn
      if (newState.boss) {
        moveEnemy(newState.boss, newState.player.position, newState.map, [
          ...newState.enemies,
          newState.boss,
        ]);

        // Boss attack
        if (canEnemyAttackPlayer(newState.boss, newState.player.position)) {
          const result = enemyAttack(newState.boss, newState.player);
          newState.messageLog.push(result.message);

          // Check if player died
          if (result.killed) {
            newState.gameStatus = 'defeat';
          }
        }

        // Boss special abilities
        const abilityMessages = bossSpecialAbility(
          newState.boss,
          newState.player,
          newState.enemies
        );
        newState.messageLog.push(...abilityMessages);

        // Check if player died from special ability
        if (newState.player.stats.hp <= 0) {
          newState.gameStatus = 'defeat';
        }
      }

      newState.turnCount++;
      return newState;
    });
  }, []);

  const handleTargetMove = useCallback(
    (dx: number, dy: number) => {
      if (!gameState.targetMode) return;

      const currentPos = gameState.targetPosition || gameState.player.position;
      const newPos: Position = {
        x: currentPos.x + dx,
        y: currentPos.y + dy,
      };

      // Check if position is in bounds
      if (
        newPos.y >= 0 &&
        newPos.y < gameState.map.length &&
        newPos.x >= 0 &&
        newPos.x < gameState.map[0].length
      ) {
        setGameState((prev) => ({
          ...prev,
          targetPosition: newPos,
        }));
      }
    },
    [gameState]
  );

  // Keyboard handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      // Inventory toggle
      if (e.key === 'i' || e.key === 'I') {
        setInventoryOpen((prev) => !prev);
        return;
      }

      // Target mode toggle
      if (e.key === 'f' || e.key === 'F') {
        setGameState((prev) => ({
          ...prev,
          targetMode: !prev.targetMode,
          targetPosition: prev.targetMode ? null : prev.player.position,
        }));
        return;
      }

      // Confirm ranged attack
      if (e.key === 'Enter' && gameState.targetMode) {
        handleRangedAttack();
        return;
      }

      // Escape to cancel target mode
      if (e.key === 'Escape' && gameState.targetMode) {
        setGameState((prev) => ({
          ...prev,
          targetMode: false,
          targetPosition: null,
        }));
        return;
      }

      // Movement
      if (gameState.targetMode) {
        switch (e.key) {
          case 'ArrowUp':
            handleTargetMove(0, -1);
            break;
          case 'ArrowDown':
            handleTargetMove(0, 1);
            break;
          case 'ArrowLeft':
            handleTargetMove(-1, 0);
            break;
          case 'ArrowRight':
            handleTargetMove(1, 0);
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowUp':
            handlePlayerMove(0, -1);
            break;
          case 'ArrowDown':
            handlePlayerMove(0, 1);
            break;
          case 'ArrowLeft':
            handlePlayerMove(-1, 0);
            break;
          case 'ArrowRight':
            handlePlayerMove(1, 0);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handlePlayerMove, handleTargetMove, handleRangedAttack]);

  const handleStartGame = () => {
    setGameState((prev) => ({ ...prev, gameStatus: 'playing' }));
    calculateFOV(gameState.map, gameState.player.position, 10);
  };

  const handleEquipWeapon = (weapon: Weapon) => {
    setGameState((prev) => {
      const oldWeapon = prev.player.weapon;
      const newWeapons = prev.player.inventory.weapons.filter((w) => w.id !== weapon.id);

      if (oldWeapon) {
        newWeapons.push(oldWeapon);
      }

      addMessage(`Equipped: ${weapon.name}`);

      return {
        ...prev,
        player: {
          ...prev.player,
          weapon,
          inventory: {
            ...prev.player.inventory,
            weapons: newWeapons,
          },
        },
      };
    });
  };

  const handleEquipEquipment = (equipment: Equipment) => {
    setGameState((prev) => {
      const oldEquipment = prev.player.equipment[equipment.slot];
      const newEquipmentList = prev.player.inventory.equipment.filter((e) => e.id !== equipment.id);

      if (oldEquipment) {
        newEquipmentList.push(oldEquipment);
      }

      addMessage(`Equipped: ${equipment.name}`);

      return {
        ...prev,
        player: {
          ...prev.player,
          equipment: {
            ...prev.player.equipment,
            [equipment.slot]: equipment,
          },
          inventory: {
            ...prev.player.inventory,
            equipment: newEquipmentList,
          },
        },
      };
    });
  };

  const handleEquipRune = (_rune: Rune, _itemId: string, _isWeapon: boolean) => {
    // This is a placeholder for rune equipping functionality
    addMessage(`Rune equipping is not yet implemented in this PoC`);
  };

  if (gameState.gameStatus === 'menu') {
    return <CharacterSelect onStart={handleStartGame} />;
  }

  if (gameState.gameStatus === 'victory') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-green-400">Victory!</h1>
          <p className="text-2xl text-gray-300 mb-8">You have defeated Garm and completed Stage 1!</p>
          <button
            onClick={() => {
              setGameState(initializeGame());
              setGameState((prev) => ({ ...prev, gameStatus: 'menu' }));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'defeat') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-red-400">Defeat</h1>
          <p className="text-2xl text-gray-300 mb-8">Freya has fallen in battle...</p>
          <button
            onClick={() => {
              setGameState(initializeGame());
              setGameState((prev) => ({ ...prev, gameStatus: 'menu' }));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column - HUD */}
          <div className="lg:col-span-1">
            <HUD gameState={gameState} />
          </div>

          {/* Middle Column - Game Map */}
          <div className="lg:col-span-2">
            <GameMap gameState={gameState} />
            {gameState.targetMode && (
              <div className="mt-2 text-center text-yellow-400 text-sm">
                Target Mode: Use arrow keys to move cursor, Enter to fire, Esc to cancel
              </div>
            )}
          </div>

          {/* Right Column - Message Log */}
          <div className="lg:col-span-1">
            <MessageLog messages={gameState.messageLog} />
          </div>
        </div>
      </div>

      {/* Inventory Modal */}
      <Inventory
        player={gameState.player}
        isOpen={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        onEquipWeapon={handleEquipWeapon}
        onEquipEquipment={handleEquipEquipment}
        onEquipRune={handleEquipRune}
      />
    </div>
  );
};
