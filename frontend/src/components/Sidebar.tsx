import { useState } from 'react';
import { Plus, Trash, PencilSimple, CaretLeft, Moon, SunDim, Question, SignOut } from 'phosphor-react';
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
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 border-r flex flex-col ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          {/* Header */}
          <div className={`px-4 py-6 flex items-center justify-between`}>
            <h1 className={`text-xl font-bold tracking-tight ${
              darkMode ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
              Structura
            </h1>
            <div className="flex items-center gap-0.5">
              <Tooltip content="Help">
                <button
                  onClick={() => setShowIntro(true)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                      : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Question size={18} weight="bold" />
                </button>
              </Tooltip>
              <Tooltip content={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <button
                  onClick={toggleDarkMode}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                      : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {darkMode ? <SunDim size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
                </button>
              </Tooltip>
              <Tooltip content="Collapse">
                <button
                  onClick={toggleSidebar}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                      : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <CaretLeft size={18} weight="bold" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-3 pb-4">
            <button
              onClick={onNewConversation}
              className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                darkMode
                  ? 'bg-zinc-100 hover:bg-white text-zinc-900'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 shadow-sm'
              }`}
            >
              <Plus size={18} weight="bold" />
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 no-scrollbar">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-lg transition-all ${
                  currentConversationId === conv.id
                    ? darkMode
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'bg-zinc-200 text-zinc-900 shadow-sm'
                    : darkMode
                    ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
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
                    className={`w-full px-3 py-3 text-sm rounded-lg outline-none ${
                      darkMode
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-white text-zinc-900 border border-zinc-300'
                    }`}
                  />
                ) : (
                  <div
                    onClick={() => onSelectConversation(conv.id)}
                    className="w-full px-3 py-3 text-left text-sm flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className={`truncate flex-1 font-medium ${
                      currentConversationId === conv.id
                        ? 'text-inherit'
                        : ''
                    }`}>
                      {conv.title}
                    </span>
                    <div className={`flex items-center gap-0.5 transition-opacity ${
                      currentConversationId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conv.id, conv.title);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          darkMode ? 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          darkMode ? 'hover:bg-red-900/40 text-zinc-400 hover:text-red-400' : 'hover:bg-red-100 text-zinc-500 hover:text-red-600'
                        }`}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Section / Footer */}
          <div className={`p-4 border-t ${
            darkMode ? 'border-zinc-800' : 'border-zinc-200'
          }`}>
            <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                darkMode ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-white'
              }`}>
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${
                  darkMode ? 'text-zinc-100' : 'text-zinc-900'
                }`}>
                  {user?.username || 'User'}
                </p>
              </div>
              <Tooltip content="Logout">
                <button
                  onClick={logout}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <SignOut size={16} weight="bold" />
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
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
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
