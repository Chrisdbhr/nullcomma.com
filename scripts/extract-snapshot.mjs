#!/usr/bin/env node
/**
 * One-off: rebuild scripts/data/cms-snapshot.json from the published static HTML
 * (used when the CMS at cms.nullcomma.com is unreachable during builds).
 *
 * Usage: node scripts/extract-snapshot.mjs
 * Fetches the live site, parses each project/blog page and writes the snapshot.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { JSDOM } from 'jsdom';

const SITE = 'https://nullcomma.com';
const SNAPSHOT_PATH = resolve('scripts/data/cms-snapshot.json');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getHtml(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function assetIdFromUrl(url) {
  if (!url) return null;
  const m = url.match(/\/assets\/([0-9a-f-]{36})/i);
  return m ? m[1] : null;
}

async function fetchProject(id) {
  const html = await getHtml(`${SITE}/project/${id}/`);
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const card = doc.querySelector('.content-card');
  if (!card) {
    console.warn(`  [${id}] no content-card found`);
    return null;
  }

  const titleEl = card.querySelector('h1');
  const title = titleEl ? titleEl.textContent.trim() : id;

  const li = (label) => {
    const el = [...card.querySelectorAll('li')].find(l => l.textContent.trim().startsWith(`${label}:`));
    return el ? el.textContent.replace(`${label}:`, '').trim() : null;
  };

  const engine = li('Engine');
  const release_date = li('Release Date');
  const project_type = li('Type');

  const steamLink = [...card.querySelectorAll('a')].find(a => a.href.includes('store.steampowered.com/app/'));
  const steam_id = steamLink ? steamLink.href.match(/\/app\/(\d+)/)?.[1] || null : null;

  const ogImage = doc.querySelector('meta[property="og:image"]');
  const cardImageId = assetIdFromUrl(ogImage?.content || '');

  const screenshots = [];
  const steamScreenshots = [];
  card.querySelectorAll('a img').forEach(img => {
    const src = img.getAttribute('src') || '';
    const id = assetIdFromUrl(src);
    if (id) screenshots.push({ directus_files_id: { id } });
    else if (/^https?:/.test(src)) steamScreenshots.push(src);
  });

  const synopsisP = [...card.querySelectorAll('p')].find(p => {
    const t = p.textContent.trim();
    return t.length > 0 && !p.querySelector('img') && !p.querySelector('strong') && !p.querySelector('a');
  });
  const synopsis = synopsisP ? synopsisP.textContent.trim() : '';

  return {
    id,
    status: 'published',
    project_type,
    engine,
    release_date,
    steam_id,
    translations: [{ language: 'en', title, synopsis }],
    card_image: cardImageId ? { id: cardImageId } : null,
    screenshots,
    steam_screenshots: steamScreenshots,
    tags: [],
    genres: [],
    related_posts: [],
  };
}

async function fetchPost(id) {
  const html = await getHtml(`${SITE}/blog/${id}/`);
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const card = doc.querySelector('.content-card');
  if (!card) {
    console.warn(`  [${id}] no content-card found`);
    return null;
  }

  const title = (card.querySelector('h1')?.textContent || id).trim();

  const metaEl = card.querySelector('.meta');
  const date_published = metaEl
    ? (metaEl.textContent.match(/Published:\s*(.+)/)?.[1] || '').trim()
    : null;

  let content = '';
  if (metaEl) {
    let node = metaEl.nextSibling;
    while (node) {
      if (node.nodeType === 1) content += node.outerHTML;
      else if (node.nodeType === 3 && node.textContent.trim()) content += node.textContent;
      node = node.nextSibling;
    }
  }

  const ogImage = doc.querySelector('meta[property="og:image"]');
  const coverImageId = assetIdFromUrl(ogImage?.content || '');

  return {
    id,
    status: 'published',
    title,
    date_published,
    content,
    cover_image: coverImageId ? { id: coverImageId } : null,
    tags: [],
    related_projects: [],
  };
}

async function main() {
  console.log('=== Snapshot Extractor ===');

  console.log(`Fetching ${SITE}/ ...`);
  const homeHtml = await getHtml(`${SITE}/`);
  const dom = new JSDOM(homeHtml);
  const doc = dom.window.document;

  const projectLinks = [...new Set([...doc.querySelectorAll('a[href^="/project/"]')].map(a => a.getAttribute('href').replace(/\/$/, '')))];
  const postLinks = [...new Set([...doc.querySelectorAll('a[href^="/blog/"]')].map(a => a.getAttribute('href').replace(/\/$/, '')))];

  console.log(`Found ${projectLinks.length} projects, ${postLinks.length} posts`);

  const projects = [];
  for (const link of projectLinks) {
    const id = link.split('/').pop();
    process.stdout.write(`  fetching project ${id}... `);
    try {
      const p = await fetchProject(id);
      if (p) { projects.push(p); console.log('ok'); }
      else console.log('SKIPPED');
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
    await sleep(150);
  }

  const posts = [];
  for (const link of postLinks) {
    const id = link.split('/').pop();
    process.stdout.write(`  fetching post ${id}... `);
    try {
      const p = await fetchPost(id);
      if (p) { posts.push(p); console.log('ok'); }
      else console.log('SKIPPED');
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
    await sleep(150);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    projects,
    posts,
  };

  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`\nWrote ${projects.length} projects + ${posts.length} posts -> ${SNAPSHOT_PATH}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
