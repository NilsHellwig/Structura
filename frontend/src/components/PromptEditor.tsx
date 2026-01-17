import { useRef, useEffect } from 'react';
import { PaperPlaneRight, CircleNotch, BracketsAngle } from 'phosphor-react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { OutputFormat } from '../types';

interface PromptEditorProps {
  onSend: () => void;
}

export default function PromptEditor({ onSend }: PromptEditorProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  const { prompt, setPrompt, outputFormat, isLoading } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt?.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (prompt?.trim() && !isLoading) {
      onSend();
    }
  };

  const handleInsertFormat = () => {
    const formatPlaceholders = {
      [OutputFormat.JSON]: '{json}',
      [OutputFormat.TEMPLATE]: '{template}',
      [OutputFormat.REGEX]: '{regex}',
      [OutputFormat.FREETEXT]: '',
    };
    const placeholder = formatPlaceholders[outputFormat];
    if (placeholder) {
      setPrompt((prompt || '') + (prompt ? ' ' : '') + placeholder);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className={`border-t px-6 py-4 ${
      darkMode
        ? 'bg-[#0d0d0d] border-gray-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          {/* Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={prompt || ''}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              disabled={isLoading}
              rows={1}
              className={`w-full px-3 py-2 text-sm rounded border outline-none resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-neutral-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
              }`}
            />
          </div>

          {/* Format Insert Helper */}
          {outputFormat !== OutputFormat.FREETEXT && (
            <button
              onClick={handleInsertFormat}
              disabled={!prompt?.trim()}
              className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Insert format placeholder"
            >
              <BracketsAngle size={16} />
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!prompt?.trim() || isLoading}
            className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? (
              <CircleNotch size={16} className="animate-spin" />
            ) : (
              <PaperPlaneRight size={16} weight="fill" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
