import { Code, Globe } from 'phosphor-react';
import { useUIStore } from '../../store/uiStore';

export default function HTMLEditor() {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className="p-8 space-y-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            <Globe size={16} weight="bold" />
            HTML Output Protocol
          </label>
        </div>

        <div className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-6 ${
          darkMode ? 'border-zinc-900 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50/30'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            darkMode ? 'bg-zinc-900 text-yellow-500' : 'bg-white text-yellow-600 shadow-sm'
          }`}>
            <Code size={24} weight="bold" />
          </div>
          <div className="space-y-2">
            <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${
              darkMode ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
              No configuration available
            </p>
            <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 leading-relaxed ${
              darkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              The LLM will be forced to output a valid HTML document (starting with &lt;!DOCTYPE html&gt;) matching the current system instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
