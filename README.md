# Northline

Northline is a talent agency representing creators, competitive players, and digital talent.

## Stack

- Static HTML/CSS/JavaScript frontend
- Vercel serverless API routes
- Neon Postgres for submissions
- Resend for optional admin email notifications

## Local development

Serve the repository with any static web server. The API routes require Vercel's runtime and the configured environment variables.

## Environment variables

- `DATABASE_URL`
- `ADMIN_SECRET`
- `RESEND_API_KEY` (optional)
- `ADMIN_EMAIL` (optional)
- `FROM_EMAIL` (optional)

## Database

The submission API initializes its table when needed.

## Validation

Run `npm run check` to syntax-check the JavaScript files used by the site. The Vercel project is linked to `ott0111/northline` on `main`; production deployments are managed through that Git integration.
