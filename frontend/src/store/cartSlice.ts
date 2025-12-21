import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';
import * as CartAPI from '@/lib/cartApi';

export interface CartItem {
  product: Product;
  qty: number;
}
export interface CartState {
  items: CartItem[];
  subtotal: number; // cents
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CartState = { items: [], subtotal: 0, status: 'idle' };

export const loadCart = createAsyncThunk('cart/load', async () => {
  const cart = await CartAPI.getCart();
  return cart;
});

export const addToCartServer = createAsyncThunk(
  'cart/add',
  async ({ productId, qty }: { productId: number; qty: number }) => {
    const cart = await CartAPI.addItem(productId, qty);
    return cart;
  },
);

export const setQtyServer = createAsyncThunk(
  'cart/setQty',
  async ({ productId, qty }: { productId: number; qty: number }) => {
    const cart = await CartAPI.setItemQty(productId, qty);
    return cart;
  },
);

export const removeFromCartServer = createAsyncThunk('cart/remove', async (productId: number) => {
  const cart = await CartAPI.removeItem(productId);
  return cart;
});

export const clearCartServer = createAsyncThunk('cart/clear', async () => {
  const cart = await CartAPI.clearCart();
  return cart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(loadCart.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.subtotal = a.payload.subtotal;
        s.status = 'succeeded';
      })
      .addCase(addToCartServer.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.subtotal = a.payload.subtotal;
      })
      .addCase(setQtyServer.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.subtotal = a.payload.subtotal;
      })
      .addCase(removeFromCartServer.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.subtotal = a.payload.subtotal;
      })
      .addCase(clearCartServer.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.subtotal = a.payload.subtotal;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export const selectSubtotal = (s: { cart: CartState }) => s.cart.subtotal;
export default cartSlice.reducer;
