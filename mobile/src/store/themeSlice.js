import { createSlice } from '@reduxjs/toolkit';
import { saveItem, StorageKeys } from '../utils/storage';

const initialState = {
  mode: 'dark', // default dark mode for sleek modern feel
  isLoaded: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      saveItem(StorageKeys.THEME_MODE, state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      state.isLoaded = true;
      saveItem(StorageKeys.THEME_MODE, action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
