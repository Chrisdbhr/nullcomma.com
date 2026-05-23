import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const CMS_URL = 'https://cms.nullcomma.com';
const SITE_URL = 'https://nullcomma.com';
const DIST = resolve('dist');

const PROJECT_FIELDS =
  'fields=id,translations.language,translations.title,translations.synopsis,' +
  'card_image.id,card_image.type,engine,release_date,steam_id,project_type,status';

const BLOG_FIELDS =
  'fields=id,title,date_published,cover_image.id,cover_image.type,content&sort=-date_published';

function e(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text, len = 160) {
  if (!text) return '';
  const clean = text
    .replace(/^#+\s+/gm, '')
    .replace(/[*\[\]()\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > len ? clean.substring(0, len) + '...' : clean;
}

function prefTranslation(translations, lang) {
  if (!translations || translations.length === 0) return {};
  if (lang) {
    const t = translations.find(t => t.language?.startsWith(lang));
    if (t) return t;
  }
  const en = translations.find(t => t.language?.startsWith('en'));
  if (en) return en;
  const pt = translations.find(t => t.language?.startsWith('pt'));
  if (pt) return pt;
  return translations[0] || {};
}

function assetUrl(id, width = 1200) {
  return id ? `${CMS_URL}/assets/${id}?width=${width}` : null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

// ── Inline fallback styles (matches privacy/terms glass-card style) ──
const FALLBACK_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#141414;color:#e0e0e0;font-family:Inter,system-ui,sans-serif;line-height:1.7;min-height:100vh}
a{color:#a78bfa;text-decoration:none}
a:hover{text-decoration:underline}
.static-root{max-width:720px;margin:0 auto;padding:40px 24px 80px;min-height:100vh;display:flex;flex-direction:column}
.button-back{display:inline-block;margin-bottom:24px;color:#a78bfa;font-size:.95rem}
.button-back:hover{text-decoration:underline}
.content-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:32px}
.content-card h1{font-family:'Crimson Pro',Georgia,serif;color:#fff;font-size:2rem;margin-bottom:.5rem}
.content-card h2{color:#a78bfa;font-size:1.3rem;margin-top:2rem;margin-bottom:.75rem}
.content-card h2:first-of-type{margin-top:0}
.content-card p,.content-card li{color:#ccc;margin-bottom:.75rem}
.content-card ul{padding-left:1.5rem;margin-bottom:1rem}
.content-card li{margin-bottom:.4rem}
.content-card strong{color:#e0e0e0}
.content-card .meta{color:#999;font-size:.875rem;margin-bottom:1rem}
.content-card .last-updated{color:#888;font-size:.85rem;margin-top:2rem}
.proj-list{list-style:none;padding:0}
.proj-list li{padding:.6rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.proj-list li:last-child{border-bottom:none}
.proj-list .proj-title{font-size:1.1rem;font-weight:600;color:#fff}
.proj-list .proj-meta{font-size:.85rem;color:#999}
.static-footer{margin-top:auto;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.08);font-size:.875rem;color:#888;text-align:center;margin-top:2rem}
.static-footer a{margin:0 .5rem}
`;

// ── Build static HTML ──
function pageHtml(title, description, ogImage, jsonld, bodyHtml, canonical) {
  const ogTitle = e(title);
  const ogDesc = e(truncate(description, 200));
  const ogImg = ogImage || `${SITE_URL}/android-chrome-512x512.png`;
  const canon = canonical || SITE_URL;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${e(title)}</title>
<meta name="description" content="${e(truncate(description))}" />
<meta property="og:title" content="${ogTitle}" />
<meta property="og:description" content="${ogDesc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${e(canon)}" />
<meta property="og:image" content="${e(ogImg)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${ogTitle}" />
<meta name="twitter:description" content="${ogDesc}" />
<meta name="twitter:image" content="${e(ogImg)}" />
<meta name="darkreader" content="no-darken" />
<meta name="darkreader-lock" />
<link rel="canonical" href="${e(canon)}" />
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
<link rel="stylesheet" href="/assets/index-CN8VNxnb.css" />
</head>
<body>
<div id="root">
<div class="static-root">
${bodyHtml}
</div>
</div>
<script type="module" crossorigin src="/assets/index-BtQkfkz5.js"></script>
<script>(function(){var r=document.getElementById('root');if(r){r.innerHTML='<div style=\"display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:1.5rem;background:#141414;color:#fff\">Loading...</div>';}})();</script>
<noscript><style>.static-root{display:block!important}</style></noscript>
<style>${FALLBACK_CSS}</style>
</body>
</html>`;
}

function writePage(route, html) {
  const filePath = resolve(DIST, route.slice(1), 'index.html');
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

function siteUrl(path) {
  return `${SITE_URL}${path}`;
}

// ── JSON-LD helpers ──
function websiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Null Comma',
    url: SITE_URL,
    description: 'Games, prototypes & dev insights by Christopher Ravailhe.',
    author: { '@type': 'Person', name: 'Christopher Ravailhe' },
  };
}

function personLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Christopher Ravailhe',
    description: 'Senior C# Developer and QA Test Automation specialist with over 9 years of experience in Unity. 25+ games shipped across PC, console, and mobile.',
    url: SITE_URL,
    sameAs: [
      'https://github.com/Chrisdbhr',
      'https://www.linkedin.com/company/105116562',
      'https://www.youtube.com/@chrisjogos',
    ],
  };
}

function projectLD(project, title, description, imageUrl) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': project.project_type === 'game' ? 'VideoGame' : 'SoftwareApplication',
    name: title,
    description: truncate(description, 300),
    url: siteUrl(`/project/${project.id}`),
    author: { '@type': 'Person', name: 'Christopher Ravailhe' },
    applicationCategory: project.project_type === 'game' ? 'Game' : 'SoftwareApplication',
  };
  if (imageUrl) ld.image = imageUrl;
  if (project.engine) ld.applicationSubCategory = project.engine;
  if (project.release_date) ld.datePublished = project.release_date;
  if (project.steam_id) ld.sameAs = `https://store.steampowered.com/app/${project.steam_id}`;
  return ld;
}

function blogPostLD(post, title, description, imageUrl, date) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: truncate(description, 300),
    url: siteUrl(`/blog/${post.id}`),
    author: { '@type': 'Person', name: 'Christopher Ravailhe' },
    publisher: { '@type': 'Organization', name: 'Null Comma' },
  };
  if (imageUrl) ld.image = imageUrl;
  if (date) ld.datePublished = date;
  return ld;
}

// ── Clean markdown from text for display ──
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/[*\[\]()]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Site footer shared across all pages ──
function siteFooter() {
  return `<div class="static-footer">
© Null Comma ·
<a href="/">Home</a> ·
<a href="/about">About</a> ·
<a href="/blog">Blog</a> ·
<a href="/privacy">Privacy</a> ·
<a href="/terms">Terms</a>
</div>`;
}

// ── Fallback body for static routes ──
function homeBody(projects, posts) {
  const projLines = projects.map(p => {
    const t = prefTranslation(p.translations);
    const name = e(t.title || p.id);
    const meta = [p.project_type, p.engine].filter(Boolean).join(' · ');
    return `<li>
<a href="/project/${e(p.id)}" class="proj-title">${name}</a>
<div class="proj-meta">${e(meta)}</div>
</li>`;
  }).join('\n');

  const postLines = posts.slice(0, 4).map(p => {
    const date = p.date_published ? new Date(p.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    return `<li><a href="/blog/${e(p.id)}">${e(p.title)}</a>${date ? ` <span class="proj-meta">— ${date}</span>` : ''}</li>`;
  }).join('\n');

  return `<div class="content-card">
<h1>Null Comma</h1>
<p>Games, prototypes & dev insights by <strong>Christopher Ravailhe</strong>.</p>
<p>Senior C# Developer and QA Test Automation specialist. 25+ games shipped across PC, console, and mobile.</p>

<h2>Games &amp; Projects</h2>
<ul class="proj-list">
${projLines}
</ul>

<h2>Latest Blog Posts</h2>
<ul>
${postLines}
</ul>

<p><a href="/blog">All posts →</a></p>
</div>

${siteFooter()}`;
}

function aboutBody() {
  return `<div class="content-card">
<h1>About Null Comma</h1>
<p><strong>Christopher Ravailhe</strong> is a Senior C# Developer and QA Test Automation specialist with over 9 years of experience in Unity. He has shipped 25+ games across PC, console, and mobile platforms.</p>
<p>Null Comma serves as a hub for his games, prototypes, and technical experiments. The blog section features devlogs, tutorials, and game development insights.</p>

<h2>Links</h2>
<ul>
<li><a href="https://github.com/Chrisdbhr">GitHub</a></li>
<li><a href="https://store.steampowered.com/curator/46087468">Steam Curator</a></li>
<li><a href="https://www.youtube.com/@chrisjogos">YouTube (@chrisjogos)</a></li>
<li><a href="https://discord.nullcomma.com">Discord</a></li>
<li><a href="https://www.linkedin.com/company/105116562">LinkedIn</a></li>
</ul>
</div>

${siteFooter()}`;
}

function blogListBody(posts) {
  const postLines = posts.map(p => {
    const date = p.date_published ? new Date(p.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    return `<li><a href="/blog/${e(p.id)}">${e(p.title)}</a>${date ? ` <span class="proj-meta">— ${date}</span>` : ''}</li>`;
  }).join('\n');

  return `<div class="content-card">
<a href="/" class="button-back">← Home</a>
<h1>Blog</h1>
<p>Devlogs, tutorials, and game development insights by Christopher Ravailhe.</p>

<h2>All Posts</h2>
<ul>
${postLines}
</ul>
</div>

${siteFooter()}`;
}

function staticBody(title) {
  return `<div class="content-card">
<a href="/" class="button-back">← Back to nullcomma.com</a>
<h1>${e(title)}</h1>
</div>
${siteFooter()}`;
}

function projectBody(project, t, imageUrl) {
  const title = t.title || 'Untitled Project';
  const synopsis = t.synopsis || '';
  const lines = [`<div class="content-card">`];
  lines.push(`<a href="/" class="button-back">← Back</a>`);
  lines.push(`<h1>${e(title)}</h1>`);
  if (imageUrl) {
    lines.push(`<p><img src="${e(imageUrl)}?width=720&quality=60" alt="${e(title)}" style="max-width:100%;border-radius:8px" /></p>`);
  }
  if (synopsis) {
    lines.push(`<p>${e(cleanText(synopsis))}</p>`);
  }
  lines.push(`<ul>`);
  if (project.engine) lines.push(`<li><strong>Engine:</strong> ${e(project.engine)}</li>`);
  if (project.release_date) lines.push(`<li><strong>Release Date:</strong> ${e(project.release_date)}</li>`);
  if (project.project_type) lines.push(`<li><strong>Type:</strong> ${e(project.project_type)}</li>`);
  if (project.steam_id) lines.push(`<li><a href="https://store.steampowered.com/app/${e(project.steam_id)}">View on Steam</a></li>`);
  lines.push(`</ul>`);
  lines.push(`</div>`);
  lines.push(siteFooter());
  return lines.join('\n');
}

function blogBody(post, imageUrl) {
  const title = post.title || 'Untitled Post';
  const lines = [`<div class="content-card">`];
  lines.push(`<a href="/" class="button-back">← Back</a>`);
  lines.push(`<h1>${e(title)}</h1>`);
  if (imageUrl) {
    lines.push(`<p><img src="${e(imageUrl)}?width=720&quality=60" alt="${e(title)}" style="max-width:100%;border-radius:8px" /></p>`);
  }
  lines.push(`<div class="meta">${post.date_published ? `Published: ${e(post.date_published)}` : ''}</div>`);
  if (post.content) {
    lines.push(`<p>${e(truncate(cleanText(post.content), 800))}</p>`);
  }
  lines.push(`</div>`);
  lines.push(`<div style="margin:1rem 0"><a href="/blog" style="color:#a78bfa">← Back to Blog</a></div>`);
  lines.push(siteFooter());
  return lines.join('\n');
}

// ── Sitemap generation ──
function generateSitemap(routes) {
  const today = new Date().toISOString().split('T')[0];
  const urls = routes.map(r => {
    const priority = r.priority || 0.5;
    const freq = r.changefreq || 'monthly';
    return `  <url>
    <loc>${e(siteUrl(r.path))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ── Main ──
async function main() {
  console.log('=== Static Page Generator ===');

  // Fetch CMS data
  console.log('Fetching projects...');
  let projects = [];
  try {
    const data = await fetchJson(`${CMS_URL}/items/projects?${PROJECT_FIELDS}&filter[status][_eq]=published`);
    projects = data.data || [];
    projects.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    console.log(`  ${projects.length} projects`);
  } catch (err) {
    console.warn('  Failed:', err.message);
  }

  console.log('Fetching blog posts...');
  let posts = [];
  try {
    const data = await fetchJson(`${CMS_URL}/items/blog_posts?${BLOG_FIELDS}&filter[status][_eq]=published`);
    posts = data.data || [];
    console.log(`  ${posts.length} posts`);
  } catch (err) {
    console.warn('  Failed:', err.message);
  }

  // Read Vite-built index.html for asset references
  console.log('Reading template...');
  const template = readFileSync(resolve(DIST, 'index.html'), 'utf-8');

  // Extract hashed asset references from the built template
  const jsMatch = template.match(/<script[^>]+src="([^"]+\.js)"/);
  const cssMatch = template.match(/<link[^>]+href="([^"]+\.css)"/);
  const jsSrc = jsMatch ? jsMatch[1] : '/assets/index.js';
  const cssHref = cssMatch ? cssMatch[1] : '/assets/index.css';

  const sitemapRoutes = [];
  const ROUTES = [];

  // ── Home ──
  ROUTES.push({
    path: '/',
    html: pageHtml(
      'Null Comma — Games, Prototypes & Dev Insights',
      'Discover indie games, prototypes, and dev insights by Christopher Ravailhe. Unity, C#, and game development experiments.',
      `${SITE_URL}/android-chrome-512x512.png`,
      [websiteLD(), personLD()],
      homeBody(projects, posts),
      siteUrl('/'),
    ),
    priority: 1.0,
    changefreq: 'weekly',
  });

  // ── About ──
  ROUTES.push({
    path: '/about',
    html: pageHtml(
      'About — Null Comma',
      'Learn about Christopher Ravailhe, a Senior C# Developer with 9+ years of Unity experience and 25+ shipped games.',
      null,
      personLD(),
      aboutBody(),
      siteUrl('/about'),
    ),
    priority: 0.8,
    changefreq: 'monthly',
  });

  // ── Blog list ──
  ROUTES.push({
    path: '/blog',
    html: pageHtml(
      'Blog — Null Comma',
      'Devlogs, tutorials, and game development insights by Christopher Ravailhe.',
      null,
      websiteLD(),
      blogListBody(posts),
      siteUrl('/blog'),
    ),
    priority: 0.9,
    changefreq: 'weekly',
  });

  // ── Privacy / Terms ──
  for (const { path, title } of [
    { path: '/privacy', title: 'Privacy Policy' },
    { path: '/terms', title: 'Terms of Service' },
  ]) {
    ROUTES.push({
      path,
      html: pageHtml(
        `${title} — Null Comma`,
        `${title} for Null Comma.`,
        null,
        null,
        staticBody(title),
        siteUrl(path),
      ),
      priority: 0.5,
      changefreq: 'monthly',
    });
  }

  // ── Projects ──
  for (const project of projects) {
    const t = prefTranslation(project.translations);
    const title = t.title || 'Untitled Project';
    const description = t.synopsis || `${title} — Null Comma`;
    const imageUrl = assetUrl(project.card_image?.id);
    const ld = projectLD(project, title, description, imageUrl);

    ROUTES.push({
      path: `/project/${project.id}`,
      html: pageHtml(
        `${title} — Null Comma`,
        description,
        imageUrl,
        ld,
        projectBody(project, t, imageUrl),
        siteUrl(`/project/${project.id}`),
      ),
      priority: 0.7,
      changefreq: 'monthly',
    });
  }

  // ── Blog posts ──
  for (const post of posts) {
    const title = post.title || 'Untitled Post';
    const description = post.content ? truncate(post.content, 200) : `${title} — Null Comma`;
    const imageUrl = assetUrl(post.cover_image?.id);
    const ld = blogPostLD(post, title, description, imageUrl, post.date_published);

    ROUTES.push({
      path: `/blog/${post.id}`,
      html: pageHtml(
        `${title} — Null Comma`,
        description,
        imageUrl,
        ld,
        blogBody(post, imageUrl),
        siteUrl(`/blog/${post.id}`),
      ),
      priority: 0.7,
      changefreq: 'monthly',
    });
  }

  // Write all pages
  console.log(`Writing ${ROUTES.length} static pages...`);
  let written = 0;
  for (const route of ROUTES) {
    try {
      writePage(route.path, route.html);
      written++;
    } catch (err) {
      console.error(`  Failed to write ${route.path}: ${err.message}`);
    }
    sitemapRoutes.push({ path: route.path, priority: route.priority, changefreq: route.changefreq });
  }
  console.log(`  ${written}/${ROUTES.length} written`);

  // ── Sitemap ──
  console.log('Generating sitemap...');
  writeFileSync(resolve(DIST, 'sitemap.xml'), generateSitemap(sitemapRoutes));

  // ── Robots.txt ──
  console.log('Writing robots.txt...');
  writeFileSync(resolve(DIST, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`);

  // ── 404 fallback ──
  console.log('Writing 404.html...');
  writeFileSync(resolve(DIST, '404.html'), template);

  console.log('=== Done ===');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
