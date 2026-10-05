const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'docs');
const apiOrigin = process.env.NORTHLINE_API_ORIGIN || 'https://northline-web-three.vercel.app';

const publicPages = fs.readdirSync(path.join(root, 'pages'))
  .filter(file => file.endsWith('.html') && file !== 'admin.html');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copyDir = (src, dest) => {
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    throw new Error('Missing directory required for GitHub Pages: ' + src);
  }
  fs.cpSync(src, dest, { recursive: true, force: true, errorOnExist: false });
};

copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(root, 'styles'), path.join(dist, 'styles'));
copyDir(path.join(root, 'Work'), path.join(dist, 'Work'));

const publicPageSources = publicPages.map(file => fs.readFileSync(path.join(root, 'pages', file), 'utf8'));
const workReferences = new Set();

for (const html of publicPageSources) {
  for (const match of html.matchAll(/(?:src|href)=["'](\/Work\/[^"']+)["']/g)) {
    workReferences.add(match[1].slice(1));
  }
}

for (const relativePath of workReferences) {
  const sourcePath = path.join(root, relativePath);
  const publishedPath = path.join(dist, relativePath);

  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error('Missing Work asset referenced by the site: ' + relativePath);
  }

  if (!fs.existsSync(publishedPath) || !fs.statSync(publishedPath).isFile()) {
    throw new Error('Work asset was not copied to docs: ' + relativePath);
  }

  const sourceSize = fs.statSync(sourcePath).size;
  const publishedSize = fs.statSync(publishedPath).size;

  if (sourceSize !== publishedSize) {
    throw new Error('Work asset copy size mismatch: ' + relativePath);
  }
}

console.log('Validated Work assets:', workReferences.size);

const rewriteForPages = html => html
  .replace(/(href|src)=(['"])\/(?!\/)/g, '$1=$2./')
  .replace(/url\((['"]?)\/(?!\/)/g, 'url($1./');

const rewriteSiteJsForPages = js => js
  .replaceAll("fetch('/api/submissions'", "fetch((window.NORTHLINE_API_ORIGIN || '') + '/api/submissions'")
  .replaceAll('src="/assets/', 'src="./assets/');

const rewrite404ForPages = html => rewriteForPages(html);

const injectPagesConfig = html => {
  const config = '<script>window.NORTHLINE_API_ORIGIN=' + JSON.stringify(apiOrigin) + ';</script>';
  return html.replace('</head>', config + '</head>');
};

const sourceSiteJs = fs.readFileSync(path.join(root, 'scripts', 'site.js'), 'utf8');
const githubSiteJs = rewriteSiteJsForPages(sourceSiteJs);
fs.mkdirSync(path.join(dist, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(dist, 'scripts', 'site.js'), githubSiteJs);

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

fs.writeFileSync(path.join(dist, '.nojekyll'), '');

fs.writeFileSync(path.join(dist, 'robots.txt'), [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin.html',
  'Disallow: /admin',
  'Disallow: /pages/',
  'Disallow: /api/',
  '',
  'Sitemap: https://northline.co/sitemap.xml',
  ''
].join('\n'));

const sitemapPages = publicPages
  .map(file => file === 'index.html' ? 'https://northline.co/' : 'https://northline.co/' + file)
  .map(url => '<url><loc>' + url + '</loc></url>')
  .join('');

fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + sitemapPages + '</urlset>'
);

console.log('GitHub Pages build complete:', dist);