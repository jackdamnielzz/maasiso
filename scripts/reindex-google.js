#!/usr/bin/env node
/**
 * Notify Google about updated pages via Search Console API
 * - Resubmit sitemap (triggers re-crawl)
 * - Check index status of updated URLs
 */

const { google } = require('googleapis');
const path = require('path');

const SITE_URL = 'sc-domain:maasiso.nl';
const SITEMAP_URL = 'https://www.maasiso.nl/sitemap.xml';
const KEY_FILE = path.join(__dirname, '..', 'secrets', 'google-service-account.json');

// All URLs we updated SEO for
const UPDATED_URLS = [
  // Service pages
  'https://www.maasiso.nl/iso-certificering/iso-9001/',
  'https://www.maasiso.nl/informatiebeveiliging/iso-27001/',
  'https://www.maasiso.nl/iso-certificering/iso-14001/',
  'https://www.maasiso.nl/iso-certificering/iso-45001/',
  'https://www.maasiso.nl/informatiebeveiliging/bio/',
  'https://www.maasiso.nl/avg-wetgeving/avg/',
  // Blog posts
  'https://www.maasiso.nl/kennis/blog/taak-risico-analyse-voorbeeld-excel/',
  'https://www.maasiso.nl/kennis/blog/interne-audit-iso-9001-voorbeeld/',
  'https://www.maasiso.nl/kennis/blog/directiebeoordeling-iso-9001-voorbeeld/',
  'https://www.maasiso.nl/kennis/blog/leveranciersbeoordeling-iso-9001/',
  'https://www.maasiso.nl/kennis/blog/beleidsverklaring-iso-9001/',
  'https://www.maasiso.nl/kennis/blog/context-van-de-organisatie-iso-9001/',
  'https://www.maasiso.nl/kennis/blog/avg-beeldmateriaal-toestemming/',
  'https://www.maasiso.nl/kennis/blog/iso-27001-checklist-augustus-2025/',
  'https://www.maasiso.nl/kennis/blog/wat-is-een-isms/',
];

async function main() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  const authClient = await auth.getClient();

  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });

  // ── Step 1: Resubmit sitemap ──
  console.log('=== SITEMAP HERINDIENEN ===\n');
  try {
    await webmasters.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: SITEMAP_URL,
    });
    console.log(`  ✓ Sitemap ingediend: ${SITEMAP_URL}`);
    console.log('    Google weet nu dat er wijzigingen zijn en zal opnieuw crawlen.\n');
  } catch (err) {
    console.error(`  ✗ Sitemap indienen mislukt: ${err.message}\n`);
  }

  // ── Step 2: Check index status of each URL ──
  console.log('=== INDEX STATUS CONTROLEREN ===\n');

  for (const url of UPDATED_URLS) {
    try {
      const res = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: SITE_URL,
        },
      });

      const result = res.data.inspectionResult;
      const indexStatus = result?.indexStatusResult;
      const verdict = indexStatus?.verdict || 'UNKNOWN';
      const coverageState = indexStatus?.coverageState || 'unknown';
      const lastCrawl = indexStatus?.lastCrawlTime || 'nooit';

      const shortUrl = url.replace('https://www.maasiso.nl', '');
      const icon = verdict === 'PASS' ? '✓' : verdict === 'NEUTRAL' ? '~' : '✗';

      console.log(`  ${icon} ${shortUrl}`);
      console.log(`    Status: ${coverageState}`);
      console.log(`    Laatst gecrawld: ${lastCrawl}`);
      console.log();
    } catch (err) {
      const shortUrl = url.replace('https://www.maasiso.nl', '');
      console.log(`  ? ${shortUrl} — kon status niet ophalen: ${err.message}\n`);
    }
  }

  console.log('=== KLAAR ===');
  console.log('\nDe sitemap is opnieuw ingediend bij Google.');
  console.log('Google zal de gewijzigde pagina\'s binnen enkele dagen opnieuw crawlen.');
  console.log('\nTip: Voor de belangrijkste pagina\'s kun je ook handmatig "Indexering aanvragen"');
  console.log('doen via Google Search Console > URL-inspectie (dat is sneller, maar niet via API mogelijk).');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
