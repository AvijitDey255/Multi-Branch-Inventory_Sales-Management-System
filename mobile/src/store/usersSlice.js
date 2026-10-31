import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsersFromApi, registerUserApi } from '../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchUsersFromApi();
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'users/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await registerUserApi(userData);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    refreshing: false,
    error: null,
    searchQuery: '',
    roleFilter: 'All', // 'All' | 'admin' | 'manager' | 'salesman' | 'customer'
    selectedUser: null,
    registerLoading: false,
    registerError: null,
  },
  reducers: {
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.items = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to load users';
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        if (action.payload && action.payload.user) {
          state.items.unshift(action.payload.user);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload || 'Failed to register user';
      });
  },
});

export const {
  setRoleFilter,
  setSearchQuery,
  setSelectedUser,
  clearRegisterError,
} = usersSlice.actions;

export default usersSlice.reducer;
