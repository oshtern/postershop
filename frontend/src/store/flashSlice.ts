import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FlashKind = 'success' | 'error' | 'info';

export interface FlashState {
  message: string | null;
  kind: FlashKind;
}

const initialState: FlashState = { message: null, kind: 'info' };

const flashSlice = createSlice({
  name: 'flash',
  initialState,
  reducers: {
    setFlash(state, action: PayloadAction<{ message: string; kind?: FlashKind }>) {
      state.message = action.payload.message;
      state.kind = action.payload.kind ?? 'info';
    },
    clearFlash(state) {
      state.message = null;
    },
  },
});

export const { setFlash, clearFlash } = flashSlice.actions;
export default flashSlice.reducer;
