// src/redux/chatbot/chatbotSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getBotResponse } from '@/services/chatbot/estateBotService';
import { ChatMessage } from '@/types/chat.types';
import { Property } from '@/types/property.types';

interface ChatbotState {
  messages: ChatMessage[];
  isThinking: boolean;
}

const welcomeMessage: ChatMessage = {
  id: 'm_welcome',
  role: 'bot',
  text:
    "Hi, I'm EstateBot 👋 Ask me to recommend a property, plan your budget, compare two listings, or explain terms like mortgage or freehold.",
  createdAt: new Date().toISOString(),
};

const initialState: ChatbotState = {
  messages: [welcomeMessage],
  isThinking: false,
};

// Thunk so the "thinking" delay and response generation stay out of the
// component — sendMessage(text) is all a screen needs to call.
export const sendMessage = createAsyncThunk<
  ChatMessage,
  { text: string; properties: Property[] }
>('chatbot/sendMessage', async ({ text, properties }) => {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400));
  const replyText = getBotResponse(text, { properties });
  return {
    id: `m_${Date.now()}`,
    role: 'bot',
    text: replyText,
    createdAt: new Date().toISOString(),
  };
});

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `m_${Date.now()}_u`,
        role: 'user',
        text: action.payload,
        createdAt: new Date().toISOString(),
      });
    },
    clearChat: (state) => {
      state.messages = [welcomeMessage];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isThinking = true;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.isThinking = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isThinking = false;
        state.messages.push({
          id: `m_${Date.now()}_err`,
          role: 'bot',
          text: "Sorry, I couldn't process that — try asking again.",
          createdAt: new Date().toISOString(),
        });
      });
  },
});

export const { addUserMessage, clearChat } = chatbotSlice.actions;
export default chatbotSlice.reducer;
