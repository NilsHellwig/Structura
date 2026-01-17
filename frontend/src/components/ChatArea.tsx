import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Robot, Sparkle } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import type { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto ${
      darkMode ? 'bg-[#0d0d0d]' : 'bg-white'
    }`}>
      {!messages || messages.length === 0 ? (
        <div className="h-full flex items-center justify-center px-6 py-10">
          <div className="text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <Sparkle size={40} weight="duotone" className={`mx-auto ${
                darkMode ? 'text-gray-700' : 'text-gray-300'
              }`} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-lg font-medium mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Start a conversation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm ${
                darkMode ? 'text-gray-600' : 'text-gray-500'
              }`}
            >
              Select a backend, model, and output format to begin
            </motion.p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`group px-6 py-4 ${
                message.role === 'user'
                  ? ''
                  : darkMode ? 'bg-neutral-900/50' : 'bg-gray-50'
              }`}
            >
              <div className="max-w-4xl mx-auto flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 pt-1">
                  {message.role === 'user' ? (
                    <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                      darkMode ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      <User size={14} weight="bold" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                      darkMode ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      <Robot size={14} weight="bold" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-1.5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                  {message.role === 'assistant' && (
                    <div className={`text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {message.backend} • {message.model} • {message.output_format}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
