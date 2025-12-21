const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/** Fetch JSON with credentials and friendly error messages */
export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if ((j as any)?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const enc = encodeURIComponent;
