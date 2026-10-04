# Northline backend

Northline uses a small Vercel serverless backend for public submission intake and notifications.

## Environment

Copy `.env.example` to `.env.local` locally, or add the required variables in Vercel Project Settings → Environment Variables.

Required:
- `DATABASE_URL` — Neon/Postgres connection string.

Optional:
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `NORTHLINE_API_ORIGIN`

Never commit real credentials or API keys.

## Routes

- `GET|POST|PATCH|DELETE /api/submissions` — public submission intake and submission management.

## Repository layout

- `pages/` — Vercel/public page sources.
- `assets/` — shared public assets.
- `styles/` — shared public styles.
- `scripts/` — site scripts and the GitHub Pages build.
- `api/` — Vercel serverless backend.
- `github-pages/` — generated GitHub Pages output only.
- `.github/workflows/deploy-github-pages.yml` — builds and deploys `github-pages/`.

Vercel should use the repository root as its project root.
