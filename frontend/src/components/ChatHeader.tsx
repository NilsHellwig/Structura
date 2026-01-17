import { useState, useEffect } from 'react';
import { Gear } from 'phosphor-react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { LLMBackend, OutputFormat } from '../types';
import { api } from '../lib/api';
import LLMParametersModal from './LLMParametersModal';

export default function ChatHeader() {
  const darkMode = useUIStore((state) => state.darkMode);
  const {
    backend: selectedBackend,
    model: selectedModel,
    outputFormat,
    setBackend,
    setModel,
    setOutputFormat,
  } = useChatStore();

  const { showParameters, setShowParameters } = useUIStore();
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.get(`/llm/models?backend=${selectedBackend}`);
        setModels(response.data);
        if (response.data.length > 0 && !response.data.includes(selectedModel)) {
          setModel(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setModels([]);
      }
    };

    fetchModels();
  }, [selectedBackend]);

  return (
    <>
      <div className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto w-full px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
          {/* Backend Selection */}
          <select
            value={selectedBackend}
            onChange={(e) => setBackend(e.target.value as LLMBackend)}
            className={`px-2.5 py-1 text-sm rounded border outline-none transition-colors ${
              darkMode
                ? 'bg-neutral-900 border-gray-700 text-white hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
            }`}
          >
            <option value={LLMBackend.OPENAI}>OpenAI</option>
            <option value={LLMBackend.OLLAMA}>Ollama</option>
          </select>

          {/* Model Selection */}
          <select
            value={selectedModel}
            onChange={(e) => setModel(e.target.value)}
            disabled={!models.length}
            className={`px-2.5 py-1 text-sm rounded border outline-none transition-colors disabled:opacity-50 ${
              darkMode
                ? 'bg-neutral-900 border-gray-700 text-white hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
            }`}
          >
            {models.length > 0 ? (
              models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))
            ) : (
              <option value="">No models</option>
            )}
          </select>

          {/* Format Selection */}
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            className={`px-2.5 py-1 text-sm rounded border outline-none transition-colors ${
              darkMode
                ? 'bg-neutral-900 border-gray-700 text-white hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
            }`}
          >
            <option value={OutputFormat.FREETEXT}>Freetext</option>
            <option value={OutputFormat.JSON}>JSON Schema</option>
            <option value={OutputFormat.TEMPLATE}>Template</option>
            <option value={OutputFormat.REGEX}>Regex</option>
          </select>
        </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowParameters(true)}
            className={`p-1.5 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="LLM Parameters"
          >
            <Gear size={16} />
          </button>
        </div>
      </div>

      {showParameters && (
        <LLMParametersModal onClose={() => setShowParameters(false)} />
      )}
    </>
  );
}
