import { useState } from 'react';
import { X, Faders } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { LLMBackend } from '../types';

interface LLMParametersModalProps {
  onClose: () => void;
}

export default function LLMParametersModal({ onClose }: LLMParametersModalProps) {
  const { selectedBackend, llmParameters, setLLMParameters } = useChatStore();
  const darkMode = useUIStore((state) => state.darkMode);
  
  const [temperature, setTemperature] = useState(llmParameters.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(llmParameters.max_tokens || 2048);
  const [apiKey, setApiKey] = useState(llmParameters.api_key || '');
  const [baseUrl, setBaseUrl] = useState(
    llmParameters.base_url || 
    (selectedBackend === LLMBackend.VLLM ? 'http://localhost:8000' : 'http://localhost:11434')
  );

  const handleSave = () => {
    const params: Record<string, any> = {
      temperature,
      max_tokens: maxTokens,
    };
    
    if (selectedBackend === LLMBackend.OPENAI && apiKey) {
      params.api_key = apiKey;
    }
    
    if (selectedBackend !== LLMBackend.OPENAI && baseUrl) {
      params.base_url = baseUrl;
    }
    
    setLLMParameters(params);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-md w-full rounded-2xl p-6 shadow-2xl ${
          darkMode 
            ? 'bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)]' 
            : 'bg-white border border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Faders size={24} weight="bold" className="text-[var(--color-primary)]" />
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>LLM Parameter</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} weight="bold" className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </motion.button>
        </div>

        <div className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Temperature ({temperature.toFixed(1)})
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className={`text-xs mt-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Niedrigere Werte = konsistentere Antworten, höhere Werte = kreativere Antworten
            </p>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Max Tokens
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              }`}
            />
          </div>

          {selectedBackend === LLMBackend.OPENAI && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                API Key (optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
              <p className={`text-xs mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Falls nicht gesetzt, wird der API Key aus der .env verwendet
              </p>
            </div>
          )}

          {selectedBackend !== LLMBackend.OPENAI && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={selectedBackend === LLMBackend.VLLM ? 'http://localhost:8000' : 'http://localhost:11434'}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
          >
            Speichern
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Abbrechen
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
