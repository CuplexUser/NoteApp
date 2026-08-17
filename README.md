# Notes — React + TypeScript + Ant Design + Postgres

A full-stack notes app that exercises several distinct Postgres features against a Neon database: relational foreign keys, array columns, JSONB, full-text search, and BYTEA binary storage — with cookie-based JWT authentication.

## Stack
- **client/** — Vite + React 19 + TypeScript + Ant Design + React Router + TanStack Query
- **server/** — Express + TypeScript + `pg` (node-postgres), JWT auth via httpOnly cookies
- Managed as **npm workspaces** from the repo root

## Setup
```bash
npm install         # installs client + server together
npm run migrate      # applies server/src/schema.sql to your Neon database
npm run dev           # runs both servers: API on :4000, app on :5173
```
Then open http://localhost:5173.

The root `.env` already has `DATABASE_URL` plus a generated `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN`. See `.env.example` for the shape if you need to point at a different database.

## What each feature tests in Postgres
| Feature | Postgres capability |
|---|---|
| Register / login | `bcryptjs` hashing, unique constraint on `email`, JWT in an httpOnly cookie |
| Notes CRUD | Relational writes with a `user_id` foreign key |
| Tag filter | Array column (`text[]`) + `&&` overlap queries, `unnest()` for distinct tags |
| Search box | Generated `tsvector` column + GIN index, `plainto_tsquery` / `ts_rank` |
| Color / pinned on a note | JSONB `metadata` column, queried with `metadata->>'pinned'` |
| File attachments | Binary file bytes stored directly in a `bytea` column (no S3) — upload, list, download, delete |
| Dashboard | Aggregate SQL: `COUNT`, `GROUP BY`, `date_trunc`, `unnest()` for per-tag counts |
| Note read view | Renders a note's Markdown content client-side (`react-markdown` + `remark-gfm`) |
| Account settings | Display name update, avatar photo stored as `bytea` on `users` (same pattern as attachments), password change via `bcryptjs`, light/dark theme toggle (local only) |

## Project layout
```
server/   Express API — routes/, middleware/, schema.sql, migrate.ts
client/   Vite React app — pages/, components/, api/, contexts/
```

## Scripts (from repo root)
- `npm run dev` — both dev servers via `concurrently`
- `npm run migrate` — (re)applies the schema (safe to re-run, uses `IF NOT EXISTS`)
- `npm run build` — production builds of both packages
