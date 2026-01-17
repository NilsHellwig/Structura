import { useState } from 'react';
import { SignOut, Plus, ChatCircle, Trash, PencilSimple, Check, X, Moon, Sun } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  onRenameConversation: (id: number, title: string) => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const username = useAuthStore((state) => state.username);
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = (id: number) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className={`w-64 flex flex-col border-r ${
      darkMode 
        ? 'bg-[#0d0d0d] border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-3 py-2.5 border-b flex items-center justify-between ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <h2 className={`text-sm font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Structura
        </h2>
        <button
          onClick={toggleDarkMode}
          className={`p-1 rounded transition-colors ${
            darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <div className="p-2">
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
            darkMode
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          <Plus size={14} weight="bold" />
          New
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`group relative mb-0.5 rounded transition-colors ${
                currentConversationId === conv.id
                  ? darkMode 
                    ? 'bg-gray-800' 
                    : 'bg-gray-100'
                  : darkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex items-center gap-1 p-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(conv.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className={`flex-1 px-2 py-1 text-sm rounded border outline-none ${
                      darkMode
                        ? 'bg-neutral-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(conv.id)}
                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                  >
                    <Check size={14} weight="bold" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className="w-full px-2 py-1.5 flex items-center gap-2 cursor-pointer"
                >
                  <ChatCircle 
                    size={14} 
                    weight={currentConversationId === conv.id ? 'fill' : 'regular'} 
                    className={darkMode ? 'text-gray-500' : 'text-gray-500'}
                  />
                  <span className={`flex-1 truncate text-sm ${
                    darkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {conv.title}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(conv);
                      }}
                      className={`p-1 rounded transition-colors ${
                        darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <PencilSimple size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete conversation?')) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash size={12} className="text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={`px-3 py-2 border-t ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-medium shrink-0 ${
              darkMode ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              {username?.charAt(0).toUpperCase()}
            </div>
            <span className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {username}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors shrink-0"
            title="Sign out"
          >
            <SignOut size={14} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
