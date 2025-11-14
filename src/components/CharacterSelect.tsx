import React from 'react';

interface CharacterSelectProps {
  onStart: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            TooHuman Roguelike
          </h1>
          <p className="text-xl text-gray-400">A Norse Mythology Inspired Adventure</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border-2 border-blue-500 shadow-xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 text-blue-400">Freya</h2>
            <p className="text-sm text-gray-400 mb-4">Goddess of Love, Beauty, and War</p>
          </div>

          <div className="bg-gray-900 rounded p-4 mb-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">Champion Class</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div>
                  <span className="font-semibold">Pistol Master:</span>
                  <span className="text-gray-300"> Enhanced accuracy and damage with pistols</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div>
                  <span className="font-semibold">Critical Strike:</span>
                  <span className="text-gray-300"> 2x damage on critical hits</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div>
                  <span className="font-semibold">Valiant's Might:</span>
                  <span className="text-gray-300"> Battle cry that launches enemies airborne</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">Starting Stats</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">HP:</span>
                <span className="text-green-400 font-semibold">100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Attack:</span>
                <span className="text-red-400 font-semibold">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Defense:</span>
                <span className="text-blue-400 font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Speed:</span>
                <span className="text-purple-400 font-semibold">10</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Controls</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="font-semibold text-cyan-400">Arrow Keys:</span> Move and attack (melee)</p>
              <p><span className="font-semibold text-cyan-400">F:</span> Toggle ranged attack targeting</p>
              <p><span className="font-semibold text-cyan-400">I:</span> Toggle inventory</p>
              <p><span className="font-semibold text-cyan-400">G:</span> Pick up items</p>
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Begin Your Journey
          </button>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Stage 1: The Cyber Realms</p>
        </div>
      </div>
    </div>
  );
};
