import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '@/store/store';
import { loadCart } from '@/store/cartSlice';
import { setFlash } from '@/store/flashSlice';

export default function Checkout() {
  const user = useSelector((s: RootState) => s.user.user);
  const items = useSelector((s: RootState) => s.cart.items);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price_cents * i.qty, 0), [items]);
  const [addr, setAddr] = useState('123 Demo St, Demo City');
  const [paying, setPaying] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const empty = items.length === 0;
  const canPay = Boolean(user) && !empty;

  async function pay() {
    if (!canPay) return;
    setPaying(true);
    try {
      const res = await api<{ orderId: number; total_cents: number }>('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping: { address: addr } }),
      });
      await dispatch(loadCart() as any); // refresh to empty cart
      dispatch(setFlash({ kind: 'success', message: `Transaction successful. Order #${res.orderId}.` }));
      navigate('/');
    } catch (e: any) {
      dispatch(setFlash({ kind: 'error', message: `Payment failed: ${e.message}` }));
      navigate('/cart');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <h2>Checkout</h2>
      {!user && (
        <p style={{ color: 'crimson' }}>
          Log in to buy posters. <Link to="/login">Login</Link>
        </p>
      )}
      {empty && <p>Your cart is empty.</p>}
      <div>
        Total: <strong>${(subtotal / 100).toFixed(2)}</strong>
      </div>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420, marginTop: 12 }}>
        <input
          className="input"
          placeholder="Shipping address"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          disabled={!canPay}
        />
        <button className="btn primary" onClick={pay} disabled={!canPay || paying}>
          {paying ? 'Processing…' : 'Pay'}
        </button>
      </div>
    </div>
  );
}
