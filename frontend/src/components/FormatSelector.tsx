import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import { OutputFormat } from '../types';

const formats: { value: OutputFormat; label: string }[] = [
  { value: OutputFormat.DEFAULT, label: 'Default' },
  { value: OutputFormat.JSON, label: 'JSON Schema' },
  { value: OutputFormat.TEMPLATE, label: 'Template' },
  { value: OutputFormat.REGEX, label: 'Regex' },
  { value: OutputFormat.HTML, label: 'HTML' },
  { value: OutputFormat.CSV, label: 'CSV' },
];

export default function FormatSelector() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { backend, outputFormat, setOutputFormat, capabilities } = useChatStore();
  const [open, setOpen] = useState(false);

  const availableFormats = formats.filter(f => {
    const backendCapabilities = capabilities[backend] || [];
    // If capabilities are not yet loaded, show only default
    if (Object.keys(capabilities).length === 0) return f.value === OutputFormat.DEFAULT;
    return backendCapabilities.includes(f.value);
  });

  const selectedFormat = availableFormats.find((f) => f.value === outputFormat) || availableFormats[0];

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
          <span className="truncate">{selectedFormat?.label || 'FORMAT'}</span>
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
          align="end"
        >
          <div className="px-3 py-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ${
              darkMode ? 'text-white' : 'text-black'
            }`}>Output Protocol</span>
          </div>
          {availableFormats.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setOutputFormat(f.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-[10px] rounded-2xl flex items-center justify-between gap-2 transition-all font-black uppercase tracking-wider ${
                outputFormat === f.value
                  ? darkMode
                    ? 'bg-white text-black'
                    : 'bg-zinc-950 text-white shadow-xl shadow-zinc-950/20'
                  : darkMode
                    ? 'text-zinc-500 hover:bg-white/5 hover:text-white'
                    : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
              }`}
            >
              <span>{f.label}</span>
              {outputFormat === f.value && <Check size={14} weight="bold" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
