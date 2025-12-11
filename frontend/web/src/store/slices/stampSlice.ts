import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { stampAPI } from '../../services/api';

interface Stamp {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  country: string;
  issueDate?: string;
  designer?: string;
  printer?: string;
  denomination: number;
  currency: string;
  size?: string;
  perforation?: string;
  color?: string;
  quantity?: number;
  rarity: string;
  images: string[];
  history?: string;
  marketValue?: number;
  marketCurrency: string;
  verified: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface StampState {
  stamps: Stamp[];
  currentStamp: Stamp | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    category?: string;
    country?: string;
    rarity?: string;
    sortBy: string;
    sortOrder: string;
    page?: number;
  };
}

const initialState: StampState = {
  stamps: [],
  currentStamp: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
};

// 异步thunks
export const fetchStamps = createAsyncThunk(
  'stamps/fetchStamps',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    country?: string;
    rarity?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await stampAPI.getStamps(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取邮票列表失败');
    }
  }
);

export const fetchStampById = createAsyncThunk(
  'stamps/fetchStampById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await stampAPI.getStampById(id);
      return response.data.stamp;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取邮票详情失败');
    }
  }
);

export const createStamp = createAsyncThunk(
  'stamps/createStamp',
  async (stampData: Partial<Stamp>, { rejectWithValue }) => {
    try {
      const response = await stampAPI.createStamp(stampData);
      return response.data.stamp;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '创建邮票失败');
    }
  }
);

export const updateStamp = createAsyncThunk(
  'stamps/updateStamp',
  async ({ id, data }: { id: string; data: Partial<Stamp> }, { rejectWithValue }) => {
    try {
      const response = await stampAPI.updateStamp(id, data);
      return response.data.stamp;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '更新邮票失败');
    }
  }
);

export const deleteStamp = createAsyncThunk(
  'stamps/deleteStamp',
  async (id: string, { rejectWithValue }) => {
    try {
      await stampAPI.deleteStamp(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '删除邮票失败');
    }
  }
);

const stampSlice = createSlice({
  name: 'stamps',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStamp: (state) => {
      state.currentStamp = null;
    },
    setFilters: (state, action: PayloadAction<Partial<StampState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stamps
      .addCase(fetchStamps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStamps.fulfilled, (state, action) => {
        state.loading = false;
        state.stamps = action.payload.stamps;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStamps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stamp By ID
      .addCase(fetchStampById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStampById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStamp = action.payload;
      })
      .addCase(fetchStampById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Stamp
      .addCase(createStamp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStamp.fulfilled, (state, action) => {
        state.loading = false;
        state.stamps.unshift(action.payload);
      })
      .addCase(createStamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Stamp
      .addCase(updateStamp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStamp.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stamps.findIndex(stamp => stamp.id === action.payload.id);
        if (index !== -1) {
          state.stamps[index] = action.payload;
        }
        if (state.currentStamp?.id === action.payload.id) {
          state.currentStamp = action.payload;
        }
      })
      .addCase(updateStamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Stamp
      .addCase(deleteStamp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStamp.fulfilled, (state, action) => {
        state.loading = false;
        state.stamps = state.stamps.filter(stamp => stamp.id !== action.payload);
        if (state.currentStamp?.id === action.payload) {
          state.currentStamp = null;
        }
      })
      .addCase(deleteStamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentStamp, setFilters, resetFilters, setCurrentPage } = stampSlice.actions;
export default stampSlice.reducer;