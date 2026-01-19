import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CaretDown, Check, Cpu, GlobeHemisphereWest, Lightning } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import type { LLMBackend } from '../types';

const backends: { value: LLMBackend; label: string; icon: string; logo: string; description: string }[] = [
  { 
    value: 'ollama', 
    label: 'Ollama', 
    icon: '🦙', 
    logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ollama-icon.svg',
    description: 'Local generation engine for private and secure LLM execution on your own hardware.'
  },
  { 
    value: 'openai', 
    label: 'OpenAI', 
    icon: '🤖', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/OpenAI_logo_2025.svg',
    description: 'Industry-standard intelligence with powerful cloud models from the creators of ChatGPT.'
  },
  { 
    value: 'vllm', 
    label: 'vLLM', 
    icon: '⚡', 
    logo: 'https://raw.githubusercontent.com/vllm-project/media-kit/main/vLLM-Full-Logo.svg',
    description: 'High-performance serving framework optimized for throughput and large-scale deployments.'
  },
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
          className={`px-4 py-1.5 h-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 transition-all ${
            darkMode
              ? 'text-zinc-500 hover:text-white hover:bg-white/5'
              : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <div className="w-5 h-5 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-500/10 border border-zinc-500/20">
            {selectedBackend?.logo ? (
              <img src={selectedBackend.logo} alt={selectedBackend.label} className={`w-3.5 h-3.5 object-contain ${darkMode ? 'invert opacity-70' : 'opacity-80'}`} />
            ) : (
                <span className="text-sm">{selectedBackend?.icon}</span>
            )}
          </div>
          <span>{selectedBackend?.label}</span>
          <CaretDown size={14} weight="bold" className="opacity-40" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`z-[100] w-[320px] rounded-[2rem] border shadow-2xl p-3 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode
              ? 'bg-zinc-950/90 border-zinc-800 shadow-black/50'
              : 'bg-white/95 border-zinc-100 shadow-zinc-200/50'
          }`}
          sideOffset={12}
        >
          <div className="px-5 py-3 mb-2 flex flex-col gap-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${
              darkMode ? 'text-zinc-600' : 'text-zinc-400'
            }`}>Interface Architecture</span>
            <div className={`h-[1px] w-8 ${darkMode ? 'bg-yellow-500/30' : 'bg-yellow-500/50'}`} />
          </div>

          <div className="space-y-1.5">
            {backends.map((b) => (
              <button
                key={b.value}
                onClick={() => {
                  setBackend(b.value);
                  setOpen(false);
                }}
                className={`w-full group p-4 rounded-3xl flex items-start gap-5 transition-all relative overflow-hidden cursor-pointer ${
                  backend === b.value
                    ? darkMode
                      ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                      : 'bg-zinc-950 text-white shadow-2xl shadow-zinc-900/30'
                    : darkMode
                      ? 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {backend === b.value && (
                    <div className={`absolute top-0 right-0 p-3 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <Check size={14} weight="bold" />
                    </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border ${
                    backend === b.value
                        ? darkMode ? 'bg-zinc-50 border-white' : 'bg-zinc-800 border-zinc-700'
                        : darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                    <img 
                      src={b.logo} 
                      alt={b.label} 
                      className={`w-9 h-9 object-contain transition-all ${
                        backend === b.value 
                            ? 'opacity-100 grayscale-0' 
                            : 'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100'
                      } ${(darkMode && backend !== b.value) || (!darkMode && backend === b.value) ? 'invert' : ''}`} 
                    />
                </div>

                <div className="flex flex-col items-start gap-1 text-left pt-1">
                  <span className="text-[11px] font-black uppercase tracking-widest">{b.label}</span>
                  <p className={`text-[10px] leading-relaxed font-medium opacity-60 ${
                      backend === b.value 
                        ? darkMode ? 'text-zinc-600' : 'text-zinc-400' 
                        : ''
                  }`}>
                    {b.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className={`mt-3 pt-3 border-t px-4 py-2 ${darkMode ? 'border-zinc-900' : 'border-zinc-50'}`}>
             <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                 <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-yellow-500' : 'bg-yellow-600'}`} />
                 <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Active Channel Security Enabled
                 </span>
             </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
