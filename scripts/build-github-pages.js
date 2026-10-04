const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const apiOrigin = process.env.NORTHLINE_API_ORIGIN || 'https://northline-web-three.vercel.app';

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copyDir = (src, dest) => fs.cpSync(src, dest, { recursive: true });

copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(root, 'styles'), path.join(dist, 'styles'));

const publicPages = fs.readdirSync(path.join(root, 'pages'))
  .filter(file => file.endsWith('.html') && file !== 'admin.html');

const rewriteForPages = html => html
  // GitHub Pages project sites live under /northline-web/, so every internal
  // root-relative URL must become a project-safe relative URL. External URLs
  // such as https://... are left untouched.
  .replace(/(href|src)=(["'])\/(?!\/)/g, '$1=$2./')
  .replace(/url\((["']?)\/(?!\/)/g, 'url($1./');

const rewriteSiteJsForPages = js => js
  .replaceAll("fetch('/api/submissions'", "fetch((window.NORTHLINE_API_ORIGIN || '') + '/api/submissions'")
  .replaceAll('src="/assets/', 'src="./assets/');

const rewrite404ForPages = html => rewriteForPages(html)
  .replace('<head>', '<head><base href="/northline-web/">');

const injectPagesConfig = html => {
  const config = '<script>window.NORTHLINE_API_ORIGIN=' + JSON.stringify(apiOrigin) + ';</script>';
  return html.replace('</head>', config + '</head>');
};

const sourceSiteJs = fs.readFileSync(path.join(root, 'scripts', 'site.js'), 'utf8');
const githubSiteJs = rewriteSiteJsForPages(sourceSiteJs);
fs.mkdirSync(path.join(dist, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(dist, 'scripts', 'site.js'), githubSiteJs);

// The root entry remains the shared homepage source. On GitHub Pages we also
// flatten pages/index.html to the publish root so there is no redirect dependency.
const rootIndex = fs.readFileSync(path.join(root, 'pages', 'index.html'), 'utf8');
fs.writeFileSync(path.join(dist, 'index.html'), injectPagesConfig(rewriteForPages(rootIndex)));

for (const file of publicPages) {
  if (file === 'index.html') continue;
  const source = fs.readFileSync(path.join(root, 'pages', file), 'utf8');
  fs.writeFileSync(path.join(dist, file), injectPagesConfig(rewriteForPages(source)));
}

if (fs.existsSync(path.join(root, '404.html'))) {
  const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  fs.writeFileSync(path.join(dist, '404.html'), rewrite404ForPages(notFound));
}

console.log('GitHub Pages build complete:', dist);
