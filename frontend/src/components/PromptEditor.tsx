import { useRef, useEffect, useState } from 'react';
import { PaperPlaneRight, CircleNotch, StopCircle, Code } from 'phosphor-react';
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

  const handleInsertFormat = () => {
    if (outputFormat === 'default') return;
    
    let textToInsert = '';
    if (outputFormat === 'json') {
      textToInsert = `\n\nPlease answer exactly in this JSON format:\n\`\`\`json\n${formatSpec}\n\`\`\``;
    } else if (outputFormat === 'template') {
      textToInsert = `\n\nUse the following template for your answer:\n${formatSpec}`;
    } else if (outputFormat === 'regex') {
      textToInsert = `\n\nYour answer must exactly match the following regex: ${formatSpec}`;
    }

    setPrompt((prompt || '') + textToInsert);
    // Focus back to textarea
    textareaRef.current?.focus();
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
    <div className="px-4 pb-8 pt-2">
      <div className={`max-w-4xl mx-auto rounded-lg shadow-xl border pointer-events-auto transition-all ${
        darkMode 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-zinc-200 shadow-zinc-200/50'
      }`}>
        <div className="p-3 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={prompt || ''}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            className={`flex-1 resize-none outline-none bg-transparent text-[15px] font-medium leading-relaxed max-h-[240px] py-2 px-1 ${
              darkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'
            }`}
            rows={1}
          />
          <div className="flex items-center gap-2">
            {!isLoading && outputFormat !== 'default' && (
              <button
                onClick={handleInsertFormat}
                title="Format-Beschreibung in Prompt einfügen"
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  darkMode
                    ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 border border-zinc-700'
                    : 'bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-100'
                }`}
              >
                <Code size={20} weight="bold" />
              </button>
            )}
            
            {isLoading ? (
              <button
                onClick={handleStop}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  darkMode
                    ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                <CircleNotch size={20} className="animate-spin absolute" />
                <StopCircle size={22} weight="fill" className="text-red-500" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!prompt?.trim()}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  !prompt?.trim()
                    ? darkMode
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                      : 'bg-zinc-50 text-zinc-300 cursor-not-allowed border border-zinc-100'
                    : darkMode
                      ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                <PaperPlaneRight size={20} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Helper info inside the editor */}
        <div className={`px-4 pb-2 flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <span>{backend}</span>
          <span className="opacity-30">•</span>
          <span>{model || 'no model'}</span>
          <span className="opacity-30">•</span>
          <span>{outputFormat}</span>
        </div>
      </div>
      <p className={`text-center mt-3 text-[10px] font-medium tracking-wide uppercase ${
        darkMode ? 'text-zinc-600 font-bold' : 'text-zinc-400'
      }`}>
        Structura can make mistakes. Verify important information.
      </p>
    </div>
  );
}
