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
          className={`px-3 py-2 h-10 text-sm font-bold rounded-lg border flex items-center gap-2 transition-all ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
          }`}
        >
          <span className="text-base leading-none">{selectedBackend?.icon}</span>
          <span>{selectedBackend?.label}</span>
          <CaretDown size={14} className="opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-50 min-w-[180px] rounded-lg border shadow-xl p-1.5 ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200'
          }`}
          sideOffset={8}
        >
          {backends.map((b) => (
            <button
              key={b.value}
              onClick={() => {
                setBackend(b.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between gap-2 transition-colors font-medium ${
                backend === b.value
                  ? darkMode
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-zinc-900 text-white'
                  : darkMode
                    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{b.icon}</span>
                <span>{b.label}</span>
              </div>
              {backend === b.value && <Check size={16} weight="bold" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
