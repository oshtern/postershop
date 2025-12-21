import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';

/** Product tile for the grid on the home page */
export default function ProductCard({ product }: { product: Product }) {
  const img = product.image || `https://picsum.photos/seed/${product.id}/600/800`;
  return (
    <div className="card">
      <img src={img} alt={product.title} />
      <h3 title={product.title}>{product.title}</h3>
      <div className="price">${(product.price_cents / 100).toFixed(2)}</div>
      <div className="actions">
        <Link className="btn" to={`/product/${product.id}`}>
          View
        </Link>
      </div>
    </div>
  );
}
