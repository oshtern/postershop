export interface Product {
  id: number;
  title: string;
  description: string;
  price_cents: number;
  image: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  author: string;
  body: string;
  rating: number; // 1..5
  created_at: string;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
}

export interface ProductsResponse {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
