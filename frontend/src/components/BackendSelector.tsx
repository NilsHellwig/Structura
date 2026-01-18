import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import type { LLMBackend } from '../types';

const backends: { value: LLMBackend; label: string; icon: string }[] = [
  { value: 'ollama', label: 'Ollama', icon: '🦙' },
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'vllm', label: 'vLLM', icon: '⚡' },
];

export default function BackendSelector() {
  const darkMode = useUIStore((state) => state.darkMode);
  const backend = useChatStore((state) => state.backend);
  const setBackend = useChatStore((state) => state.setBackend);
  const [open, setOpen] = useState(false);

  const selectedBackend = backends.find((b) => b.value === backend);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={`px-4 py-1.5 h-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-2 transition-all ${
            darkMode
              ? 'text-zinc-500 hover:text-white hover:bg-white/5'
              : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <span className="text-base grayscale opacity-50">{selectedBackend?.icon}</span>
          <span>{selectedBackend?.label}</span>
          <CaretDown size={14} weight="bold" className="opacity-40" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-[100] min-w-[200px] rounded-[1.5rem] border shadow-2xl p-2 backdrop-blur-3xl animate-in fade-in zoom-in duration-200 ${
            darkMode
              ? 'bg-zinc-950/80 border-white/5 shadow-black/50'
              : 'bg-white border-zinc-200 shadow-zinc-200/50'
          }`}
          sideOffset={12}
        >
          <div className="px-3 py-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ${
              darkMode ? 'text-white' : 'text-black'
            }`}>Interface Architecture</span>
          </div>
          {backends.map((b) => (
            <button
              key={b.value}
              onClick={() => {
                setBackend(b.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-[10px] rounded-2xl flex items-center justify-between gap-2 transition-all font-black uppercase tracking-wider ${
                backend === b.value
                  ? darkMode
                    ? 'bg-white text-black'
                    : 'bg-zinc-950 text-white shadow-xl shadow-zinc-950/20'
                  : darkMode
                    ? 'text-zinc-500 hover:bg-white/5 hover:text-white'
                    : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base grayscale transition-all ${backend === b.value ? 'grayscale-0' : 'group-hover:grayscale-0'}`}>{b.icon}</span>
                <span>{b.label}</span>
              </div>
              {backend === b.value && <Check size={14} weight="bold" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
