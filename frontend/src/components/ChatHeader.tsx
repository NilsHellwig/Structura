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
      <div className={`border-b ${
        darkMode ? 'border-zinc-800 bg-zinc-950 shadow-sm' : 'border-zinc-200 bg-white shadow-sm'
      }`}>
        <div className="w-full px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BackendSelector />
            <ModelSelector />
            <FormatSelector />
            <FormatEditorModal />
          </div>

          <Tooltip content="LLM Parameters">
            <button
              onClick={() => setShowModal(true)}
              className={`p-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                darkMode
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 border'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 border shadow-sm'
              }`}
            >
              <Gear size={20} weight="bold" />
            </button>
          </Tooltip>
        </div>
      </div>
      {showModal && <LLMParametersModal onClose={() => setShowModal(false)} />}
    </>
  );
}
