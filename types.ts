export enum AgentType {
  GEMINI_API = 'GEMINI_API',
  WEB_VIEW = 'WEB_VIEW',
}

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  isActive: boolean;
  // For Web View
  url?: string;
  // For API
  model?: string;
  systemInstruction?: string;
  avatar?: string;
  color: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error?: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';