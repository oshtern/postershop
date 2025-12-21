import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { fetchMe, setUser } from '@/store/userSlice';
import { api } from '@/lib/api';
import { loadCart, resetCart } from '@/store/cartSlice';

export default function Header() {
  const count = useSelector((s: RootState) => s.cart.items.reduce((n, i) => n + i.qty, 0));
  const user = useSelector((s: RootState) => s.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMe() as any).then((res: any) => {
      const u = res?.payload?.user;
      if (u) dispatch(loadCart() as any);
    });
  }, [dispatch]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    dispatch(setUser(null));
    dispatch(resetCart());
    navigate('/');
  }

  return (
    <header>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/">
          <strong>PosterShop</strong>
        </Link>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <span>Hi, {user.name}</span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <Link to="/cart">
            Cart <span className="badge">{count}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
