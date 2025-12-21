import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartServer } from '@/store/cartSlice';
import { api } from '@/lib/api';
import type { Product, Review } from '@/types';
import type { RootState } from '@/store/store';

function Stars({ rating }: { rating: number }) {
  const full = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {full}
      {empty}
    </span>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qty, setQty] = useState<number>(1);
  const user = useSelector((s: RootState) => s.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const p = await api<Product>(`/api/products/${id}`);
      setProduct(p);
      const r = await api<{ reviews: Review[] }>(`/api/reviews/${id}`);
      setReviews(r.reviews);
    })();
  }, [id]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);
  }, [reviews]);

  if (!product) return <div>Loading…</div>;
  const img = product.image || `https://picsum.photos/seed/${product.id}/800/1000`;
  const canBuy = Boolean(user);

  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <img src={img} alt={product.title} style={{ width: '100%', maxWidth: 600 }} />

      <div style={{ margin: '8px 0' }}>
        <strong>${(product.price_cents / 100).toFixed(2)}</strong>
        <span style={{ marginLeft: 8 }}>
          <Stars rating={avg} /> ({reviews.length} reviews)
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
        <input
          className="input"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
          style={{ width: 80 }}
        />
        <button
          className="btn primary"
          onClick={() => dispatch(addToCartServer({ productId: product.id, qty }) as any)}
          disabled={!canBuy}
        >
          Add to cart
        </button>
        {!canBuy && <small>(Log in to add items)</small>}
      </div>

      <h3>Reviews</h3>
      <ul>
        {reviews.map((r) => (
          <li key={r.id}>
            <Stars rating={r.rating} /> <strong>{r.author}</strong>: {r.body}
          </li>
        ))}
      </ul>
    </div>
  );
}
