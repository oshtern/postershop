import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import flashReducer from './flashSlice';

export const store = configureStore({
  reducer: { cart: cartReducer, ui: uiReducer, user: userReducer, flash: flashReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
