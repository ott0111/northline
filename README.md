# Northline

Northline is an independent talent agency representing creators, competitive players, and digital talent.

## Frontend

The public website is built with semantic HTML5, CSS, and vanilla JavaScript. It intentionally avoids a frontend framework so the pages remain lightweight and straightforward to deploy.

- `pages/` — source HTML5 pages
- `styles/styles.css` — shared responsive design system and component styling
- `scripts/site.js` — shared navigation, interaction, accessibility, and progressive-enhancement behavior
- `docs/` — generated GitHub Pages output
- `assets/` and `Work/` — brand assets and portfolio media
- `data/talent/` — talent data
- `api/` — Vercel serverless API routes

The shared design system uses Northline's dark, white, and grey identity, consistent card treatments, accessible focus states, reduced-motion support, and responsive layouts.

## Backend

- Vercel serverless API routes
- Neon Postgres for submissions
- Resend for optional submission email notifications

## Local development

Serve the static pages with any local static web server. The API routes require Vercel's runtime and the configured environment variables.

## Environment variables

- `DATABASE_URL`
- `RESEND_API_KEY` (optional)
- `NOTIFICATION_EMAIL` (optional)
- `FROM_EMAIL` (optional)

## Database

The submission API creates the `northline_submissions` table when needed and stores talent applications, brand briefs, and contact messages.

## Validation

Run `npm run check` to syntax-check the shared JavaScript, build script, and submission API. Run `npm run build:pages` to regenerate `docs/` from `pages/` and the shared assets.

The production repository is `ott0111/northline`. GitHub Pages output is synchronized by the repository workflow; Vercel deployments use the linked Git integration.
