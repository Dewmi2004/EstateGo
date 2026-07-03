// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import propertyReducer from './property/propertySlice';
import favoriteReducer from './favorite/favoriteSlice';
import chatbotReducer from './chatbot/chatbotSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
    chatbot: chatbotReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
