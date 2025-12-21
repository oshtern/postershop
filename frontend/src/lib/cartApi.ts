import { api } from './api';
import type { Product } from '@/types';

export interface ServerCartItem {
  product: Product;
  qty: number;
}
export interface ServerCart {
  cartId: number;
  items: ServerCartItem[];
  subtotal: number; // cents
}

export function getCart() {
  return api<ServerCart>('/api/cart');
}

export function addItem(productId: number, qty = 1) {
  return api<ServerCart>('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty }),
  });
}

export function setItemQty(productId: number, qty: number) {
  return api<ServerCart>('/api/cart/items', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty }),
  });
}

export function removeItem(productId: number) {
  return api<ServerCart>(`/api/cart/items/${productId}`, { method: 'DELETE' });
}

export function clearCart() {
  return api<ServerCart>('/api/cart/clear', { method: 'POST' });
}
