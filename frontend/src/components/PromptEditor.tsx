import { useRef, useEffect, useState } from 'react';
import { PaperPlaneRight, CircleNotch, StopCircle } from 'phosphor-react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';

const STORAGE_KEY_PROMPT_HISTORY = 'structura_prompt_history';

export default function PromptEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const {
    currentConversationId,
    prompt,
    setPrompt,
    outputFormat,
    isLoading,
    setIsLoading,
    messages,
    setMessages,
    backend,
    model,
    formatSpec,
    llmParameters,
    createNewConversation,
    sendMessage,
    stopGeneration,
  } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROMPT_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
        handleSend();
      }
    } else if (e.key === 'ArrowUp') {
      const isAtStart = textareaRef.current?.selectionStart === 0;
      if (isAtStart && historyIndex < promptHistory.length - 1) {
        e.preventDefault();
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setPrompt(promptHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      const isAtEnd = textareaRef.current?.selectionStart === prompt.length;
      if (isAtEnd && historyIndex > 0) {
        e.preventDefault();
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setPrompt(promptHistory[nextIndex]);
      } else if (isAtEnd && historyIndex === 0) {
        e.preventDefault();
        setHistoryIndex(-1);
        setPrompt('');
      }
    }
  };

  const handleStop = () => {
    stopGeneration();
    toast.success('Generierung gestoppt');
  };

  const handleSend = async () => {
    if (!prompt?.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (isLoading) return;

    // Save to history
    const newHistory = [prompt, ...promptHistory.filter(p => p !== prompt)].slice(0, 50);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY_PROMPT_HISTORY, JSON.stringify(newHistory));
    setHistoryIndex(-1);

    try {
      await sendMessage();
      toast.success('Response complete');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  return (
    <div className="px-6 pb-8 pt-4">
      <div className={`max-w-4xl mx-auto rounded-3xl shadow-2xl border pointer-events-auto transition-all backdrop-blur-xl ${
        darkMode 
          ? 'bg-zinc-950/80 border-zinc-800 shadow-black/40' 
          : 'bg-white/90 border-zinc-100 shadow-zinc-200/40'
      }`}>
        <div className="p-4 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={prompt || ''}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Structura..."
            className={`flex-1 resize-none outline-none bg-transparent text-sm font-bold leading-relaxed max-h-[240px] py-3 px-2 ${
              darkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'
            }`}
            rows={1}
          />
          <div className="flex items-center gap-2 pb-1">
            {isLoading ? (
              <button
                onClick={handleStop}
                className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                  darkMode
                    ? 'bg-zinc-800 text-red-400'
                    : 'bg-zinc-100 text-red-600'
                }`}
              >
                <CircleNotch size={22} className="animate-spin absolute opacity-20" />
                <StopCircle size={24} weight="fill" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!prompt?.trim()}
                className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all active:scale-95 ${
                  !prompt?.trim()
                    ? 'opacity-20 grayscale cursor-not-allowed'
                    : darkMode
                      ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-lg shadow-white/5'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10'
                }`}
              >
                <PaperPlaneRight size={22} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Helper info inside the editor */}
        <div className={`px-6 pb-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <span>{backend}</span>
          <span className="opacity-30">•</span>
          <span>{model || 'NO MODEL SELECTED'}</span>
          <span className="opacity-30">•</span>
          <span>{outputFormat}</span>
        </div>
      </div>
    </div>
  );
}
