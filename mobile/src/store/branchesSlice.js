import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchBranchesFromApi,
  fetchManagersFromApi,
  createBranchApi,
} from '../services/api';

export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await fetchBranchesFromApi(params);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchManagers = createAsyncThunk(
  'branches/fetchManagers',
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchManagersFromApi();
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async (branchData, { rejectWithValue }) => {
    try {
      const result = await createBranchApi(branchData);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const branchesSlice = createSlice({
  name: 'branches',
  initialState: {
    items: [],
    loading: false,
    refreshing: false,
    error: null,
    fromLiveBackend: false,
    filter: 'All', // 'All' | 'Active' | 'WithManager' | 'Unassigned'
    searchQuery: '',
    selectedBranch: null,
    managers: [],
    managersLoading: false,
    managersError: null,
    createLoading: false,
    createError: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBranches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.items = action.payload.branches || [];
        state.fromLiveBackend = action.payload.fromLiveBackend;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to load branches';
      })
      // fetchManagers
      .addCase(fetchManagers.pending, (state) => {
        state.managersLoading = true;
        state.managersError = null;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.managersLoading = false;
        state.managers = action.payload.managers || [];
      })
      .addCase(fetchManagers.rejected, (state, action) => {
        state.managersLoading = false;
        state.managersError = action.payload || 'Failed to load managers';
      })
      // createBranch
      .addCase(createBranch.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.createLoading = false;
        if (action.payload && action.payload.branch) {
          state.items.unshift(action.payload.branch);
        }
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || 'Failed to create branch';
      });
  },
});

export const { setFilter, setSearchQuery, setSelectedBranch, clearCreateError } = branchesSlice.actions;
export default branchesSlice.reducer;

