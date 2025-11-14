import React, { useEffect, useRef } from 'react';

interface MessageLogProps {
  messages: string[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show last 10 messages
  const displayMessages = messages.slice(-10);

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 h-48 overflow-y-auto">
      <h3 className="text-sm font-semibold text-cyan-400 mb-2">Message Log</h3>
      <div className="space-y-1 text-sm font-mono">
        {displayMessages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.includes('CRITICAL') || message.includes('kills')
                ? 'text-red-400 font-semibold'
                : message.includes('damage')
                ? 'text-orange-300'
                : message.includes('picked up') || message.includes('equipped')
                ? 'text-green-400'
                : message.includes('appears') || message.includes('emerged')
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            {message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
