export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum OutputFormat {
  FREETEXT = 'freetext',
  JSON = 'json',
  TEMPLATE = 'template',
  REGEX = 'regex',
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
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  created_at: string;
  backend?: LLMBackend;
  model?: string;
  output_format?: OutputFormat;
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

export interface LLMParameters {
  temperature?: number;
  max_tokens?: number;
  api_key?: string;
  base_url?: string;
}
