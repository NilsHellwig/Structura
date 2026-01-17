import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import type { OutputFormat } from '../types';

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'json', label: 'JSON Schema' },
  { value: 'template', label: 'Template' },
  { value: 'regex', label: 'Regex' },
];

export default function FormatSelector() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { backend, outputFormat, setOutputFormat } = useChatStore();
  const [open, setOpen] = useState(false);

  const availableFormats = formats.filter(f => {
    if (f.value === 'regex' && backend !== 'vllm') return false;
    if (f.value === 'template' && backend !== 'vllm') return false;
    return true;
  });

  const selectedFormat = availableFormats.find((f) => f.value === outputFormat) || availableFormats[0];

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
          <span>{selectedFormat?.label}</span>
          <CaretDown size={14} className="opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-50 min-w-[160px] rounded-lg border shadow-xl p-1.5 ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200'
          }`}
          sideOffset={8}
        >
          {availableFormats.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setOutputFormat(f.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between gap-2 transition-colors font-medium ${
                outputFormat === f.value
                  ? darkMode
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-zinc-900 text-white'
                  : darkMode
                    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span>{f.label}</span>
              {outputFormat === f.value && <Check size={16} weight="bold" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
