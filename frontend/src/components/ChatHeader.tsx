import { useState } from 'react';
import { Gear } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import Tooltip from './Tooltip';
import LLMParametersModal from './LLMParametersModal';
import BackendSelector from './BackendSelector';
import ModelSelector from './ModelSelector';
import FormatSelector from './FormatSelector';
import FormatEditorModal from './FormatEditorModal';

export default function ChatHeader() {
  const darkMode = useUIStore((state) => state.darkMode);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl">
        <div className={`rounded-2xl border flex items-center justify-between gap-3 px-4 py-2 backdrop-blur-md shadow-lg ${
          darkMode 
            ? 'bg-zinc-950/80 border-zinc-800' 
            : 'bg-white/90 border-zinc-100 shadow-zinc-200/50'
        }`}>
          <div className="flex items-center gap-1.5 grayscale-[0.5]">
            <BackendSelector />
            <div className={`h-4 w-[1px] ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <ModelSelector />
            <div className={`h-4 w-[1px] ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <FormatSelector />
            <FormatEditorModal />
          </div>

          <Tooltip content="LLM Parameters">
            <button
              onClick={() => setShowModal(true)}
              className={`p-2 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                darkMode
                  ? 'text-zinc-500 hover:text-yellow-500 hover:bg-zinc-800'
                  : 'text-zinc-400 hover:text-yellow-600 hover:bg-zinc-100'
              }`}
            >
              <Gear size={18} weight="bold" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="h-20 flex-shrink-0" /> {/* Spacer for the floating header */}
      {showModal && <LLMParametersModal onClose={() => setShowModal(false)} />}
    </>
  );
}
