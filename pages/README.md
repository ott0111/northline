# HTML5 source pages

All public page templates live in this directory. These files use semantic HTML5 and are the source of truth for the public website.

- Main agency pages
- Talent roster and individual talent profiles
- Application, contact, and brand brief forms
- Legal, process, and FAQ pages

Shared presentation lives in `../styles/styles.css`; shared progressive-enhancement behavior lives in `../scripts/site.js`. Keep the dark, white, and grey brand identity, preserve existing public URLs, and make sure interactive elements remain keyboard accessible and usable on mobile.

Run `npm run build:pages` after editing source pages to regenerate `docs/`.
