import { useState } from 'react';
import { Plus, Trash, PencilSimple, CaretLeft, Moon, SunDim, SignOut, Sparkle, Question } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import Tooltip from './Tooltip';
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
  const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar, setShowIntro } = useUIStore();
  const { logout, user } = useAuthStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const finishEditing = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <AnimatePresence mode="wait">
      {!sidebarCollapsed && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 border-r flex flex-col backdrop-blur-3xl ${
            darkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-100'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-black tracking-tight ${
                darkMode ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                Structura
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="Information">
                <button
                  onClick={() => setShowIntro(true)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50'
                      : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                >
                  <Question size={18} weight="bold" />
                </button>
              </Tooltip>
              <Tooltip content={darkMode ? 'Light' : 'Dark'}>
                <button
                  onClick={toggleDarkMode}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50'
                      : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                >
                  {darkMode ? <SunDim size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
                </button>
              </Tooltip>
              <button
                onClick={toggleSidebar}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50'
                    : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                <CaretLeft size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-4 pb-6">
            <button
              onClick={onNewConversation}
              className={`w-full px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                darkMode
                  ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-xl shadow-black/20'
                  : 'bg-white text-zinc-900 hover:bg-zinc-50 shadow-lg shadow-zinc-200/50 border border-zinc-100'
              }`}
            >
              <Plus size={16} weight="bold" />
              New Session
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 no-scrollbar">
            <div className={`text-[10px] font-black uppercase tracking-widest mb-4 opacity-30 px-2 ${
              darkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Recent Sessions
            </div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-xl transition-all duration-200 ${
                  currentConversationId === conv.id
                    ? darkMode
                      ? 'bg-white text-zinc-900 shadow-xl shadow-white/5'
                      : 'bg-zinc-900 text-white shadow-xl shadow-black/10'
                    : darkMode
                    ? 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {editingId === conv.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditing();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className={`w-full px-3 py-3 text-xs font-bold rounded-xl outline-none ${
                      darkMode
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-white text-zinc-900 border border-zinc-200 shadow-inner'
                    }`}
                  />
                ) : (
                  <div
                    onClick={() => onSelectConversation(conv.id)}
                    className="w-full px-4 py-3.5 text-left text-xs flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className={`truncate flex-1 font-bold tracking-tight ${
                      currentConversationId === conv.id
                        ? 'text-inherit'
                        : ''
                    }`}>
                      {conv.title}
                    </span>
                    <div className={`flex items-center gap-1 transition-all ${
                      currentConversationId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conv.id, conv.title);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentConversationId === conv.id
                            ? darkMode ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800'
                            : darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                        }`}
                      >
                        <PencilSimple size={14} weight="bold" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentConversationId === conv.id
                            ? darkMode ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-900 text-red-400'
                            : darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Section / Footer */}
          <div className={`p-4 ${
            darkMode ? 'bg-zinc-900/20' : 'bg-zinc-100/20'
          }`}>
            <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
              darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-white border border-transparent hover:border-zinc-100 hover:shadow-sm'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-sm ${
                darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-white text-zinc-600 border border-zinc-100'
              }`}>
                {user?.username?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-black uppercase tracking-tight truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                  {user?.username || 'User'}
                </div>
              </div>
              <Tooltip content="Sign Out">
                <button
                  onClick={logout}
                  className={`p-2 rounded-xl transition-all ${
                    darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <SignOut size={18} weight="bold" />
                </button>
              </Tooltip>
            </div>
          </div>
        </motion.div>

      )}

      {sidebarCollapsed && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 68 }}
          exit={{ width: 0 }}
          className={`flex-shrink-0 border-r flex flex-col items-center py-6 gap-4 ${
            darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'
          }`}
        >
          <Tooltip content="Expand" side="right">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <CaretLeft size={20} weight="bold" className="rotate-180" />
            </button>
          </Tooltip>
          <Tooltip content="New Chat" side="right">
            <button
              onClick={onNewConversation}
              className={`p-2.5 rounded-lg transition-all ${
                darkMode
                  ? 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md'
              }`}
            >
              <Plus size={20} weight="bold" />
            </button>
          </Tooltip>
          <div className="flex-1" />
          <Tooltip content="Logout" side="right">
            <div className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {user?.username?.substring(0, 3)}
              </span>
              <button
                onClick={logout}
                className={`p-2.5 rounded-lg transition-colors ${
                  darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <SignOut size={20} weight="bold" />
              </button>
            </div>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
