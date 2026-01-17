import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Robot, Copy, Check, PencilSimple, Trash, CheckCircle, XCircle, Sparkle, PaperPlaneRight } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import MarkdownRenderer from './MarkdownRenderer';
import toast from 'react-hot-toast';

export default function ChatArea() {
  const darkMode = useUIStore((state) => state.darkMode);
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const editMessage = useChatStore((state) => state.editMessage);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const sendMessage = useChatStore((state) => state.sendMessage);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStartEdit = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSendEdit = async (messageId: number) => {
    if (!editContent.trim()) return;
    try {
      setEditingMessageId(null);
      // Trigger generation with the edited content and messageId
      await sendMessage(editContent, messageId);
      setEditContent('');
      toast.success('Message updated and resent');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (messageId: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        toast.success('Message deleted');
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto ${
      darkMode ? 'bg-zinc-950' : 'bg-zinc-50'
    }`}>
      {!messages || messages.length === 0 ? (
        <div className="h-full flex items-center justify-center px-6 py-10">
          <div className="text-center max-w-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div className={`w-16 h-16 rounded-lg mx-auto flex items-center justify-center`}>
                <Sparkle size={64} weight="duotone" className={
                  darkMode ? 'text-zinc-100' : 'text-zinc-900'
                } />
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-bold mb-3 tracking-tight ${
                darkMode ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              Start a conversation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm font-medium ${
                darkMode ? 'text-zinc-500' : 'text-zinc-600'
              }`}
            >
              Choose a specific backend and output format to begin your structured work.
            </motion.p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-48">
          {Array.isArray(messages) && messages.map((message, index) => (
            <motion.div
              key={message.id != null ? `id-${message.id}` : `temp-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar & Actions Column */}
                <div className="flex flex-col items-center gap-2 mt-1">
                  <div className="relative group/avatar">
                    {message.role === 'user' ? (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        darkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-white'
                      }`}>
                        User
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        darkMode ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                      }`}>
                        <Robot size={18} weight="bold" />
                      </div>
                    )}
                  </div>

                  {/* Message Actions (Edit/Delete/Copy) */}
                  {!isLoading && message.id && (
                    <div className={`absolute top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                    }`}>
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className={`p-1.5 rounded-md transition-all ${
                          darkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900'
                        }`}
                        title="Copy"
                      >
                        {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      {message.role === 'user' && (
                        <button
                          onClick={() => handleStartEdit(message.id!, message.content)}
                          className={`p-1.5 rounded-md transition-all ${
                            darkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900'
                          }`}
                          title="Edit"
                        >
                          <PencilSimple size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(message.id!)}
                        className={`p-1.5 rounded-md transition-all ${
                          darkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-red-400' : 'hover:bg-zinc-100 text-zinc-400 hover:text-red-500'
                        }`}
                        title="Delete"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 px-4 py-3 rounded-lg overflow-hidden min-w-[200px] ${
                  message.role === 'user'
                    ? darkMode 
                      ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tr-none' 
                      : 'bg-zinc-900 text-white rounded-tr-none'
                    : darkMode 
                    ? 'bg-transparent text-zinc-200' 
                    : 'bg-transparent text-zinc-900'
                }`}>
                  {message.role === 'user' ? (
                    editingMessageId === message.id ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className={`w-full bg-transparent text-sm leading-relaxed font-medium outline-none border-none resize-none p-0 focus:ring-0 ${
                            darkMode ? 'text-zinc-100' : 'text-white'
                          }`}
                          autoFocus
                          rows={Math.max(2, editContent.split('\n').length)}
                        />
                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendEdit(message.id!)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white text-zinc-900 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                          >
                            <PaperPlaneRight size={14} weight="bold" />
                            Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )
                  ) : (
                    <>
                      <div className="text-sm leading-relaxed overflow-x-auto no-scrollbar font-normal">
                        <MarkdownRenderer 
                          content={
                            message.output_format === 'json' && message.content && !message.content.trim().startsWith('```')
                              ? (
                                  (() => {
                                    try {
                                      if (message.content.trim().startsWith('{') || message.content.trim().startsWith('[')) {
                                        const parsed = JSON.parse(message.content);
                                        return `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``;
                                      }
                                      return `\`\`\`json\n${message.content}\n\`\`\``;
                                    } catch (e) {
                                      return `\`\`\`json\n${message.content}\n\`\`\``;
                                    }
                                  })()
                                )
                              : message.content
                          } 
                        />
                      </div>
                      {message.content && (
                        <div className={`text-[9px] mt-6 pt-4 border-t font-bold tracking-widest uppercase ${
                          darkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400'
                        }`}>
                          {message.backend} • {message.model} • {message.output_format}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-4 max-w-3xl">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  }`}>
                    <Robot size={18} weight="bold" />
                  </div>
                </div>
                <div className={`px-4 py-3 rounded-lg ${
                  darkMode ? 'bg-zinc-800/20 border border-zinc-800' : 'bg-zinc-100'
                }`}>
                  <div className="flex gap-1.2">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-100' : 'bg-zinc-900'}`}
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-100' : 'bg-zinc-900'}`}
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-100' : 'bg-zinc-900'}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
