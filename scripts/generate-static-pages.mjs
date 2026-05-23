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

// ── Inline fallback styles (dark theme, matches site aesthetic) ──
const FALLBACK_CSS = `
body{margin:0;background:#141414;color:#e0e0e0;font-family:Inter,system-ui,sans-serif;line-height:1.6}
.static-root{max-width:720px;margin:0 auto;padding:2rem 1.5rem;min-height:100vh;display:flex;flex-direction:column}
.static-root a{color:#a78bfa}
.static-root a:hover{color:#c4b5fd}
.static-root h1{font-family:'Crimson Pro',Georgia,serif;font-size:2rem;margin:0 0 .5rem;color:#fff}
.static-root h2{font-family:'Crimson Pro',Georgia,serif;font-size:1.4rem;margin:1.5rem 0 .5rem;color:#ddd}
.static-root h2:first-of-type{margin-top:1rem}
.static-root .meta{color:#999;font-size:.875rem;margin-bottom:1rem}
.static-root ul{padding-left:1.2rem}
.static-root li{margin-bottom:.4rem}
.static-root .static-footer{margin-top:auto;padding-top:1.5rem;border-top:1px solid #333;font-size:.875rem;color:#888;text-align:center}
.static-root .static-footer a{margin:0 .5rem}
.static-root .proj-list{list-style:none;padding:0}
.static-root .proj-list li{padding:.6rem 0;border-bottom:1px solid #222}
.static-root .proj-list li:last-child{border-bottom:none}
.static-root .proj-list .proj-title{font-size:1.1rem;font-weight:600;color:#fff}
.static-root .proj-list .proj-meta{font-size:.85rem;color:#999}
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
<script>(function(){var r=document.getElementById('root');if(r){r.innerHTML='<div style=\"display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:1.5rem;background:#141414;color:#fff\">Loading Portfolio...</div>';}})();</script>
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

  return `<h1>Null Comma</h1>
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

<div style="margin-top:1rem">
<a href="/blog" style="color:#a78bfa">All posts →</a>
</div>

${siteFooter()}`;
}

function aboutBody() {
  return `<h1>About Null Comma</h1>
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

${siteFooter()}`;
}

function blogListBody(posts) {
  const postLines = posts.map(p => {
    const date = p.date_published ? new Date(p.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    return `<li><a href="/blog/${e(p.id)}">${e(p.title)}</a>${date ? ` <span class="proj-meta">— ${date}</span>` : ''}</li>`;
  }).join('\n');

  return `<h1>Blog</h1>
<p>Devlogs, tutorials, and game development insights by Christopher Ravailhe.</p>

<h2>All Posts</h2>
<ul>
${postLines}
</ul>

${siteFooter()}`;
}

function privacyBody() {
  return `<div style="margin-bottom:1rem"><a href="/" style="color:#a78bfa">← Back to nullcomma.com</a></div>

<h1>Privacy Policy</h1>
<p style="color:#999;margin-bottom:1.5rem">This policy applies to all Null Comma products: this website, games, tools, applications, and any services or integrations provided under the Null Comma brand.</p>

<h2>Scope</h2>
<p>This Privacy Policy covers all digital products and services created and distributed by Null Comma, including but not limited to: the nullcomma.com website, downloadable games and prototypes, the Null Comma Launcher, web applications, browser extensions, and any future tools or applications released under this brand.</p>

<h2>LGPD Compliance</h2>
<p>Null Comma complies with the Brazilian General Data Protection Law (Lei Geral de Proteção de Dados — LGPD, Law No. 13.709/2018). All data processing activities described in this policy are conducted in accordance with LGPD principles, including purpose limitation, data minimization, transparency, and security. You have the right to access, correct, delete, or port any personal data we may process. For any data-related requests, contact us at <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a>.</p>

<h2>Data Collection</h2>
<p>Null Comma products are designed to minimize data collection. Most products do not collect, store, or share any personal data. However, some games and applications may use anonymous analytics for quality assurance and bug reporting purposes. This data is aggregated, does not identify individuals, and is used solely to improve product stability and user experience.</p>

