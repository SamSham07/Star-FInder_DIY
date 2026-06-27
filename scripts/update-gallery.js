#!/usr/bin/env node
/*
 * update-gallery.js
 * -----------------
 * Scans assets/gallery/<category>/ and rewrites the GALLERY_SETS list in
 * src/sections.jsx automatically, so you never have to hand-edit the list.
 *
 * Workflow:
 *   1. Drop a photo into the matching folder (sky / building / diy / family /
 *      observation / events).
 *   2. Run this script (or double-click update-gallery.bat).
 *   3. Refresh the site (Ctrl+F5).
 *
 * It also bumps the ?v= cache number on sections.jsx in the HTML so updated
 * galleries show up for visitors after you deploy.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'assets', 'gallery');
const SECTIONS = path.join(ROOT, 'src', 'sections.jsx');
const HTML = path.join(ROOT, 'StarFinder DIY Telescope.html');

// Order here MUST match the tab order the gallery expects (see the switch()
// in GallerySection and the `tabs` arrays in i18n.jsx).
const CATEGORIES = ['sky', 'building', 'diy', 'events', 'family', 'observation'];

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const STD_NAME_RE = /^\d{3}\.(jpe?g|png|webp|gif|avif)$/i;

// Natural sort so 2 comes before 10, and numbered files sort before named ones.
function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function listImages(cat) {
  const dir = path.join(GALLERY_DIR, cat);
  if (!fs.existsSync(dir)) {
    console.warn(`  ! folder missing: assets/gallery/${cat}  (left empty)`);
    return [];
  }
  const files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f)).sort(naturalCompare);
  const odd = files.filter((f) => !STD_NAME_RE.test(f));
  if (odd.length) {
    console.warn(`    note: non-standard name(s) in ${cat}: ${odd.join(', ')}`);
  }
  return files.map((f) => `assets/gallery/${cat}/${f}`);
}

function buildBlock(sets) {
  const lines = CATEGORIES.map((cat, i) => {
    const arr = sets[cat].map((p) => `'${p}'`).join(', ');
    const comma = i < CATEGORIES.length - 1 ? ',' : '';
    return `  ${cat}: [${arr}]${comma}`;
  });
  return `const GALLERY_SETS = {\n${lines.join('\n')}\n};`;
}

function bumpCacheVersion() {
  if (!fs.existsSync(HTML)) return;
  let html = fs.readFileSync(HTML, 'utf8');
  let bumped = false;
  html = html.replace(/(src\/sections\.jsx\?v=)(\d+)/g, (m, prefix, n) => {
    bumped = true;
    return prefix + (parseInt(n, 10) + 1);
  });
  if (bumped) {
    fs.writeFileSync(HTML, html, 'utf8');
    console.log('  Bumped sections.jsx cache version in the HTML.');
  }
}

function main() {
  console.log('Scanning assets/gallery/ ...');
  const sets = {};
  let total = 0;
  for (const cat of CATEGORIES) {
    const imgs = listImages(cat);
    sets[cat] = imgs;
    total += imgs.length;
    console.log(`  ${cat.padEnd(12)} ${String(imgs.length).padStart(3)} photo(s)`);
  }

  // Flag any folder that exists but isn't wired into the tabs yet.
  if (fs.existsSync(GALLERY_DIR)) {
    for (const entry of fs.readdirSync(GALLERY_DIR)) {
      const full = path.join(GALLERY_DIR, entry);
      if (fs.statSync(full).isDirectory() && !CATEGORIES.includes(entry)) {
        console.warn(`  ! unknown folder ignored: assets/gallery/${entry}`);
        console.warn('    (add it to CATEGORIES here + the tab list in i18n.jsx to use it)');
      }
    }
  }

  const src = fs.readFileSync(SECTIONS, 'utf8');
  const re = /const GALLERY_SETS = \{[\s\S]*?\n\};/;
  if (!re.test(src)) {
    console.error('\nERROR: could not find the GALLERY_SETS block in src/sections.jsx. No changes made.');
    process.exit(1);
  }
  const updated = src.replace(re, buildBlock(sets));
  if (updated === src) {
    console.log(`\nAlready up to date - ${total} photos, nothing to change.`);
    return;
  }
  fs.writeFileSync(SECTIONS, updated, 'utf8');
  bumpCacheVersion();
  console.log(`\nDone - ${total} photos across ${CATEGORIES.length} categories written to src/sections.jsx.`);
  console.log('Refresh the site with Ctrl+F5 to see the changes.');
}

main();
