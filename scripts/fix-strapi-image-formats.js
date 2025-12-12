/**
 * Fix or analyze Strapi image formats (especially Gemini_* images) via Strapi API.
 *
 * GOAL
 * ----
 * Some blog post images (e.g. Gemini_Generated_Image_*.png) have broken
 * format URLs (large_/small_/thumbnail_) that cause 400/404 when the frontend
 * requests:
 *
 *   /api/proxy/uploads/large_Gemini_Generated_Image_....png
 *
 * This script connects to Strapi via its REST API and:
 *   1. Fetches all uploaded files (from the Upload plugin)
 *   2. Detects broken format URLs (large/small/medium/thumbnail)
 *   3. Optionally "fixes" them by:
 *      - either pointing the broken format URL back to the original file URL, or
 *      - removing the broken format entry so the frontend falls back to the original
 *
 * IMPORTANT
 * ---------
 * - This script requires a **Full Access** Strapi API token.
 * - It is SAFE by default: it runs in DRY-RUN mode (only logs).
 * - To actually perform updates, run with:  node scripts/fix-strapi-image-formats.js --fix
 *
 * ENVIRONMENT VARIABLES
 * ---------------------
 * STRAPI_URL                 (e.g. https://peaceful-insight-production.up.railway.app)
 * NEXT_PUBLIC_BACKEND_URL    (fallback for STRAPI_URL)
 * STRAPI_TOKEN               (preferred API token)
 * NEXT_PUBLIC_STRAPI_TOKEN   (fallback token)
 *
 * USAGE
 * -----
 * 1. Ensure you have Node dependencies:
 *      npm install node-fetch@2 dotenv
 *
 * 2. Set env vars in .env or shell:
 *      STRAPI_URL=https://peaceful-insight-production.up.railway.app
 *      STRAPI_TOKEN=your_full_access_token_here
 *
 * 3. Run in DRY-RUN mode (only logs issues, no changes):
 *      node scripts/fix-strapi-image-formats.js
 *
 * 4. Run with automatic fixes:
 *      node scripts/fix-strapi-image-formats.js --fix
 *
 * The script will:
 *   - Print a summary of total images scanned
 *   - Show broken formats per file
 *   - In --fix mode: send PUT /api/upload/files/:id requests to Strapi
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env and .env.local,
// with .env.local taking precedence (this is where the Railway STRAPI_URL lives)
const dotenv = require('dotenv');
dotenv.config(); // .env
dotenv.config({ path: '.env.local' }); // overrides with .env.local if present

// ----------------------
// Configuration
// ----------------------

const STRAPI_URL =
  (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '') ||
  'https://peaceful-insight-production.up.railway.app';

const API_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;
const IS_FIX_MODE = process.argv.includes('--fix');

// Limit to Gemini images by default (safe). You can change this if needed.
const NAME_FILTER_REGEX = /Gemini_Generated_Image/i;

// Optional output report
const REPORT_FILE = path.join(__dirname, 'fix-strapi-image-formats-report.json');

// ----------------------
// Helpers
// ----------------------

if (!API_TOKEN) {
  console.error('❌ Error: STRAPI_TOKEN or NEXT_PUBLIC_STRAPI_TOKEN is not set.');
  process.exit(1);
}

console.log('🔗 Using Strapi URL:', STRAPI_URL);
console.log('🔑 Token present:', !!API_TOKEN);
console.log('🧪 Mode:', IS_FIX_MODE ? 'FIX (will update Strapi)' : 'DRY-RUN (no changes)');

async function strapiFetch(relativeUrl, options = {}) {
  const url = relativeUrl.startsWith('http')
    ? relativeUrl
    : `${STRAPI_URL}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let json = null;
  const text = await res.text().catch(() => null);

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    throw new Error(`Strapi request failed ${res.status} ${res.statusText} for ${url} - Body: ${text}`);
  }

  return json;
}

async function urlExists(urlPath) {
  try {
    const url = urlPath.startsWith('http')
      ? urlPath
      : `${STRAPI_URL}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;

    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });
    return res.ok;
  } catch (err) {
    console.error('  ⚠ Error checking URL existence:', urlPath, '-', err.message);
    return false;
  }
}

// ----------------------
// Core logic
// ----------------------

async function fetchAllUploadFiles() {
  console.log('\n📥 Fetching uploaded files from Strapi /api/upload/files ...');

  const allFiles = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const query = `pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=id:asc`;
    const relUrl = `/api/upload/files?${query}`;
    console.log(`  🔎 Page ${page} ...`);

    const json = await strapiFetch(relUrl);

    // Strapi upload plugin can return an array or an object with data/meta, depending on version.
    let files = [];
    if (Array.isArray(json)) {
      files = json;
    } else if (json && Array.isArray(json.data)) {
      files = json.data;
    } else {
      console.warn('  ⚠ Unexpected response structure from /upload/files:', json);
      break;
    }

    if (files.length === 0) break;

    allFiles.push(...files);
    if (files.length < pageSize) break;
    page++;
  }

  console.log(`\n📊 Found ${allFiles.length} upload file records in Strapi.`);
  return allFiles;
}

function getFormatsObject(file) {
  // In Strapi v4/v5, upload file has `formats` on the top level.
  // Some versions wrap attributes; we handle both.
  if (file.formats) return file.formats;
  if (file.attributes && file.attributes.formats) return file.attributes.formats;
  return null;
}

function setFormatsObject(file, newFormats) {
  if (file.formats !== undefined) {
    file.formats = newFormats;
    return { formats: newFormats };
  }
  if (file.attributes && file.attributes.formats !== undefined) {
    file.attributes.formats = newFormats;
    return { formats: newFormats };
  }
  return { formats: newFormats };
}

function getUrlField(file) {
  if (file.url) return file.url;
  if (file.attributes && file.attributes.url) return file.attributes.url;
  return null;
}

function getFileName(file) {
  return file.name || (file.attributes && file.attributes.name) || 'unknown';
}

function getFileId(file) {
  return file.id || (file.documentId ?? null);
}

async function analyzeAndFixFile(file) {
  const id = getFileId(file);
  const name = getFileName(file);
  const url = getUrlField(file);
  const formats = getFormatsObject(file);

  if (!url) {
    console.warn(`  ⚠ File id=${id} has no url field, skipping.`);
    return null;
  }

  if (NAME_FILTER_REGEX && !NAME_FILTER_REGEX.test(name) && !NAME_FILTER_REGEX.test(url)) {
    // Skip non‑Gemini images by default to reduce risk
    return null;
  }

  const result = {
    id,
    name,
    url,
    originalExists: false,
    formats: {},
    changed: false,
  };

  console.log(`\n🖼  Checking file id=${id} name="${name}" url="${url}"`);

  // 1. Check original URL
  result.originalExists = await urlExists(url);
  console.log(`    • Original (${url}) exists:`, result.originalExists);

  // 2. Check formats (large, medium, small, thumbnail)
  const formatsToCheck = ['large', 'medium', 'small', 'thumbnail'];
  const currentFormats = formats || {};

  for (const key of formatsToCheck) {
    const fmt = currentFormats[key];
    if (!fmt || !fmt.url) {
      result.formats[key] = { present: false, exists: false };
      continue;
    }

    const formatUrl = fmt.url;
    const exists = await urlExists(formatUrl);
    result.formats[key] = {
      present: true,
      url: formatUrl,
      exists,
    };

    console.log(`    • Format "${key}" (${formatUrl}) exists:`, exists);
  }

  // 3. Decide fixes (only if --fix and originalExists)
  if (IS_FIX_MODE && result.originalExists) {
    const newFormats = { ...currentFormats };
    let formatChanged = false;

    for (const key of formatsToCheck) {
      const fmtInfo = result.formats[key];
      if (!fmtInfo.present) continue;

      if (!fmtInfo.exists) {
        // Strategy: point broken format back to original URL
        console.log(`    🔧 Fixing format "${key}" → pointing to original URL (${url})`);
        newFormats[key] = {
          ...(newFormats[key] || {}),
          url,
        };
        formatChanged = true;
        result.formats[key].fixedToOriginal = true;
      }
    }

    if (formatChanged) {
      // Update file via Strapi API
      const payload = setFormatsObject({ ...file }, newFormats);

      console.log(`    📡 Updating Strapi upload file id=${id} ...`);
      try {
        await strapiFetch(`/api/upload/files/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        console.log('    ✅ Update successful.');
        result.changed = true;
      } catch (err) {
        console.error(`    ❌ Failed to update file id=${id}:`, err.message);
      }
    } else {
      console.log('    ℹ️ No format changes required for this file.');
    }
  } else if (!IS_FIX_MODE) {
    console.log('    ℹ️ DRY-RUN mode: no changes applied.');
  }

  return result;
}

async function main() {
  const files = await fetchAllUploadFiles();

  const report = {
    strapiUrl: STRAPI_URL,
    timestamp: new Date().toISOString(),
    fixMode: IS_FIX_MODE,
    nameFilter: NAME_FILTER_REGEX.toString(),
    filesAnalyzed: 0,
    filesChanged: 0,
    details: [],
  };

  for (const file of files) {
    const res = await analyzeAndFixFile(file);
    if (!res) continue;

    report.filesAnalyzed++;
    if (res.changed) report.filesChanged++;
    report.details.push(res);
  }

  console.log('\n📄 Writing report to:', REPORT_FILE);
  try {
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
    console.log('✅ Report written successfully.');
  } catch (err) {
    console.error('❌ Failed to write report file:', err.message);
  }

  console.log('\n✅ Done.');
  console.log(`   Files analyzed: ${report.filesAnalyzed}`);
  console.log(`   Files changed:  ${report.filesChanged}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});