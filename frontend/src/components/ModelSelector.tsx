import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import api from '../lib/api';

export default function ModelSelector() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { backend, model, setModel } = useChatStore();
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.post('/llm/models', {
          backend,
          parameters: {},
        });
        const fetchedModels = response.data.models || [];
        setModels(fetchedModels);

        // If current model is not in the list (and list is not empty), clear it or pick first
        if (model && fetchedModels.length > 0 && !fetchedModels.includes(model)) {
          setModel(''); // This will trigger saveStoredModel(backend, '') which deletes the key
        } else if (!model && fetchedModels.length > 0) {
          // Optional: pick first if nothing selected? 
          // The request said "falls es das nicht gibt... nehme das nicht".
          // I'll leave it empty unless the user selects one, or pick the first if it's the first time.
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setModels([]);
      }
    };

    fetchModels();
  }, [backend]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          disabled={!models.length}
          className={`px-3 py-2 h-10 text-sm font-bold rounded-lg border flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
          }`}
        >
          <span className="truncate max-w-[150px]">{model || 'Select model'}</span>
          <CaretDown size={14} className="opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-50 min-w-[200px] max-h-[300px] overflow-y-auto rounded-lg border shadow-xl p-1.5 ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200'
          }`}
          sideOffset={8}
        >
          {models.map((m) => (
            <button
              key={m}
              onClick={() => {
                setModel(m);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between gap-2 transition-colors font-medium ${
                model === m
                  ? darkMode
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-zinc-900 text-white'
                  : darkMode
                    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span className="truncate">{m}</span>
              {model === m && <Check size={16} weight="bold" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
