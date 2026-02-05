/*
 * Governance verification
 *
 * This script enforces that core pages are:
 * - Explicitly routed (no generic fallback)
 * - Rendered via fixed templates (hub/detail/blog)
 * - Not using Strapi page-builder layout for core structure
 */

const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();

const CORE_HUB_PAGES = [
  'app/iso-certificering/page.tsx',
  'app/informatiebeveiliging/page.tsx',
  'app/avg-wetgeving/page.tsx',
  'app/waarom-maasiso/page.tsx',
];

const CORE_DETAIL_PAGES = [
  'app/iso-certificering/iso-9001/page.tsx',
  'app/iso-certificering/iso-14001/page.tsx',
  'app/iso-certificering/iso-45001/page.tsx',
  'app/iso-certificering/iso-16175/page.tsx',
  'app/informatiebeveiliging/iso-27001/page.tsx',
  'app/informatiebeveiliging/bio/page.tsx',
  'app/avg-wetgeving/avg/page.tsx',
];

const CORE_DETAIL_IDS = [
  'iso-9001',
  'iso-14001',
  'iso-45001',
  'iso-16175',
  'iso-27001',
  'bio',
  'avg',
];

function filePath(rel) {
  return path.join(baseDir, rel);
}

function exists(rel) {
  return fs.existsSync(filePath(rel));
}

function read(rel) {
  return fs.readFileSync(filePath(rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function checkFileContains(rel, needles) {
  const content = read(rel);
  for (const needle of needles) {
    assert(
      content.includes(needle),
      `${rel} must include "${needle}"`
    );
  }
}

function checkFileNotContains(rel, needles) {
  const content = read(rel);
  for (const needle of needles) {
    assert(
      !content.includes(needle),
      `${rel} must NOT include "${needle}"`
    );
  }
}

function run() {
  console.log('=== Page Governance Verification ===');

  for (const rel of CORE_HUB_PAGES) {
    assert(exists(rel), `Missing core hub route file: ${rel}`);
    checkFileContains(rel, ['CoreHubPageTemplate']);
  }

  for (const rel of CORE_DETAIL_PAGES) {
    assert(exists(rel), `Missing core detail route file: ${rel}`);
    checkFileContains(rel, ['CoreDetailPageTemplate']);
    checkFileNotContains(rel, ['AuthorityPageContent', 'ComponentRegistry']);
  }

  // Ensure detail pages cannot exist as top-level routes.
  for (const id of CORE_DETAIL_IDS) {
    const rel = `app/${id}/page.tsx`;
    assert(!exists(rel), `Disallowed top-level detail route exists: ${rel}`);
  }

  // Ensure generic /[slug] fallback is locked down.
  const dynamicRoute = 'app/[slug]/page.tsx';
  assert(exists(dynamicRoute), `Missing dynamic route file: ${dynamicRoute}`);
  checkFileContains(dynamicRoute, ['ALLOWED_CMS_PAGE_SLUGS', 'isReservedSingleSlug']);

  console.log('✅ Governance checks passed');
}

try {
  run();
} catch (err) {
  console.error('❌ Governance checks failed');
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

