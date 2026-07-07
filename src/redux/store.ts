// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import propertyReducer from './property/propertySlice';
import favoriteReducer from './favorite/favoriteSlice';
import chatbotReducer from './chatbot/chatbotSlice';
import paymentReducer from './payment/paymentSlice';
import settingsReducer from './settings/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
    chatbot: chatbotReducer,
    payment: paymentReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
