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
  formatSpecs: Record<string, string | null>;
  llmParameters: Record<string, any>;
  prompt: string;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  isConnected: boolean;
  availableModels: string[];
  abortController: AbortController | null;
  capabilities: Record<string, string[]>;
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (id: number | null) => void;
  setBackend: (backend: LLMBackend) => void;
  setModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
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
  loadBackendSettings: () => Promise<void>;
  updateBackendSetting: (backend: string, baseUrl: string, apiKey?: string) => Promise<void>;
  createNewConversation: () => Promise<number | null>;
  deleteMessage: (messageId: number) => Promise<void>;
  editMessage: (messageId: number, content: string) => Promise<void>;
  sendMessage: (customPrompt?: string, editMessageId?: number) => Promise<void>;
  fetchCapabilities: () => Promise<void>;
}

const STORAGE_KEY_MODELS = 'structura_backend_models';
const STORAGE_KEY_BACKEND = 'structura_selected_backend';

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

const getStoredBackend = (): LLMBackend => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BACKEND);
    return (stored as LLMBackend) || 'ollama';
  } catch {
    return 'ollama';
  }
};

const saveStoredBackend = (backend: LLMBackend) => {
  localStorage.setItem(STORAGE_KEY_BACKEND, backend);
};

export const useChatStore = create<ChatState>((set, get) => {
  const initialBackend = getStoredBackend();
  const storedModels = getStoredModels();
  const initialModel = storedModels[initialBackend] || '';

  return {
    conversations: [],
    currentConversationId: null,
    backend: initialBackend,
    model: initialModel,
    outputFormat: 'default' as OutputFormat,
    formatSpec: null,
    formatSpecs: {
      'default': null,
      'json': JSON.stringify({ type: 'object', properties: {} }, null, 2),
      'template': 'Name: [GEN]\nAge: [GEN]',
      'regex': '[A-Za-z0-9]+',
      'html': '<!DOCTYPE html>\n<html>\n<body>\n[GEN]\n</body>\n</html>',
      'csv': 'Column 1,Column 2',
    },
    llmParameters: {},
    prompt: '',
    messages: [],
    isLoading: false,
    isStreaming: false,
    isConnected: false,
    availableModels: [],
    abortController: null,
    capabilities: {},

    setConversations: (conversations) => set({ conversations }),
    setCurrentConversation: (id) => set({ currentConversationId: id }),
    setBackend: (backend) => {
      const state = get();
      const models = getStoredModels();
      const newModel = models[backend] || '';
      saveStoredBackend(backend);
      
      // Auto-switch output format if not supported by the new backend
      let newFormat = state.outputFormat;
      const backendCapabilities = state.capabilities[backend] || [];
      if (backendCapabilities.length > 0 && !backendCapabilities.includes(state.outputFormat)) {
        newFormat = 'default' as OutputFormat;
      }

      // Set initial/fallback parameters for the new backend immediately
      const defaultBaseUrl = backend === 'vllm' ? 'http://localhost:8000' : 'http://localhost:11434';
      const initialParams = {
        ...get().llmParameters,
        base_url: backend === 'openai' ? undefined : defaultBaseUrl,
        api_key: undefined
      };

      set({ 
        backend, 
        model: newModel, 
        availableModels: [], // Reset models on backend change
        llmParameters: initialParams,
        outputFormat: newFormat,
        formatSpec: state.formatSpecs[newFormat] || null
      });
      
      // Load user-saved backend specific settings (overrides defaults)
      api.get('/settings/backends').then(response => {
        const settings = response.data;
        const currentSetting = settings.find((s: any) => s.backend === backend);
        if (currentSetting) {
          set({
            llmParameters: {
              ...get().llmParameters,
              base_url: currentSetting.base_url,
              api_key: currentSetting.api_key
            }
          });
        }
      });
    },
    setModel: (model) => set((state) => {
      saveStoredModel(state.backend, model);
      return { model };
    }),
    setAvailableModels: (availableModels) => {
      const isConnected = availableModels.length > 0;
      set((state) => ({ 
        availableModels,
        isConnected,
        // Reset output format if disconnected
        outputFormat: !isConnected ? 'default' : state.outputFormat,
        formatSpec: !isConnected ? null : state.formatSpec
      }));
    },
    setOutputFormat: (format) => set((state) => {
      const newSpec = state.formatSpecs[format] || null;
      return { outputFormat: format, formatSpec: newSpec };
    }),
    setFormatSpec: (spec) => set((state) => ({ 
      formatSpec: spec,
      formatSpecs: { ...state.formatSpecs, [state.outputFormat]: spec }
    })),
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
        const response = await api.get('/conversations');
        set({ conversations: response.data });
        if (!useChatStore.getState().currentConversationId && response.data.length > 0) {
          set({ currentConversationId: response.data[0].id });
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    },

    loadBackendSettings: async () => {
      try {
        const response = await api.get('/settings/backends');
        const settings = response.data;
        
        // Find current backend's setting
        const currentBackend = get().backend;
        const currentSetting = settings.find((s: any) => s.backend === currentBackend);
        
        if (currentSetting) {
          set({
            llmParameters: {
              ...get().llmParameters,
              base_url: currentSetting.base_url,
              api_key: currentSetting.api_key
            }
          });
        }
      } catch (error) {
        console.error('Error loading backend settings:', error);
      }
    },

    updateBackendSetting: async (backend, baseUrl, apiKey) => {
      try {
        await api.post('/settings/backends', {
          backend,
          base_url: baseUrl,
          api_key: apiKey
        });
        
        // Update local state
        if (get().backend === backend) {
          set({
            llmParameters: {
              ...get().llmParameters,
              base_url: baseUrl,
              api_key: apiKey
            }
          });
        }
      } catch (error) {
        console.error('Error updating backend setting:', error);
      }
    },

    createNewConversation: async () => {
      try {
        const response = await api.post('/conversations', {});
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
      if (!currentConversationId || !messageId) return;

      try {
        await api.delete(`/conversations/${currentConversationId}/messages/${messageId}`);
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }));
      } catch (error: any) {
        // If 404, the message is already gone from backend, just update UI
        if (error.response?.status === 404) {
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== messageId),
          }));
          return;
        }
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
      let promptToSend = customPrompt || state.prompt;

      if (!convId) {
        convId = await state.createNewConversation();
        if (!convId) return;
      }

      if (!promptToSend?.trim() || state.isLoading) return;

      // Automatically append format instruction if not default
      if (state.outputFormat !== 'default' && state.formatSpec) {
        let textToInsert = '';
        if (state.outputFormat === 'json') {
          let schemaDisplay = state.formatSpec;
          try {
            schemaDisplay = JSON.stringify(JSON.parse(state.formatSpec), null, 2);
          } catch (e) {
            // keep original if not valid JSON
          }
          textToInsert = `\n\n%-%-%\nYou must respond with valid JSON only. The output must strictly follow this JSON schema:\n\`\`\`json\n${schemaDisplay}\n\`\`\`\n\nDo not add any explanations or extra text outside the JSON object.`;
        } else if (state.outputFormat === 'template') {
          const displayTemplate = state.formatSpec.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
          textToInsert = `\n\n%-%-%\nYour response must look exactly like this:\n\`\`\`\n${displayTemplate}\n\`\`\`\n\nReplace the entire [GEN] tag with appropriate text content. Example result:\nDo not add any explanations, greetings, or extra text. Only output the exact format shown above.`;
        } else if (state.outputFormat === 'regex') {
          textToInsert = `\n\n%-%-%\nYour response must match this exact pattern: ${state.formatSpec}\nDo not add any explanations or extra text.`;
        } else if (state.outputFormat === 'csv') {
          textToInsert = `\n\n%-%-%\nYou must respond in CSV format${state.formatSpec ? ` with these exact columns: ${state.formatSpec}` : ''}. Do not add any explanations or extra text.`;
        } else if (state.outputFormat === 'html') {
          textToInsert = `\n\n%-%-%\nYou must respond with valid XML/HTML only. Do not add any explanations or extra text outside the tags.`;
        }
        
        // Append only if it doesn't already contain a format marker
        if (textToInsert && !promptToSend.includes('%-%-%')) {
          promptToSend += textToInsert;
        }
      }

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

                set(() => {
                  const updatedMessages = [...newMessages];
                  
                  // Update user message ID if found
                  if (userMsgId && updatedMessages.length > 0) {
                    const lastIdx = updatedMessages.length - 1;
                    updatedMessages[lastIdx] = { 
                      ...updatedMessages[lastIdx], 
                      id: userMsgId 
                    };
                  }

                  // Create/Update assistant message
                  const updatedAssistant = { 
                    ...assistantMessage, 
                    content: assistantContent
                  };
                  if (assistantMsgId) {
                    updatedAssistant.id = assistantMsgId;
                  }

                  return {
                    messages: [...updatedMessages, updatedAssistant]
                  };
                });
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || error.message === 'The operation was aborted.') {
          console.log('Fetch aborted');
        } else {
          console.error('Error sending message:', error);
          throw error;
        }
      } finally {
        set({ isLoading: false, abortController: null });
      }
    },

    fetchCapabilities: async () => {
      try {
        const response = await api.get('/llm/capabilities');
        set({ capabilities: response.data });
      } catch (error) {
        console.error('Error fetching capabilities:', error);
      }
    },
  };
});
