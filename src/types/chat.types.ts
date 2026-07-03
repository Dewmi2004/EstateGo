// src/types/chat.types.ts

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  createdAt: string;
}