<h2>Website</h2>
<p>The nullcomma.com website does not use cookies, tracking scripts, analytics services, or OAuth logins. No personal data is collected through browsing or interacting with the site. The contact form sends your message through <a href="https://formspree.io">Formspree</a>, which processes it privately. I do not retain, sell, or access your submitted data beyond responding to your message.</p>

<h2>Games and Applications</h2>
<p>Most games, tools, and applications created by Null Comma run locally on your device and do not transmit any data to external servers. Any data generated by these products (such as save files, preferences, or configuration) is stored exclusively on your local device.</p>
<p>Some products may include optional anonymous analytics for quality assurance and bug reporting. This analytics data is aggregated and does not contain personally identifiable information such as your name, email, or device identifiers. It is used solely to identify crashes, performance issues, and usage patterns that help improve the product. Analytics can typically be disabled in the application's settings.</p>

<h2>Authentication (OAuth)</h2>
<p>Some Null Comma applications may use OAuth or similar authentication methods to allow you to sign in using third-party accounts (such as Google, Steam, or other providers). When you authenticate via OAuth:</p>
<ul>
<li>Null Comma does not receive or store your password.</li>
<li>Only the minimum necessary profile information is accessed (such as your display name and email) as permitted by the provider.</li>
<li>Authentication tokens are stored securely on your device and can be revoked at any time through the provider's settings.</li>
<li>We do not share your authentication data with any third parties.</li>
</ul>
<p>Specific details about what data is collected through OAuth are provided within each application that uses authentication.</p>

<h2>Third-Party Services and Integrations</h2>
<p>Some Null Comma products may interact with third-party services:</p>
<p><strong>Steam:</strong> Games distributed on Steam may use the Steamworks SDK for features such as achievements, cloud saves, and leaderboards. These features are governed by Valve's privacy policy. Null Comma does not access or store any Steam user data.</p>
<p><strong>YouTube:</strong> This website embeds video trailers from YouTube. YouTube has its own privacy policy. This site is not affiliated with YouTube or Google.</p>
<p><strong>Formspree:</strong> The contact form on this website uses Formspree to deliver messages. Formspree processes your email privately.</p>
<p><strong>Directus CMS:</strong> This website uses Directus as a headless CMS to manage content. The CMS is self-hosted and does not collect visitor data.</p>
<p><strong>Analytics Providers:</strong> When anonymous analytics are used in games or applications, they may be processed through third-party analytics services.</p>

<h2>Children's Privacy</h2>
<p>Null Comma products do not knowingly collect any personal information from children under 13.</p>

<h2>Data Retention</h2>
<p>Any data stored locally by our products (save files, preferences, configuration) remains on your device and is under your control at all times. Anonymous analytics data is retained only as long as necessary for quality assurance purposes.</p>

<h2>Your Rights Under LGPD</h2>
<p>Under the Brazilian LGPD, you have the following rights regarding your personal data:</p>
<ul>
<li><strong>Access:</strong> Request confirmation of whether we process your data and access what is stored.</li>
<li><strong>Correction:</strong> Request correction of incomplete, inaccurate, or outdated data.</li>
<li><strong>Deletion:</strong> Request deletion of personal data processed with your consent.</li>
<li><strong>Portability:</strong> Request transfer of your data to another service provider.</li>
<li><strong>Revocation:</strong> Revoke consent for data processing at any time.</li>
</ul>
<p>To exercise any of these rights, contact us at <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a>.</p>

<h2>Changes to This Policy</h2>
<p>This Privacy Policy may be updated at any time. Changes will be reflected on this page with an updated "Last updated" date.</p>

<h2>Contact</h2>
<p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>

<p style="color:#999;font-size:.85rem;margin-top:2rem">Last updated: May 2026</p>

${siteFooter()}`;
}

function termsBody() {
  return `<div style="margin-bottom:1rem"><a href="/" style="color:#a78bfa">← Back to nullcomma.com</a></div>

