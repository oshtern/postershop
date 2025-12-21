/**
 * PosterShop backend (TypeScript)
 * - Local auth via sessions (email/password)
 * - Product listing with pagination (returns total + totalPages)
 * - Reviews (read-only seed)
 * - Simulated checkout (requires login and non-empty cart)
 */
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import type { SessionUser } from './types';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err);
  process.exit(1);
});

app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

/** Helper: place a minimal user object into the session */
function setSessionUser(req: Request, user: SessionUser): void {
  (req.session as any).user = user;
}

/** Middleware: require a logged-in user */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any)?.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

/** Find or create a cart for a user, returning its id */
async function getOrCreateCartId(userId: number): Promise<number> {
  const existing = await pool.query('SELECT id FROM carts WHERE user_id=$1', [userId]);
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return created.rows[0].id;
}

/** Return cart items joined with product info */
async function getCartWithProducts(userId: number) {
  const cartId = await getOrCreateCartId(userId);
  const r = await pool.query(
    `SELECT ci.product_id, ci.qty,
            p.id, p.title, p.description, p.price_cents, p.image, p.created_at
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY p.title ASC`,
    [cartId],
  );
  const items = r.rows.map((row) => ({
    product: {
      id: row.id,
      title: row.title,
      description: row.description,
      price_cents: row.price_cents,
      image: row.image,
      created_at: row.created_at,
    },
    qty: row.qty as number,
  }));
  const subtotal = items.reduce((s, i) => s + i.product.price_cents * i.qty, 0);
  return { cartId, items, subtotal };
}

/* ----------------------- Auth ----------------------- */

/** Register a new user */
app.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};
  try {
    if (!name || !email || !password || String(password).length < 8) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const r = await pool.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,email,name',
      [String(name), String(email).toLowerCase(), hash],
    );
    const user: SessionUser = r.rows[0];
    setSessionUser(req, user);
    return res.json({ ok: true, user });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Login with email/password */
app.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  try {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    const user = r.rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    setSessionUser(req, { id: user.id, email: user.email, name: user.name });
    return res.json({ ok: true, user: (req.session as any).user });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Logout and clear session */
app.post('/auth/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {});
  return res.json({ ok: true });
});

/** Current session user */
app.get('/api/me', (req: Request, res: Response) => {
  return res.json({ user: (req.session as any)?.user || null });
});

/* ----------------------- Products ----------------------- */

/** List products with pagination and simple search/sort */
app.get('/api/products', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  const sort = String(req.query.sort || 'new');
  const page = Math.max(0, parseInt(String(req.query.page || '0'), 10)); // 0-based
  const pageSize = Math.min(Math.max(1, parseInt(String(req.query.pageSize || '12'), 10)), 50);

  let order = 'p.created_at DESC';
  if (sort === 'price_asc') order = 'p.price_cents ASC';
  if (sort === 'price_desc') order = 'p.price_cents DESC';

  const params: any[] = [];
  let where = '';
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE p.title ILIKE $${params.length}`;
  }

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM products p ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    params.push(pageSize);
    params.push(page * pageSize);
    const listRes = await pool.query(
      `SELECT p.* FROM products p ${where} ORDER BY ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return res.json({ items: listRes.rows, page, pageSize, total, totalPages });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products/:productId', async (req: Request, res: Response) => {
  res.set('Content-Type', 'application/json; charset=utf-8');
  const id = parseInt(String(req.params.productId), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const r = await pool.query(
      'SELECT * FROM products WHERE id=$1',
      [id],
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Product Not Found' });
    }

    return res.json(r.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ----------------------- Reviews ----------------------- */

/** Get reviews for a product */
app.get('/api/reviews/:productId', async (req: Request, res: Response) => {
  res.set('Content-Type', 'application/json; charset=utf-8');
  const id = parseInt(String(req.params.productId), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const r = await pool.query(
      'SELECT id, author, body, rating, created_at FROM reviews WHERE product_id=$1 ORDER BY created_at DESC',
      [id],
    );
    return res.json({ reviews: r.rows });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ----------------------- Cart (server-side) ----------------------- */

/** Get current user's cart (with products) */
app.get('/api/cart', requireAuth, async (req, res) => {
  const user = (req.session as any).user as SessionUser;
  try {
    const data = await getCartWithProducts(user.id);
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Add to cart (increment) — body: { productId: number, qty?: number } */
app.post('/api/cart/items', requireAuth, async (req, res) => {
  const user = (req.session as any).user as SessionUser;
  const productId = Number(req.body?.productId);
  const qty = Math.max(1, Number(req.body?.qty ?? 1));
  if (!Number.isFinite(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid productId' });
  }
  try {
    const cartId = await getOrCreateCartId(user.id);
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, qty)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty`,
      [cartId, productId, qty],
    );
    const data = await getCartWithProducts(user.id);
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Set quantity (replace) — body: { productId: number, qty: number } */
app.patch('/api/cart/items', requireAuth, async (req, res) => {
  const user = (req.session as any).user as SessionUser;
  const productId = Number(req.body?.productId);
  const qty = Number(req.body?.qty);
  if (!Number.isFinite(productId) || productId <= 0 || !Number.isFinite(qty) || qty < 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    const cartId = await getOrCreateCartId(user.id);
    if (qty === 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cartId, productId]);
    } else {
      await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, qty)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET qty = EXCLUDED.qty`,
        [cartId, productId, qty],
      );
    }
    const data = await getCartWithProducts(user.id);
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Remove item */
app.delete('/api/cart/items/:productId', requireAuth, async (req, res) => {
  const user = (req.session as any).user as SessionUser;
  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId <= 0) return res.status(400).json({ error: 'Invalid productId' });
  try {
    const cartId = await getOrCreateCartId(user.id);
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cartId, productId]);
    const data = await getCartWithProducts(user.id);
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Clear cart */
app.post('/api/cart/clear', requireAuth, async (req, res) => {
  const user = (req.session as any).user as SessionUser;
  try {
    const cartId = await getOrCreateCartId(user.id);
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);
    const data = await getCartWithProducts(user.id);
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ----------------------- Checkout ----------------------- */

/** Simulated checkout (requires login and non-empty server cart) */
app.post('/api/checkout', requireAuth, async (req: Request, res: Response) => {
  const user = (req.session as any).user as SessionUser;
  try {
    const { cartId, items, subtotal } = await getCartWithProducts(user.id);
    if (items.length === 0) return res.status(400).json({ error: 'Empty cart' });

    // OPTIONAL: Validate shipping in req.body.shipping if you keep it
    const address = String(req.body?.shipping?.address || '').trim();
    if (address.length < 5) return res.status(400).json({ error: 'Invalid address' });

    // Simulate success
    const orderId = Math.floor(Math.random() * 1_000_000);

    // Clear the server cart
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);

    return res.json({ ok: true, orderId, total_cents: subtotal });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
