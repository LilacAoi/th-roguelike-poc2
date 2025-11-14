import React, { useEffect, useRef } from 'react';

interface MessageLogProps {
  messages: string[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show last 30 messages (3x the original 10)
  const displayMessages = messages.slice(-30);

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 h-[576px] overflow-y-auto">
      <h3 className="text-sm font-semibold text-cyan-400 mb-2">Message Log</h3>
      <div className="space-y-1 text-sm font-mono">
        {displayMessages.map((message, index) => {
          // Determine message color based on content
          let colorClass = 'text-gray-300';

          // Player attacks (Freya attacking) - Green
          if (message.startsWith('Freya attacks')) {
            colorClass = 'text-green-400';
            if (message.includes('CRITICAL')) {
              colorClass = 'text-green-300 font-bold';
            }
          }
          // Enemy attacks (anything attacks Freya) - Red
          else if (message.includes('attacks Freya')) {
            colorClass = 'text-red-400';
            if (message.includes('CRITICAL')) {
              colorClass = 'text-red-300 font-bold';
            }
          }
          // Kill messages
          else if (message.includes('kills')) {
            colorClass = message.startsWith('Freya')
              ? 'text-green-400 font-semibold'
              : 'text-red-400 font-semibold';
          }
          // Critical hits (fallback)
          else if (message.includes('CRITICAL')) {
            colorClass = 'text-yellow-400 font-semibold';
          }
          // Item pickups/equips
          else if (message.includes('picked up') || message.includes('Equipped')) {
            colorClass = 'text-green-400';
          }
          // Enemy spawns
          else if (message.includes('appears') || message.includes('emerged')) {
            colorClass = 'text-yellow-400';
          }
          // Rest messages
          else if (message.includes('Resting') || message.includes('rested')) {
            colorClass = 'text-cyan-400';
          }

          return (
            <div key={index} className={colorClass}>
              {message}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
