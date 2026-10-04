# Northline backend

The Northline site is a static frontend with a small Vercel serverless backend.

## Environment

Copy `.env.example` to `.env.local` locally, or add the same variables in Vercel Project Settings → Environment Variables.

Required:
- `ADMIN_PASSWORD` — password used at `/admin`.
- `ADMIN_SECRET` — long random secret used to sign admin session cookies.
- `DATABASE_URL` — Neon/Postgres connection string.

Optional:
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `NORTHLINE_API_ORIGIN`

Never commit real credentials or API keys.

## Routes

- `POST /api/admin` — authenticate and create an HttpOnly admin session.
- `DELETE /api/admin` — clear the admin session.
- `GET|POST|PATCH|DELETE /api/submissions` — public submission intake and authenticated admin management.
- `GET|PATCH /api/talent` — authenticated internal talent status and notes.

The backend creates these tables automatically when needed:
- `northline_submissions`
- `northline_talent_notes`

## Repository layout

- `pages/` — Vercel/public page sources.
- `assets/` — shared public assets.
- `styles/` — shared public styles.
- `scripts/` — site scripts and the GitHub Pages build.
- `api/` — Vercel serverless backend.
- `github-pages/` — generated GitHub Pages output only. Do not put secrets or backend code here.
- `.github/workflows/deploy-github-pages.yml` — builds and deploys `github-pages/`.

Vercel should use the repository root as its project root.
