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

  const getMessageColor = (message: string): string => {
    // Player attacks (green)
    if (message.includes('Freya attacks')) {
      if (message.includes('kills')) {
        return 'text-green-500 font-bold';
      }
      if (message.includes('CRITICAL')) {
        return 'text-green-400 font-bold';
      }
      return 'text-green-400';
    }

    // Enemy attacks (red)
    if (message.includes('attacks Freya') ||
        (message.includes('takes') && message.includes('damage') && message.includes('Freya'))) {
      if (message.includes('CRITICAL')) {
        return 'text-red-500 font-bold';
      }
      return 'text-red-400';
    }

    // Item pickups/equipped
    if (message.includes('Dropped') || message.includes('Equipped')) {
      return 'text-yellow-300';
    }

    // Boss/enemy spawns
    if (message.includes('appears') || message.includes('appeared') || message.includes('emerged')) {
      return 'text-orange-400 font-semibold';
    }

    // Victory/defeat
    if (message.includes('Victory') || message.includes('completed')) {
      return 'text-green-500 font-bold';
    }

    // Rest messages
    if (message.includes('rest') || message.includes('HP +') || message.includes('recovered')) {
      return 'text-cyan-400';
    }

    // Default
    return 'text-gray-300';
  };

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 h-[36rem] overflow-y-auto">
      <h3 className="text-sm font-semibold text-cyan-400 mb-2">Message Log</h3>
      <div className="space-y-1 text-sm font-mono">
        {displayMessages.map((message, index) => (
          <div key={index} className={getMessageColor(message)}>
            {message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
