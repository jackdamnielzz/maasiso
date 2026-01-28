/**
 * Test Related Posts Web Tool (API route)
 *
 * Verifies:
 * 1) Can list posts
 * 2) Can save relatedPosts
 * 3) Relations persist after save
 *
 * Usage:
 *   node scripts/test-related-posts-webtool.js --list
 *   node scripts/test-related-posts-webtool.js --source <documentId> --targets <docId1,docId2> [--base http://localhost:3000]
 *
 * Notes:
 * - Requires Next.js dev server running for /api/related-posts
 * - Requires DATABASE_URL in .env.local for write test
 */

const fetch = require('node-fetch');

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
};

const hasFlag = (name) => args.includes(name);

const BASE_URL = getArg('--base') || 'http://localhost:3000';
const SOURCE_DOCUMENT_ID = getArg('--source');
const TARGETS_RAW = getArg('--targets');
const TARGET_DOCUMENT_IDS = TARGETS_RAW ? TARGETS_RAW.split(',').map((s) => s.trim()).filter(Boolean) : [];

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response from ${url}: ${text}`);
  }
  if (!response.ok) {
    const message = data?.error || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return data;
}

async function listPosts() {
  const url = `${BASE_URL}/api/related-posts?action=list`;
  const data = await fetchJson(url);
  if (!data.success || !data.posts) {
    throw new Error(`List failed: ${data.error || 'Unknown error'}`);
  }
  console.log(`✅ List OK (${data.posts.length} posts, source=${data.source})`);
  console.log('Sample:');
  data.posts.slice(0, 5).forEach((post) => {
    console.log(`  - ${post.title} (${post.documentId}) /${post.slug}`);
  });
  return data.posts;
}

async function getRelated(documentId) {
  const url = `${BASE_URL}/api/related-posts?documentId=${encodeURIComponent(documentId)}`;
  const data = await fetchJson(url);
  if (!data.success) {
    throw new Error(`Fetch related failed: ${data.error || 'Unknown error'}`);
  }
  return data.relatedPosts || [];
}

async function saveRelated(documentId, relatedDocumentIds) {
  const url = `${BASE_URL}/api/related-posts`;
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, relatedDocumentIds })
  });
  if (!data.success) {
    throw new Error(`Save failed: ${data.error || 'Unknown error'}`);
  }
  return data;
}

async function run() {
  console.log('🔧 Related Posts Web Tool Test');
  console.log(`Base URL: ${BASE_URL}\n`);

  await listPosts();

  if (hasFlag('--list') || (!SOURCE_DOCUMENT_ID && TARGET_DOCUMENT_IDS.length === 0)) {
    console.log('ℹ️ List-only mode complete.');
    return;
  }

  if (!SOURCE_DOCUMENT_ID || TARGET_DOCUMENT_IDS.length === 0) {
    console.error('❌ Provide --source <documentId> and --targets <docId1,docId2> to test saving.');
    process.exit(1);
  }

  console.log(`\n1) Fetch current related for source: ${SOURCE_DOCUMENT_ID}`);
  const before = await getRelated(SOURCE_DOCUMENT_ID);
  console.log(`   Current related count: ${before.length}`);

  console.log(`\n2) Save related posts: ${TARGET_DOCUMENT_IDS.join(', ')}`);
  const saveResult = await saveRelated(SOURCE_DOCUMENT_ID, TARGET_DOCUMENT_IDS);
  console.log(`   Save OK: ${saveResult.message || 'Saved'}`);

  console.log('\n3) Re-fetch related to confirm persistence');
  const after = await getRelated(SOURCE_DOCUMENT_ID);
  const afterIds = new Set(after.map((p) => p.documentId));
  const missing = TARGET_DOCUMENT_IDS.filter((id) => !afterIds.has(id));

  if (missing.length > 0) {
    console.error(`❌ Persistence check failed. Missing: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Persistence OK. Related count now: ${after.length}`);
}

run().catch((error) => {
  console.error(`❌ Test failed: ${error.message}`);
  process.exit(1);
});
