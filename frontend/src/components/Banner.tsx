import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { clearFlash } from '@/store/flashSlice';

export default function Banner() {
  const dispatch = useDispatch();
  const { message, kind } = useSelector((s: RootState) => s.flash);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => dispatch(clearFlash()), 5000);
    return () => clearTimeout(t);
  }, [message, dispatch]);

  if (!message) return null;

  const bg =
    kind === 'success' ? '#e7f7ec' : kind === 'error' ? '#fde8e8' : '#eef2ff';
  const border =
    kind === 'success' ? '#2c7a4b' : kind === 'error' ? '#c53030' : '#4c51bf';
  const color = border;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        margin: '12px 16px 0',
        padding: '10px 12px',
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>{message}</div>
      <button
        className="btn"
        onClick={() => dispatch(clearFlash())}
        aria-label="Close"
        style={{ borderColor: border }}
      >
        ×
      </button>
    </div>
  );
}
