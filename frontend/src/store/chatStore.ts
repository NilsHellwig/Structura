import { create } from 'zustand';
import type { LLMBackend, OutputFormat, Message, Conversation } from '../types';
import api from '../lib/api';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: number | null;
  backend: LLMBackend;
  model: string;
  outputFormat: OutputFormat;
  formatSpec: string | null;
  llmParameters: Record<string, any>;
  prompt: string;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  abortController: AbortController | null;
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (id: number | null) => void;
  setBackend: (backend: LLMBackend) => void;
  setModel: (model: string) => void;
  setOutputFormat: (format: OutputFormat) => void;
  setFormatSpec: (spec: string | null) => void;
  setLLMParameters: (params: Record<string, any>) => void;
  setPrompt: (prompt: string) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  stopGeneration: () => void;
  
  // Actions
  loadConversations: () => Promise<void>;
  createNewConversation: () => Promise<number | null>;
  deleteMessage: (messageId: number) => Promise<void>;
  editMessage: (messageId: number, content: string) => Promise<void>;
  sendMessage: (customPrompt?: string, editMessageId?: number) => Promise<void>;
}

const STORAGE_KEY_MODELS = 'structura_backend_models';

const getStoredModels = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MODELS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveStoredModel = (backend: string, model: string) => {
  const models = getStoredModels();
  if (model) {
    models[backend] = model;
  } else {
    delete models[backend];
  }
  localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(models));
};

export const useChatStore = create<ChatState>((set, get) => {
  const initialBackend = 'ollama' as LLMBackend;
  const storedModels = getStoredModels();
  const initialModel = storedModels[initialBackend] || '';

  return {
    conversations: [],
    currentConversationId: null,
    backend: initialBackend,
    model: initialModel,
    outputFormat: 'default' as OutputFormat,
    formatSpec: null,
    llmParameters: {},
    prompt: '',
    messages: [],
    isLoading: false,
    isStreaming: false,
    abortController: null,

    setConversations: (conversations) => set({ conversations }),
    setCurrentConversation: (id) => set({ currentConversationId: id }),
    setBackend: (backend) => set((state) => {
      const models = getStoredModels();
      const newModel = models[backend] || '';
      return { backend, model: newModel };
    }),
    setModel: (model) => set((state) => {
      saveStoredModel(state.backend, model);
      return { model };
    }),
    setOutputFormat: (format) => set((state) => {
      // Logic to ensure formatSpec is valid for the new format
      let newSpec = state.formatSpec;
      
      if (format === 'json') {
        try {
          if (!newSpec || !newSpec.trim().startsWith('{')) throw new Error();
          JSON.parse(newSpec);
        } catch {
          newSpec = JSON.stringify({ type: 'object', properties: {} }, null, 2);
        }
      } else if (format === 'regex') {
        if (!newSpec || newSpec.trim().startsWith('{')) {
          newSpec = '[A-Za-z0-9]+';
        }
      } else if (format === 'template') {
        if (!newSpec || newSpec.trim().startsWith('{')) {
          newSpec = 'Answer: {{answer}}';
        }
      } else {
        newSpec = null;
      }

      return { outputFormat: format, formatSpec: newSpec };
    }),
    setFormatSpec: (spec) => set({ formatSpec: spec }),
    setLLMParameters: (params) => set({ llmParameters: params }),
    setPrompt: (prompt) => set({ prompt }),
    setMessages: (messages) => set({ messages }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsStreaming: (streaming) => set({ isStreaming: streaming }),
    stopGeneration: () => {
      const { abortController } = get();
      if (abortController) {
        abortController.abort();
        set({ abortController: null, isLoading: false });
      }
    },

    loadConversations: async () => {
      try {
        const response = await api.get('/conversations/');
        set({ conversations: response.data });
        if (!useChatStore.getState().currentConversationId && response.data.length > 0) {
          set({ currentConversationId: response.data[0].id });
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    },

    createNewConversation: async () => {
      try {
        const response = await api.post('/conversations/', {});
        const newConv = response.data;
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          currentConversationId: newConv.id,
          messages: []
        }));
        return newConv.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
      }
    },
    deleteMessage: async (messageId: number) => {
      const { currentConversationId } = get();
      if (!currentConversationId) return;

      try {
        await api.delete(`/conversations/${currentConversationId}/messages/${messageId}`);
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }));
      } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    },

    editMessage: async (messageId: number, content: string) => {
      const { currentConversationId } = get();
      if (!currentConversationId) return;

      try {
        await api.patch(`/conversations/${currentConversationId}/messages/${messageId}`, { content });
        // Reload messages because editing a user message deletes subsequent ones
        const response = await api.get(`/conversations/${currentConversationId}/messages`);
        set({ messages: response.data });
      } catch (error) {
        console.error('Error editing message:', error);
        throw error;
      }
    },

    sendMessage: async (customPrompt?: string, editMessageId?: number) => {
      const state = get();
      let convId = state.currentConversationId;
      const promptToSend = customPrompt || state.prompt;

      if (!convId) {
        convId = await state.createNewConversation();
        if (!convId) return;
      }

      if (!promptToSend?.trim() || state.isLoading) return;

      let newMessages: Message[];
      if (editMessageId) {
        // If editing, find the message and remove everything after it
        const msgIndex = state.messages.findIndex(m => m.id === editMessageId);
        if (msgIndex !== -1) {
          const updatedMsg = { ...state.messages[msgIndex], content: promptToSend };
          newMessages = [...state.messages.slice(0, msgIndex), updatedMsg];
        } else {
          newMessages = state.messages;
        }
      } else {
        const userMessage: Message = {
          role: 'user',
          content: promptToSend,
          backend: state.backend,
          model: state.model,
          output_format: state.outputFormat,
        };
        newMessages = [...state.messages, userMessage];
      }

      if (!editMessageId) {
        set({ messages: newMessages, prompt: '' });
      } else {
        set({ messages: newMessages });
      }
      
      const abortController = new AbortController();
      set({ isLoading: true, abortController });

      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}/llm/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            conversation_id: convId,
            message: promptToSend,
            backend: state.backend,
            model: state.model,
            output_format: state.outputFormat,
            format_spec: state.outputFormat !== 'default' ? state.formatSpec : undefined,
            parameters: state.llmParameters,
            message_id: editMessageId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No response body');

        let assistantContent = '';
        let buffer = '';
        let userMsgId: number | undefined;
        let assistantMsgId: number | undefined;

        const assistantMessage: Message = {
          role: 'assistant',
          content: '',
          backend: state.backend,
          model: state.model,
          output_format: state.outputFormat,
        };
        
        set({ messages: [...newMessages, assistantMessage] });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.user_message_id) userMsgId = parsed.user_message_id;
                if (parsed.assistant_message_id) assistantMsgId = parsed.assistant_message_id;
                if (parsed.content) assistantContent += parsed.content;

                set((s) => ({
                  messages: [
                    ...newMessages.map((m, i) => 
                      i === newMessages.length - 1 && userMsgId ? { ...m, id: userMsgId } : m
                    ),
                    { ...assistantMessage, content: assistantContent, id: assistantMsgId },
                  ]
                }));
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  };
});
