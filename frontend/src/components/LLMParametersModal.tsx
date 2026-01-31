import { useState } from 'react';
import { X, Faders, FloppyDisk, ArrowsClockwise, Code } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';

interface LLMParametersModalProps {
  onClose: () => void;
}

export default function LLMParametersModal({ onClose }: LLMParametersModalProps) {
  const { backend, llmParameters, setLLMParameters, updateBackendSetting } = useChatStore();
  const darkMode = useUIStore((state) => state.darkMode);
  
  // Standard parameters
  const [temperature, setTemperature] = useState(llmParameters.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(llmParameters.max_tokens ?? 1024);
  const [topP, setTopP] = useState(llmParameters.top_p ?? 1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(llmParameters.frequency_penalty ?? 0.0);
  const [presencePenalty, setPresencePenalty] = useState(llmParameters.presence_penalty ?? 0.0);
  const [seed, setSeed] = useState<number | undefined>(llmParameters.seed);
  const [stop, setStop] = useState<string>(llmParameters.stop ? (Array.isArray(llmParameters.stop) ? llmParameters.stop.join(', ') : llmParameters.stop) : '');
  
  // Auth/Connection
  const [apiKey, setApiKey] = useState(llmParameters.api_key || '');
  const [baseUrl, setBaseUrl] = useState(
    llmParameters.base_url || 
    (backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434')
  );

  // Custom parameters JSON
  const [customParamsStr, setCustomParamsStr] = useState(JSON.stringify(llmParameters.custom_params || {}, null, 2));
  const [isCustomValid, setIsCustomValid] = useState(true);

  // Backend specific parameters
  const [numCtx, setNumCtx] = useState(llmParameters.num_ctx ?? 2048); // Ollama specific

  const handleSave = async () => {
    let customParams = {};
    try {
      customParams = JSON.parse(customParamsStr);
    } catch (e) {
      setIsCustomValid(false);
      return;
    }

    const params: Record<string, any> = {
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed: seed !== undefined ? seed : null,
      stop: stop ? stop.split(',').map(s => s.trim()) : null,
      base_url: baseUrl,
      api_key: apiKey,
      custom_params: customParams,
      ...(backend === 'ollama' ? { num_ctx: numCtx } : {})
    };
    
    setLLMParameters(params);
    await updateBackendSetting(backend, baseUrl, apiKey);
    onClose();
  };

  const resetToDefaults = () => {
    setTemperature(0.7);
    setMaxTokens(1024);
    setTopP(1.0);
    setFrequencyPenalty(0.0);
    setPresencePenalty(0.0);
    setSeed(undefined);
    setStop('');
    setCustomParamsStr('{}');
    if (backend === 'ollama') setNumCtx(2048);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-2xl w-full max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${
          darkMode 
            ? 'bg-zinc-950 border border-white/10' 
            : 'bg-white border border-zinc-200 shadow-zinc-200/50'
        }`}
      >
        <div className="px-8 pt-8 pb-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              darkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200 shadow-sm'
            }`}>
              <Faders size={24} weight="fill" className="text-yellow-500" />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-[-0.02em] ${
                darkMode ? 'text-white' : 'text-black'
              }`}>System Architecture</h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${
                darkMode ? 'text-zinc-400' : 'text-zinc-500'
              }`}>Parameter configuration for {backend.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              darkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-white' : 'hover:bg-zinc-100/80 text-zinc-400 hover:text-black shadow-sm'
            }`}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
            {/* Left Column - Core Sliders */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    darkMode ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>Temperature</label>
                  <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                  }`}>{temperature.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    darkMode ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>Top P</label>
                  <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                  }`}>{topP.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    darkMode ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>Frequency Penalty</label>
                  <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                  }`}>{frequencyPenalty.toFixed(2)}</span>
                </div>
                <input type="range" min="-2" max="2" step="0.01" value={frequencyPenalty} onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
              </div>
            </div>

            {/* Right Column - Secondary Controls */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    darkMode ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>Max Tokens</label>
                  <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                  }`}>{maxTokens}</span>
                </div>
                <input type="range" min="1" max="16384" step="1" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    darkMode ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>Presence Penalty</label>
                  <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                  }`}>{presencePenalty.toFixed(2)}</span>
                </div>
                <input type="range" min="-2" max="2" step="0.01" value={presencePenalty} onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
              </div>

              {backend === 'ollama' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      darkMode ? 'text-zinc-500' : 'text-zinc-600'
                    }`}>Context Window</label>
                    <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${
                      darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                    }`}>{numCtx}</span>
                  </div>
                  <input type="range" min="512" max="128000" step="512" value={numCtx} onChange={(e) => setNumCtx(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
                </div>
              )}
            </div>
          </div>

          <div className={`h-[1px] w-full mb-8 ${darkMode ? 'bg-white/5' : 'bg-zinc-100'}`} />

          {/* Connection & Advanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Seed</label>
                <input type="number" value={seed ?? ''} onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full h-10 px-4 rounded-xl border outline-none font-bold text-[11px] transition-all ${
                    darkMode ? 'bg-white/5 border-white/5 text-white focus:border-white/20' : 'bg-white border-zinc-200 text-black focus:border-black'
                  }`} placeholder="Random" />
              </div>
              <div className="space-y-2">
                <label className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Stop Sequences</label>
                <input type="text" value={stop} onChange={(e) => setStop(e.target.value)}
                  className={`w-full h-10 px-4 rounded-xl border outline-none font-bold text-[11px] transition-all ${
                    darkMode ? 'bg-white/5 border-white/5 text-white focus:border-white/20' : 'bg-white border-zinc-200 text-black focus:border-black'
                  }`} placeholder="Separate with commas" />
              </div>
            </div>

            <div className="space-y-6">
              {backend === 'openai' ? (
                <div className="space-y-2">
                  <label className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>API Key</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full h-10 px-4 rounded-xl border outline-none font-bold text-[11px] transition-all ${
                      darkMode ? 'bg-white/5 border-white/5 text-white focus:border-white/20' : 'bg-white border-zinc-200 text-black focus:border-black'
                    }`} placeholder="sk-..." />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Base URL</label>
                  <input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                    className={`w-full h-10 px-4 rounded-xl border outline-none font-bold text-[11px] transition-all ${
                      darkMode ? 'bg-white/5 border-white/5 text-white focus:border-white/20' : 'bg-white border-zinc-200 text-black focus:border-black'
                    }`} placeholder="http://..." />
                </div>
              )}
            </div>
          </div>

          {/* Custom Params JSON Editor */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2">
              <Code size={12} weight="bold" className="opacity-40" />
              <label className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Custom Parameters (JSON)</label>
            </div>
            <textarea
              value={customParamsStr}
              onChange={(e) => {
                setCustomParamsStr(e.target.value);
                try {
                  JSON.parse(e.target.value);
                  setIsCustomValid(true);
                } catch {
                  setIsCustomValid(false);
                }
              }}
              rows={4}
              className={`w-full p-4 rounded-2xl border outline-none font-mono text-[10px] transition-all resize-none ${
                !isCustomValid 
                  ? 'border-red-500 bg-red-500/5' 
                  : darkMode ? 'bg-black border-white/10 text-zinc-300 focus:border-white/20' : 'bg-zinc-50 border-zinc-200 text-zinc-600 focus:border-black'
              }`}
            />
            {!isCustomValid && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Invalid JSON structure</p>}
          </div>
        </div>

        <div className={`px-8 py-6 border-t flex gap-4 flex-shrink-0 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
          <button onClick={resetToDefaults} className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer ${
            darkMode ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-200/50'
          }`}>
            <ArrowsClockwise size={18} weight="bold" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reset</span>
          </button>
          <button onClick={handleSave} className={`flex-[2] h-12 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
            darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'
          }`}>
            <FloppyDisk size={18} weight="bold" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Apply Configuration</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
