# PosterShop — Clean TypeScript Baseline

A minimalist ecommerce site that sells **posters**. Built for QA exercises and e2e testing.
- Frontend: React + Redux Toolkit + React Router + Vite (**TypeScript**)
- Backend: Express + PostgreSQL + Sessions (**TypeScript**)
- Auth: Local email/password (bcrypt). No OIDC.
- DB: PostgreSQL (Docker compose included)
- Payments: Simulated checkout with validation

This codebase emphasizes **clarity, comments, types, and formatting** (Prettier).

## Quick Start

### 1) Database (Only run once during the first setup)
```bash
docker compose up -d db

docker compose exec -T db psql -U postershop -d postershop < backend/db/schema.sql
docker compose exec -T db psql -U postershop -d postershop < backend/db/seed.sql
```

### 2) Backend
```bash
cd backend
cp .env.sample .env
npm i
npm run dev        # http://localhost:4000
```

**API docs (Swagger):**
- Open `http://localhost:4000/api-docs` after the backend is running.
- Expand `POST /auth/login`, click **Try it out**, and enter JSON (email/password).
- The Swagger UI is configured to use credentials so the session cookie set on login will be stored and sent on subsequent requests.

### 3) Frontend
```bash
cd frontend
npm i
npm run dev        # http://localhost:5173
```
