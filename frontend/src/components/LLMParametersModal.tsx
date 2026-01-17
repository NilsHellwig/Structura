import { useState } from 'react';
import { X, Faders, FloppyDisk, ArrowsClockwise } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';

interface LLMParametersModalProps {
  onClose: () => void;
}

export default function LLMParametersModal({ onClose }: LLMParametersModalProps) {
  const { backend, llmParameters, setLLMParameters } = useChatStore();
  const darkMode = useUIStore((state) => state.darkMode);
  
  const [temperature, setTemperature] = useState(llmParameters.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(llmParameters.max_tokens || 2048);
  const [topP, setTopP] = useState(llmParameters.top_p || 1.0);
  const [apiKey, setApiKey] = useState(llmParameters.api_key || '');
  const [baseUrl, setBaseUrl] = useState(
    llmParameters.base_url || 
    (backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434')
  );

  const handleSave = () => {
    const params: Record<string, any> = {
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
    };
    
    if (backend === 'openai' && apiKey) {
      params.api_key = apiKey;
    }
    
    if (backend !== 'openai' && baseUrl) {
      params.base_url = baseUrl;
    }
    
    setLLMParameters(params);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-md w-full rounded-lg p-6 shadow-2xl ${
          darkMode 
            ? 'bg-zinc-950 border border-zinc-800' 
            : 'bg-white border border-zinc-200 shadow-zinc-200/50'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Faders size={24} weight="bold" className={darkMode ? 'text-zinc-100' : 'text-zinc-900'} />
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-zinc-100' : 'text-zinc-900'
            }`}>LLM Parameters</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
            }`}
          >
            <X size={20} weight="bold" />
          </motion.button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Temperature
              </label>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="slider-zinc w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Top P
              </label>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {topP.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="slider-zinc w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${
              darkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              Max Tokens
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-lg border outline-none font-medium text-sm transition-all ${
                darkMode
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-100'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-900'
              }`}
            />
          </div>

          {backend === 'openai' && (
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                API Key (optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full px-4 py-3 rounded-lg border outline-none font-medium text-sm transition-all ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-zinc-100'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'
                }`}
              />
            </div>
          )}

          {backend !== 'openai' && (
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434'}
                className={`w-full px-4 py-3 rounded-lg border outline-none font-medium text-sm transition-all ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-zinc-100'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'
                }`}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              darkMode
                ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            <X size={16} weight="bold" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              darkMode
                ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 text-zinc-50'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
