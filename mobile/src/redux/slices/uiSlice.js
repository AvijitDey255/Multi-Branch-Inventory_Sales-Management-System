import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';

// Initial UI & Theme State
const initialState = {
  isSidebarOpen: false,
  activeBranch: 'Main Warehouse - Central',
  theme: 'light', // 'light' | 'dark'
};

// Async thunk: Load saved theme from AsyncStorage on app launch
export const loadSavedTheme = createAsyncThunk(
  'ui/loadSavedTheme',
  async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Failed to load theme from storage:', e);
    }
    return 'light';
  }
);

// Async thunk: Toggle theme and persist choice to AsyncStorage
export const toggleTheme = createAsyncThunk(
  'ui/toggleTheme',
  async (_, { getState }) => {
    const currentTheme = getState().ui.theme || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, nextTheme);
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
    return nextTheme;
  }
);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setActiveBranch: (state, action) => {
      state.activeBranch = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSavedTheme.fulfilled, (state, action) => {
        state.theme = action.payload;
      })
      .addCase(toggleTheme.fulfilled, (state, action) => {
        state.theme = action.payload;
      });
  },
});

export const {
  openSidebar,
  closeSidebar,
  toggleSidebar,
  setActiveBranch,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
