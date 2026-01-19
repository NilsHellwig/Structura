import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check, Sparkle } from 'phosphor-react';
import toast from 'react-hot-toast';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import api from '../lib/api';

export default function ModelSelector() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { backend, model, setModel, llmParameters, availableModels: models, setAvailableModels } = useChatStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchModels = async () => {
      // Clear models immediately when backend or key parameters change to avoid stale data
      setAvailableModels([]);

      try {
        const response = await api.post('/llm/models', {
          backend,
          parameters: llmParameters,
        });
        
        if (!isMounted) return;

        const fetchedModels = response.data.models || [];
        setAvailableModels(fetchedModels);

        if (model && fetchedModels.length > 0 && !fetchedModels.includes(model)) {
          setModel('');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch models:', error);
        setAvailableModels([]);
        toast.error('Failed to load model list. Check backend connection.', {
          id: 'model-fetch-error',
        });
      }
    };

    fetchModels();
    return () => {
      isMounted = false;
    };
  }, [backend, llmParameters.base_url, llmParameters.api_key, setModel, setAvailableModels]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          disabled={!models.length}
          className={`px-4 py-1.5 h-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed ${
            darkMode
              ? 'text-zinc-500 hover:text-white hover:bg-white/5'
              : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <Sparkle size={16} weight="fill" className="text-yellow-500" />
          <span className="truncate max-w-[120px]">{model || 'SELECT MODEL'}</span>
          <CaretDown size={14} weight="bold" className="opacity-40" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-[100] min-w-[240px] rounded-[1.5rem] border shadow-2xl p-2 backdrop-blur-3xl animate-in fade-in zoom-in duration-200 ${
            darkMode
              ? 'bg-zinc-950/80 border-white/5 shadow-black/50'
              : 'bg-white border-zinc-200 shadow-zinc-200/50'
          }`}
          sideOffset={12}
          align="end"
        >
          <div className="px-3 py-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ${
              darkMode ? 'text-white' : 'text-black'
            }`}>Model Inventory</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModel(m);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-[10px] rounded-2xl flex items-center justify-between gap-2 transition-all font-black uppercase tracking-wider cursor-pointer ${
                  model === m
                    ? darkMode
                      ? 'bg-white text-black'
                      : 'bg-zinc-950 text-white shadow-xl shadow-zinc-950/20'
                    : darkMode
                      ? 'text-zinc-500 hover:bg-white/5 hover:text-white'
                      : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                }`}
              >
                <span className="truncate">{m}</span>
                {model === m && <Check size={14} weight="bold" />}
              </button>
            ))}
            {models.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className={`text-[10px] font-black uppercase tracking-widest opacity-20 ${
                  darkMode ? 'text-white' : 'text-black'
                }`}>No Models Found</p>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
