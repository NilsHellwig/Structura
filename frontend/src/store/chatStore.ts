import { create } from 'zustand';
import { LLMBackend, OutputFormat } from '../types';

interface ChatState {
  currentConversationId: number | null;
  selectedBackend: LLMBackend;
  selectedModel: string | null;
  selectedFormat: OutputFormat;
  formatSpec: string | null;
  llmParameters: Record<string, any>;
  
  setCurrentConversation: (id: number | null) => void;
  setBackend: (backend: LLMBackend) => void;
  setModel: (model: string) => void;
  setFormat: (format: OutputFormat) => void;
  setFormatSpec: (spec: string | null) => void;
  setLLMParameters: (params: Record<string, any>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversationId: null,
  selectedBackend: LLMBackend.OPENAI,
  selectedModel: null,
  selectedFormat: OutputFormat.FREETEXT,
  formatSpec: null,
  llmParameters: {},

  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setBackend: (backend) => set({ selectedBackend: backend, selectedModel: null }),
  setModel: (model) => set({ selectedModel: model }),
  setFormat: (format) => set({ selectedFormat: format }),
  setFormatSpec: (spec) => set({ formatSpec: spec }),
  setLLMParameters: (params) => set({ llmParameters: params }),
}));