<h1>Terms of Service</h1>
<p style="color:#999;margin-bottom:1.5rem">These terms apply to all Null Comma products: this website, games, tools, applications, and any services or integrations provided under the Null Comma brand.</p>

<h2>Scope</h2>
<p>These Terms of Service govern your use of all digital products and services created and distributed by Null Comma, including but not limited to: the nullcomma.com website, downloadable games and prototypes, the Null Comma Launcher, web applications, browser extensions, and any future tools or applications released under this brand.</p>

<h2>1. Content Ownership</h2>
<p>All games, screenshots, videos, text, code, designs, and other content created and distributed by Null Comma are the property of Christopher Ravailhe and their respective creators. Unauthorized reproduction, distribution, or commercial use is prohibited unless explicitly stated or licensed otherwise.</p>

<h2>2. Permitted Use</h2>
<p>You may browse, download, and use Null Comma products for personal, non-commercial purposes. Commercial use, redistribution, modification, reverse engineering, or incorporation into other products without written permission is not allowed.</p>

<h2>3. Third-Party Services</h2>
<p>Some Null Comma products may integrate with or embed content from third-party services. See the <a href="/privacy">Privacy Policy</a> for details on third-party data handling.</p>

<h2>4. Authentication</h2>
<p>Some Null Comma applications may offer sign-in through third-party OAuth providers. Null Comma does not store your password and only accesses the minimum profile information necessary for the application to function.</p>

<h2>5. Privacy & Data</h2>
<p>Null Comma products are designed to minimize data collection. See the <a href="/privacy">Privacy Policy</a> for full details, including LGPD compliance and your data rights.</p>

<h2>6. Software Distribution</h2>
<p>Null Comma games and applications are distributed through this website, Steam, itch.io, and other platforms. Downloads are provided at no cost unless otherwise stated.</p>

<h2>7. Limitation of Liability</h2>
<p>All Null Comma products are provided "as is" without warranties of any kind. The owner is not liable for any damages arising from the use of, or inability to use, any Null Comma product.</p>

<h2>8. Updates and Changes</h2>
<p>These terms may be updated at any time. Changes will be reflected on this page with an updated "Last updated" date.</p>

<h2>9. Contact</h2>
<p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>

<p style="color:#999;font-size:.85rem;margin-top:2rem">Last updated: May 2026</p>

${siteFooter()}`;
}

function projectBody(project, t, imageUrl) {
  const title = t.title || 'Untitled Project';
  const synopsis = t.synopsis || '';
  const lines = [`<h1>${e(title)}</h1>`];
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
  lines.push(siteFooter());
  return lines.join('\n');
}

function blogBody(post, imageUrl) {
  const title = post.title || 'Untitled Post';
  const lines = [`<h1>${e(title)}</h1>`];
  if (imageUrl) {
    lines.push(`<p><img src="${e(imageUrl)}?width=720&quality=60" alt="${e(title)}" style="max-width:100%;border-radius:8px" /></p>`);
  }
  lines.push(`<div class="meta">${post.date_published ? `Published: ${e(post.date_published)}` : ''}</div>`);
  if (post.content) {
    lines.push(`<p>${e(truncate(cleanText(post.content), 800))}</p>`);
  }
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

  // ── Privacy ──
  ROUTES.push({
    path: '/privacy',
    html: pageHtml(
      'Privacy Policy — Null Comma',
      'Privacy Policy for Null Comma. Covers LGPD compliance, data collection, third-party services, and your rights under Brazilian data protection law.',
      null,
      null,
      privacyBody(),
      siteUrl('/privacy'),
    ),
    priority: 0.5,
    changefreq: 'monthly',
  });

  // ── Terms ──
  ROUTES.push({
    path: '/terms',
    html: pageHtml(
      'Terms of Service — Null Comma',
      'Terms of Service for Null Comma products. Covers content ownership, permitted use, third-party services, and limitation of liability.',
      null,
      null,
      termsBody(),
      siteUrl('/terms'),
    ),
    priority: 0.5,
    changefreq: 'monthly',
  });

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
