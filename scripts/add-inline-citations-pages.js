#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Add inline body citations for GEO/AEO optimization on selected Strapi pages.
 *
 * Usage:
 *   node scripts/add-inline-citations-pages.js --dry-run
 *   STRAPI_TOKEN=... node scripts/add-inline-citations-pages.js --apply
 */

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://peaceful-insight-production.up.railway.app';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

const APPLY = process.argv.includes('--apply');
const DRY_RUN = process.argv.includes('--dry-run') || !APPLY;

const TARGET_SLUGS = ['iso-16175', 'iso-14001', 'bio'];

function withAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN && STRAPI_TOKEN !== '__SET_ME__') {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

async function fetchPageBySlug(slug) {
  const query = new URLSearchParams();
  query.set('filters[slug][$eq]', slug);
  query.set('populate[0]', 'layout');
  const url = `${STRAPI_URL}/api/pages?${query.toString()}`;

  const response = await fetch(url, { headers: withAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (!json?.data?.length) {
    throw new Error(`No page found for slug "${slug}"`);
  }
  return json.data[0];
}

function replaceOnce(content, from, to, label, changes) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) {
    throw new Error(`Expected text not found for ${label}`);
  }
  changes.push(label);
  return content.replace(from, to);
}

function patchIso16175(textBlock, changes) {
  let content = textBlock.content || '';
  content = replaceOnce(
    content,
    'In Nederland is deze norm vastgesteld als NEN‑ISO 16175‑1:2020.',
    'In Nederland is deze norm vastgesteld als **NEN‑ISO 16175‑1:2020** ([bron: NEN](https://www.nen.nl/en/nen-iso-16175-1-2020-nl-287549)), gepubliceerd in **2020** als Nederlandse implementatie van de internationale standaard.',
    'iso-16175: NEN inline bron',
    changes
  );
  content = replaceOnce(
    content,
    'ISO 16175 sluit inhoudelijk aan op ISO 15489, de internationale standaard voor records management.',
    'ISO 16175 sluit inhoudelijk aan op **ISO 15489** ([bron: ISO](https://www.iso.org/standard/62542.html)), de internationale standaard voor records management.',
    'iso-16175: ISO 15489 inline bron',
    changes
  );
  return content;
}

function patchIso14001(textBlock, changes) {
  let content = textBlock.content || '';
  content = replaceOnce(
    content,
    'meer dan **300.410 organisaties** (ISO Survey 2023), wat ISO 14001 de op één na meest gebruikte ISO managementsysteem norm maakt na ISO 9001.',
    'meer dan **300.410 organisaties** ([bron: ISO Survey 2023](https://www.iso.org/the-iso-survey.html)), wat ISO 14001 de op één na meest gebruikte ISO managementsysteem norm maakt na ISO 9001.',
    'iso-14001: ISO Survey inline bron',
    changes
  );
  return content;
}

function patchBio(textBlock, changes) {
  const content = textBlock.content || '';
  const paragraph =
    'De BIO is verplicht voor **alle 375 overheidsorganisaties** in Nederland: **342 gemeenten**, **12 provincies**, **21 waterschappen** en alle rijksorganisaties. Sinds **23 september 2025** geldt de herziene **BIO2** ([bron: Staatscourant 2020 nr. 7857](https://zoek.officielebekendmakingen.nl/stcrt-2020-7857.html)), gebaseerd op **93 controls** uit ISO 27002:2022.';

  if (content.includes(paragraph)) return content;
  changes.push('bio: openingsparagraaf met inline bron');
  return `${paragraph}\n\n${content}`;
}

function updateLayoutForSlug(slug, layout) {
  const changes = [];
  const updatedLayout = layout.map((component) => ({ ...component }));

  if (slug === 'iso-16175') {
    const block = updatedLayout.find(
      (c) => c.__component === 'page-blocks.text-block' && (c.content || '').includes('## Wat is ISO 16175?')
    );
    if (!block) throw new Error('ISO 16175 text block "Wat is ISO 16175?" not found');
    block.content = patchIso16175(block, changes);
  }

  if (slug === 'iso-14001') {
    const block = updatedLayout.find(
      (c) => c.__component === 'page-blocks.text-block' && (c.content || '').includes('## Wat is ISO 14001?')
    );
    if (!block) throw new Error('ISO 14001 text block "Wat is ISO 14001?" not found');
    block.content = patchIso14001(block, changes);
  }

  if (slug === 'bio') {
    const block = updatedLayout.find(
      (c) => c.__component === 'page-blocks.text-block' && (c.content || '').includes('## Wat is de BIO?')
    );
    if (!block) throw new Error('BIO text block "Wat is de BIO?" not found');
    block.content = patchBio(block, changes);
  }

  return { updatedLayout, changes };
}

async function updatePageLayout(documentId, layout) {
  const url = `${STRAPI_URL}/api/pages/${documentId}`;
  const sanitizedLayout = removeIds(layout);
  const response = await fetch(url, {
    method: 'PUT',
    headers: withAuthHeaders(),
    body: JSON.stringify({ data: { layout: sanitizedLayout } }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update ${documentId}: ${response.status} ${response.statusText} - ${text}`);
  }
  return response.json();
}

function removeIds(value) {
  if (Array.isArray(value)) {
    return value.map(removeIds);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === 'id') continue;
      out[key] = removeIds(val);
    }
    return out;
  }
  return value;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'apply'}`);
  console.log(`Strapi: ${STRAPI_URL}`);

  if (!DRY_RUN && (!STRAPI_TOKEN || STRAPI_TOKEN === '__SET_ME__')) {
    throw new Error('STRAPI_TOKEN is required for --apply');
  }

  let totalChanges = 0;
  for (const slug of TARGET_SLUGS) {
    const page = await fetchPageBySlug(slug);
    const { updatedLayout, changes } = updateLayoutForSlug(slug, page.layout || []);

    if (!changes.length) {
      console.log(`- ${slug}: no content changes needed`);
      continue;
    }

    totalChanges += changes.length;
    console.log(`- ${slug}: ${changes.length} change(s)`);
    for (const item of changes) console.log(`  * ${item}`);

    if (!DRY_RUN) {
      await updatePageLayout(page.documentId, updatedLayout);
      console.log(`  -> updated page documentId=${page.documentId}`);
    }
  }

  console.log(`Done. Total edits: ${totalChanges}`);
  if (DRY_RUN) {
    console.log('No remote writes performed (dry-run).');
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
