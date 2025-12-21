import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/** Registration page (local email/password) */
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const dispatch = useDispatch();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error || 'Registration failed');
    dispatch(setUser(j.user));
    location.href = '/';
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn primary">Create account</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </div>
  );
}
