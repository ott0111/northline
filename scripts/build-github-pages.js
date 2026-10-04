const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copyDir = (src, dest) => {
  fs.cpSync(src, dest, { recursive: true });
};

copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(root, 'styles'), path.join(dist, 'styles'));
copyDir(path.join(root, 'scripts'), path.join(dist, 'scripts'));

const publicPages = fs.readdirSync(path.join(root, 'pages'))
  .filter(file => file.endsWith('.html') && file !== 'admin.html');

const rewriteForPages = html => {
  // GitHub Pages project sites are served from /<repository>/, so root-relative
  // site paths must become relative paths. Keep external URLs, canonical URLs,
  // API URLs, hashes, mailto/tel links, and JSON-LD untouched.
  return html
    .replace(/(href|src)=(["'])\/(?!\/)/g, '$1=$2./')
    .replace(/url\((["']?)\/(?!\/)/g, 'url($1./')
    .replace(/window\.location\.pathname/g, 'window.location.pathname');
};

const injectPagesConfig = html => {
  const config = '<script>window.NORTHLINE_API_ORIGIN="https://northline-web-three.vercel.app";</script>';
  return html.replace('</head>', config + '</head>');
};

// Root index is the canonical homepage for both Vercel and GitHub Pages.
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));

// Flatten the organized /pages source directory into the GitHub Pages publish root.
for (const file of publicPages) {
  const source = fs.readFileSync(path.join(root, 'pages', file), 'utf8');
  fs.writeFileSync(path.join(dist, file), injectPagesConfig(rewriteForPages(source)));
}

// GitHub Pages has no server-side 404 routing, so publish the static 404 page.
if (fs.existsSync(path.join(root, '404.html'))) {
  fs.copyFileSync(path.join(root, '404.html'), path.join(dist, '404.html'));
}

console.log('GitHub Pages build complete:', dist);
