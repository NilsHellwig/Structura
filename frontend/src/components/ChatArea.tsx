import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Robot, Copy, Check, PencilSimple, Trash, CheckCircle, XCircle, Sparkle, PaperPlaneRight, FileCsv, Table } from 'phosphor-react';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MarkdownRenderer from './MarkdownRenderer';
import toast from 'react-hot-toast';

export default function ChatArea() {
  const darkMode = useUIStore((state) => state.darkMode);
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const editMessage = useChatStore((state) => state.editMessage);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const user = useAuthStore((state) => state.user);
  
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

  const handleCopyCSV = (content: string, separator: ',' | ';') => {
    let text = content;
    if (separator === ';') {
      // Basic replacement for display purposes, but better to parse and re-join
      const lines = content.trim().split('\n');
      text = lines.map(line => line.split(',').join(';')).join('\n');
    }
    navigator.clipboard.writeText(text);
    toast.success(`Copied with ${separator === ',' ? 'comma' : 'semicolon'} separator`);
  };

  const parseCSV = (csv: string) => {
    try {
      const lines = csv.trim().split('\n');
      if (lines.length === 0) return null;
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
      return { headers, rows };
    } catch (e) {
      return null;
    }
  };

  const handleStartEdit = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content.split('%-%-%')[0].trim());
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
    <div className={`flex-1 overflow-y-auto relative ${
      darkMode ? 'bg-zinc-950' : 'bg-white'
    }`}>
      {!messages || messages.length === 0 ? (
        <div className="h-full flex items-center justify-center px-6 py-10 relative overflow-hidden">
          {/* Decorative Blur Background for Empty State */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
          
          <div className="text-center max-w-sm relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl font-black tracking-tighter mb-4 ${
                darkMode ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              Structura
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60 ${
                darkMode ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              Select backend & format<br />to initialize structured generation.
            </motion.p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-48 space-y-16">
          {Array.isArray(messages) && messages.map((message, index) => (
            <motion.div
              key={message.id != null ? `id-${message.id}` : `temp-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`flex group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-6 max-w-[90%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar & Actions Column */}
                <div className="flex flex-col items-center gap-3 mt-1 flex-shrink-0">
                  <div className="relative">
                    {message.role === 'user' ? (
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[11px] uppercase shadow-lg ${
                        darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                      }`}>
                        {user?.username?.substring(0, 1) || 'U'}
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                        darkMode ? 'bg-zinc-900 text-blue-400 border border-zinc-800' : 'bg-white text-blue-600 shadow-sm border border-zinc-100'
                      }`}>
                        <Robot size={22} weight="fill" />
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  {message.id && (
                    <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className={`p-2 rounded-xl transition-all ${
                          darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                        title="Copy"
                      >
                        {copiedIndex === index ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                      </button>
                      {message.role === 'user' && (
                        <button
                          onClick={() => handleStartEdit(message.id!, message.content)}
                          className={`p-2 rounded-xl transition-all ${
                            darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                          }`}
                          title="Edit"
                        >
                          <PencilSimple size={16} weight="bold" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(message.id!)}
                        className={`p-2 rounded-xl transition-all ${
                          darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800' : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
                        }`}
                        title="Delete"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Content Container */}
                <div className={`flex-1 min-w-[200px] ${
                  message.role === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'
                }`}>
                  {/* Label */}
                  <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-40 ${
                    darkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {message.role === 'user' ? 'User' : 'System'}
                  </div>

                  {/* Bubble */}
                  <div className={`w-full ${
                    message.role === 'user' 
                      ? `px-6 py-4 rounded-3xl shadow-xl ${darkMode ? 'bg-zinc-900/50 border border-zinc-800 text-zinc-100' : 'bg-white border border-zinc-100 text-zinc-900 shadow-zinc-200/50'}`
                      : 'text-left'
                  }`}>
                    {message.role === 'user' ? (
                      editingMessageId === message.id ? (
                        <div className="flex flex-col gap-4">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={`w-full bg-transparent text-sm leading-relaxed font-bold outline-none border-none resize-none p-0 focus:ring-0 ${
                              darkMode ? 'text-zinc-100' : 'text-zinc-900'
                            }`}
                            autoFocus
                            rows={Math.max(2, editContent.split('\n').length)}
                          />
                          <div className={`flex justify-end gap-3 pt-3 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                            <button
                              onClick={handleCancelEdit}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                                darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                              }`}
                            >
                              <XCircle size={14} weight="bold" />
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSendEdit(message.id!)}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg ${
                                darkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                              }`}
                            >
                              <PaperPlaneRight size={14} weight="bold" />
                              Update & Resend
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed font-bold whitespace-pre-wrap break-words">
                          {message.content.split('%-%-%')[0].trim()}
                        </p>
                      )
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed overflow-x-auto no-scrollbar font-normal">
                          {message.content ? (
                            message.output_format === 'html' ? (
                              <MarkdownRenderer content={`\`\`\`html\n${message.content}\n\`\`\``} />
                            ) : message.output_format === 'csv' ? (
                              <div className="space-y-4">
                                {(() => {
                                  const csvData = parseCSV(message.content);
                                  if (!csvData) return <div className="whitespace-pre-wrap">{message.content}</div>;
                                  return (
                                    <div className={`overflow-hidden rounded-2xl border ${darkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                      <table className="w-full text-left border-collapse">
                                        <thead>
                                          <tr className={`${darkMode ? 'bg-white/5' : 'bg-zinc-50'}`}>
                                            {csvData.headers.map((h, i) => (
                                              <th key={i} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b ${darkMode ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`}>
                                                {h}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {csvData.rows.map((row, i) => (
                                            <tr key={i} className="group hover:bg-zinc-500/5 transition-colors">
                                              {row.map((cell, j) => (
                                                <td key={j} className={`px-4 py-3 text-[11px] border-b last:border-b-0 ${darkMode ? 'border-zinc-800 text-zinc-300' : 'border-zinc-100 text-zinc-600'}`}>
                                                  {cell}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })()}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCopyCSV(message.content, ',')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                      darkMode ? 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white' : 'bg-white border border-zinc-100 text-zinc-500 hover:text-black shadow-sm'
                                    }`}
                                  >
                                    <FileCsv size={14} weight="bold" />
                                    Copy with ,
                                  </button>
                                  <button
                                    onClick={() => handleCopyCSV(message.content, ';')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                      darkMode ? 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white' : 'bg-white border border-zinc-100 text-zinc-500 hover:text-black shadow-sm'
                                    }`}
                                  >
                                    <FileCsv size={14} weight="bold" />
                                    Copy with ;
                                  </button>
                                </div>
                              </div>
                            ) : (message.output_format === 'template' || 
                             message.output_format === 'regex') ? (
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                            ) : (
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
                            )
                          ) : (
                            <div className="flex gap-1.2 py-2">
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
                          )}
                        </div>
                        {message.content && (
                          <div className={`text-[9px] mt-8 pt-4 border-t font-black tracking-[0.2em] uppercase transition-opacity group-hover:opacity-100 opacity-30 ${
                            darkMode ? 'border-zinc-900 text-zinc-500' : 'border-zinc-100 text-zinc-400'
                          }`}>
                            {message.backend} • {message.model} • {message.output_format}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
