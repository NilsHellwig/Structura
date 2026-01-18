import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatArea from '../components/ChatArea';
import PromptEditor from '../components/PromptEditor';
import IntroModal from '../components/IntroModal';
import api from '../lib/api';
import type { Conversation } from '../types';

export default function Chat() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const darkMode = useUIStore((state) => state.darkMode);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const setMessages = useChatStore((state) => state.setMessages);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const initChat = async () => {
      await Promise.all([
        useChatStore.getState().loadConversations(),
        useChatStore.getState().loadBackendSettings(),
        useChatStore.getState().fetchCapabilities()
      ]);
      setLoading(false);
    };
    initChat();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadMessages = async () => {
    if (!currentConversationId) return;
    
    try {
      const response = await api.get(`/conversations/${currentConversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const createNewConversation = async () => {
    try {
      await useChatStore.getState().createNewConversation();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(conversations.filter((c) => c.id !== id));
      
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setCurrentConversation(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const renameConversation = async (id: number, title: string) => {
    try {
      const response = await api.patch(`/conversations/${id}`, { title });
      setConversations(
        conversations.map((c) => (c.id === id ? response.data : c))
      );
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-light-muted dark:text-dark-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden ${
      darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      <IntroModal />
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatHeader />
        <ChatArea />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <PromptEditor />
        </div>
      </div>
    </div>
  );
}
