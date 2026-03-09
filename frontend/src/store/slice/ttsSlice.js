import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateSpeechAPI } from "../api/ttsAPI";

export const generateSpeech = createAsyncThunk(
  "tts/generateSpeech",
  async (data, { rejectWithValue }) => {
    try {
      console.log('Sending to API:', data); // Debug log
      const audioBlob = await generateSpeechAPI(data);
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to generate speech");
    }
  }
);

const ttsSlice = createSlice({
  name: "tts",
  initialState: {
    audioUrl: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAudio: (state) => {
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      state.audioUrl = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateSpeech.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clean up previous audio URL if exists
        if (state.audioUrl) {
          URL.revokeObjectURL(state.audioUrl);
          state.audioUrl = null;
        }
      })
      .addCase(generateSpeech.fulfilled, (state, action) => {
        state.loading = false;
        state.audioUrl = action.payload;
      })
      .addCase(generateSpeech.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate speech";
      });
  },
});

export const { clearAudio } = ttsSlice.actions;
export default ttsSlice.reducer;