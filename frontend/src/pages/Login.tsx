import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/** Login page (local email/password) */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const dispatch = useDispatch();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error || 'Login failed');
    dispatch(setUser(j.user));
    location.href = '/';
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn primary">Login</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </div>
  );
}
