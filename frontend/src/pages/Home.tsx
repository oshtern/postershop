import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery, setSort, setPage, setTotalPages } from '@/store/uiSlice';
import type { RootState } from '@/store/store';
import ProductCard from '@/components/ProductCard';
import { api, enc } from '@/lib/api';
import type { ProductsResponse, Product } from '@/types';

/** Home page: listing, search, sort, pagination */
export default function Home() {
  const dispatch = useDispatch();
  const { query, sort, page, totalPages } = useSelector((s: RootState) => s.ui);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const q = query ? `&q=${enc(query)}` : '';
    const res = await api<ProductsResponse>(`/api/products?sort=${sort}&page=${page}&pageSize=12${q}`);
    setItems(res.items);
    dispatch(setTotalPages(res.totalPages));
    setLoading(false);
    sessionStorage.setItem(
      'postershop_ui',
      JSON.stringify({ query, sort, page, totalPages: res.totalPages }),
    );
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [query, sort, page]);

  return (
    <div>
      <div className="toolbar">
        <input
          className="input"
          placeholder="Search posters..."
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
        />
        <select className="input" value={sort} onChange={(e) => dispatch(setSort(e.target.value as any))}>
          <option value="new">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {loading && <div>Loading…</div>}
      <div className="grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={() => dispatch(setPage(Math.max(0, page - 1)))} disabled={page === 0}>
          Prev
        </button>
        <button className="btn" onClick={() => dispatch(setPage(page + 1))} disabled={page >= totalPages - 1}>
          Next
        </button>
      </div>
      <div style={{ marginTop: 4, fontSize: 12 }}>Page {page + 1} of {Math.max(1, totalPages)}</div>
    </div>
  );
}
