// src/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './sclice/leadSlice';

const store = configureStore({
  reducer: {
    leads: leadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;