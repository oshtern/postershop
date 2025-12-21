# PosterShop — Clean TypeScript Baseline

A minimalist ecommerce site that sells **posters**. Built for QA exercises and e2e testing.
- Frontend: React + Redux Toolkit + React Router + Vite (**TypeScript**)
- Backend: Express + PostgreSQL + Sessions (**TypeScript**)
- Auth: Local email/password (bcrypt). No OIDC.
- DB: PostgreSQL (Docker compose included)
- Payments: Simulated checkout with validation

This codebase emphasizes **clarity, comments, types, and formatting** (Prettier).

## Quick Start

### 1) Database
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

### 3) Frontend
```bash
cd frontend
npm i
npm run dev        # http://localhost:5173
```
