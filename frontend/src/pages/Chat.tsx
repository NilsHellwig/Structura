import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatArea from '../components/ChatArea';
import FormatEditor from '../components/FormatEditor';
import PromptEditor from '../components/PromptEditor';
import api from '../lib/api';
import type { Conversation } from '../types';

export default function Chat() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.get('/conversations/');
      setConversations(response.data);
      
      // Set first conversation as current if none selected
      if (!currentConversationId && response.data.length > 0) {
        setCurrentConversation(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await api.post('/conversations/', {});
      setConversations([response.data, ...conversations]);
      setCurrentConversation(response.data.id);
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
        <div className="text-light-muted dark:text-dark-muted">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f7f7f8] dark:bg-[#0d0d0d]">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        
        <div className="flex-1 flex overflow-hidden px-6 py-4 gap-4 max-w-6xl mx-auto w-full">
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
            <ChatArea conversationId={currentConversationId} />
            <PromptEditor conversationId={currentConversationId} />
          </div>
          
          <FormatEditor />
        </div>
      </div>
    </div>
  );
}
