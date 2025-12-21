import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { SessionUser } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export interface UserState {
  user: SessionUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export const fetchMe = createAsyncThunk('user/me', async () => {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
  return (await res.json()) as { user: SessionUser | null };
});

const initialState: UserState = { user: null, status: 'idle' };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.status = 'succeeded';
    });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
