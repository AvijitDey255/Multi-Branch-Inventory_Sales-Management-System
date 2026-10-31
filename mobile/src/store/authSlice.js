import { createSlice } from '@reduxjs/toolkit';
import { saveItem, removeItem, StorageKeys, setCookie, deleteCookie } from '../utils/storage';

const saveAuthToStorage = (user, token) => {
  if (user) {
    saveItem(StorageKeys.AUTH_USER, user);
  }
  if (token) {
    saveItem(StorageKeys.AUTH_TOKEN, token);
    setCookie('token', token, 30);
  }
};

const clearAuthFromStorage = () => {
  removeItem(StorageKeys.AUTH_USER);
  removeItem(StorageKeys.AUTH_TOKEN);
  deleteCookie('token');
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      state.isAuthenticated = Boolean(user && token);
      state.user = user || null;
      state.token = token || null;
      state.error = null;

      if (user && token) {
        saveAuthToStorage(user, token);
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
        saveItem(StorageKeys.AUTH_USER, state.user);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      clearAuthFromStorage();
    },
    setAuthLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setAuthError: (state, action) => {
      state.error = action.payload || null;
    },
  },
});

export const {
  setCredentials,
  updateUser,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export const updateProfile = updateUser;
export const login = setCredentials;

export default authSlice.reducer;
