export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum OutputFormat {
  DEFAULT = 'default',
  JSON = 'json',
  TEMPLATE = 'template',
  REGEX = 'regex',
  HTML = 'html',
  CSV = 'csv',
}

export enum LLMBackend {
  OPENAI = 'openai',
  VLLM = 'vllm',
  OLLAMA = 'ollama',
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: number;
  conversation_id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  backend?: string;
  model?: string;
  output_format?: string;
  llm_parameters?: Record<string, any>;
  format_spec?: string;
}

export interface JSONSchema {
  id: number;
  user_id: number;
  name: string;
  schema: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  user_id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface RegexPattern {
  id: number;
  user_id: number;
  name: string;
  pattern: string;
  created_at: string;
  updated_at: string;
}

export interface CSVPreset {
  id: number;
  user_id: number;
  name: string;
  columns: string;
  created_at: string;
  updated_at: string;
}

export interface LLMParameters {
  temperature?: number;
  max_tokens?: number;
  api_key?: string;
  base_url?: string;
}
