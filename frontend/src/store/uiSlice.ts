import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  query: string;
  sort: 'new' | 'price_asc' | 'price_desc';
  page: number; // 0-based
  totalPages: number;
}

const saved: Partial<UIState> = JSON.parse(sessionStorage.getItem('postershop_ui') || '{}');

const initialState: UIState = {
  query: saved.query || '',
  sort: (saved.sort as UIState['sort']) || 'new',
  page: saved.page ?? 0,
  totalPages: saved.totalPages || 1,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setSort(state, action: PayloadAction<UIState['sort']>) {
      state.sort = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
  },
});

export const { setQuery, setSort, setPage, setTotalPages } = uiSlice.actions;
export default uiSlice.reducer;
