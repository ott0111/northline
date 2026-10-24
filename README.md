# Northline

Northline is a talent agency representing creators, competitive players, and digital talent.

## Stack

- Static HTML/CSS/JavaScript frontend
- Vercel serverless API routes
- Neon Postgres for submissions
- Resend for optional submission email notifications

## Local development

Serve the repository with any static web server. The API routes require Vercel's runtime and the configured environment variables.

## Environment variables

- `DATABASE_URL`
- `RESEND_API_KEY` (optional)
- `NOTIFICATION_EMAIL` (optional)
- `FROM_EMAIL` (optional)

## Database

The submission API creates the `northline_submissions` table when needed and stores talent applications, brand briefs, and contact messages.

## Validation

Run `npm run check` to syntax-check the JavaScript files used by the site. The Vercel project is linked to `ott0111/northline` on `main`; production deployments are managed through that Git integration. Public routes are verified after production deployments.
