import { useState } from 'react';
import { X, Faders, FloppyDisk, ArrowsClockwise } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';

interface LLMParametersModalProps {
  onClose: () => void;
}

export default function LLMParametersModal({ onClose }: LLMParametersModalProps) {
  const { backend, llmParameters, setLLMParameters, updateBackendSetting } = useChatStore();
  const darkMode = useUIStore((state) => state.darkMode);
  
  const [temperature, setTemperature] = useState(llmParameters.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(llmParameters.max_tokens || 1024);
  const [topP, setTopP] = useState(llmParameters.top_p || 1.0);
  const [apiKey, setApiKey] = useState(llmParameters.api_key || '');
  const [baseUrl, setBaseUrl] = useState(
    llmParameters.base_url || 
    (backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434')
  );

  const handleSave = async () => {
    const params: Record<string, any> = {
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      base_url: baseUrl,
      api_key: apiKey
    };
    
    setLLMParameters(params);
    
    // Persist base_url and api_key to backend
    await updateBackendSetting(backend, baseUrl, apiKey);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden ${
          darkMode 
            ? 'bg-zinc-950 border border-white/10' 
            : 'bg-white border border-zinc-200 shadow-zinc-200/50'
        }`}
      >
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              darkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200 shadow-sm'
            }`}>
              <Faders size={24} weight="fill" className="text-blue-500" />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-[-0.02em] ${
                darkMode ? 'text-white' : 'text-black'
              }`}>Intelligence</h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${
                darkMode ? 'text-zinc-400' : 'text-zinc-500'
              }`}>System Parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-2xl transition-all ${
              darkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-white' : 'hover:bg-zinc-100/80 text-zinc-400 hover:text-black shadow-sm'
            }`}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="px-10 py-6 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}>
                Temperature
              </label>
              <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                darkMode ? 'bg-white/5 text-blue-400' : 'bg-zinc-50 text-blue-600 border border-zinc-100 shadow-sm'
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
              className="slider-zinc w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}>
                Max Tokens
              </label>
              <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                darkMode ? 'bg-white/5 text-purple-400' : 'bg-zinc-100 text-purple-600'
              }`}>
                {maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8192"
              step="1"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="slider-zinc w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}>
                Top P
              </label>
              <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                darkMode ? 'bg-white/5 text-orange-400' : 'bg-zinc-100 text-orange-600'
              }`}>
                {topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="slider-zinc w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {backend === 'openai' && (
            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}>
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full h-14 px-6 rounded-2xl border outline-none font-bold text-sm transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/5 text-white placeholder-zinc-700 focus:border-white/10'
                    : 'bg-white border-zinc-200 text-black placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>
          )}

          {backend !== 'openai' && (
            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}>
                Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434'}
                className={`w-full h-14 px-6 rounded-2xl border outline-none font-bold text-sm transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/5 text-white placeholder-zinc-700 focus:border-white/10'
                    : 'bg-white border-zinc-200 text-black placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>
          )}

          <div className="pt-2 flex gap-4">
            <button
              onClick={() => {
                setTemperature(0.7);
                setMaxTokens(1024);
                setTopP(1.0);
              }}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                darkMode 
                  ? 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5' 
                  : 'bg-white text-zinc-400 hover:bg-zinc-50 hover:text-black border border-zinc-200 shadow-sm'
              }`}
            >
              <ArrowsClockwise size={20} weight="bold" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reset</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex-[2] h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                darkMode 
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5' 
                  : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl shadow-black/10'
              }`}
            >
              <FloppyDisk size={20} weight="bold" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Save</span>
            </button>
          </div>
        </div>
        
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
