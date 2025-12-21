import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCartServer, clearCartServer } from '@/store/cartSlice';
import { Link } from 'react-router-dom';
import type { RootState } from '@/store/store';

export default function Cart() {
  const user = useSelector((s: RootState) => s.user.user);
  const items = useSelector((s: RootState) => s.cart.items);
  const subtotal = useSelector((s: RootState) => s.cart.subtotal);
  const dispatch = useDispatch();

  const empty = items.length === 0;
  const canCheckout = Boolean(user) && !empty;

  return (
    <div>
      <h2>Your Cart</h2>
      {!user && <p style={{ color: 'crimson' }}>Log in to use the shopping cart.</p>}
      {empty && <p>Empty.</p>}

      <ul>
        {items.map((i) => (
          <li key={i.product.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <img
              src={i.product.image || `https://picsum.photos/seed/${i.product.id}/160/160`}
              width={60}
              alt={i.product.title}
            />
            <div style={{ flex: 1 }}>
              {i.product.title} × {i.qty}
            </div>
            <div>${(i.product.price_cents * i.qty / 100).toFixed(2)}</div>
            <button
              className="btn danger"
              onClick={() => dispatch(removeFromCartServer(i.product.id) as any)}
              disabled={!user}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <hr />
      <div>
        Subtotal: <strong>${(subtotal / 100).toFixed(2)}</strong>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={() => dispatch(clearCartServer() as any)} disabled={!user || empty}>
          Clear
        </button>
        <Link
          to={canCheckout ? '/checkout' : '#'}
          className={`btn primary ${!canCheckout ? 'disabled' : ''}`}
          onClick={(e) => {
            if (!canCheckout) e.preventDefault();
          }}
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
