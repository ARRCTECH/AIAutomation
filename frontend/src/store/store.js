import { configureStore } from "@reduxjs/toolkit";
import ttsReducer from "../store/slice/ttsSlice";

export const store = configureStore({
  reducer: {
    tts: ttsReducer,
  },
});