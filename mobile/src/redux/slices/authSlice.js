import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../../api/authApi';
import { STORAGE_KEYS } from '../../constants/config';
import { ROLES } from '../../constants/roles';

// Initial Authentication State
const initialState = {
  token: null,
  user: null, // { id, username, fullname, email, role }
  isAuthenticated: false,
  isLoading: false,
  isRestoringToken: true,
  error: null,
};

// Async thunk: Staff / Admin Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(identifier, password);
      if (!data || !data.token) {
        throw new Error('Invalid response received from authentication server.');
      }

      // Normalize role string (standardize uppercase)
      const normalizedRole = (data.role || ROLES.ADMIN).toUpperCase();
      const userPayload = {
        id: data.id,
        username: data.username,
        fullname: data.fullname || data.username,
        email: data.email,
        role: normalizedRole,
      };

      // Persist credentials securely to storage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userPayload)
      );

      return {
        token: data.token,
        user: userPayload,
      };
    } catch (err) {
      const errorMessage =
        err.message || (err.data && err.data.message) || 'Authentication failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk: Customer Login with OTP Verification
export const loginCustomerOtp = createAsyncThunk(
  'auth/loginCustomerOtp',
  async ({ contact, otp }, { rejectWithValue }) => {
    try {
      const data = await authApi.verifyCustomerOtp(contact, otp);
      if (!data || !data.token) {
        throw new Error('OTP verification failed.');
      }

      const userPayload = {
        id: data.id,
        username: data.username || 'customer',
        fullname: data.fullname || 'Customer',
        email: data.email || contact,
        role: ROLES.CUSTOMER,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userPayload)
      );

      return {
        token: data.token,
        user: userPayload,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'OTP verification failed.');
    }
  }
);

// Async thunk: Restore Session from local storage on App Launch
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        return { token, user };
      }
      return { token: null, user: null };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: Logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch {
    // Ignore error
  }
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Staff Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed. Check your credentials.';
      })
      // Customer OTP Login
      .addCase(loginCustomerOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginCustomerOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginCustomerOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'OTP verification failed.';
      })
      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.isRestoringToken = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoringToken = false;
        if (action.payload.token && action.payload.user) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoringToken = false;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
