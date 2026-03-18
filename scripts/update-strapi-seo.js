#!/usr/bin/env node
/**
 * Update Strapi SEO fields via API
 * Based on STRAPI-SEO-UPDATES.md analysis
 */

const STRAPI_URL = 'https://peaceful-insight-production.up.railway.app';
const STRAPI_TOKEN = '8b6dccc437fd59c50f9d85deaec1724d6ddacbfa38bce41d60d7cdd7039d9ca8a211889d52ac4a899036641582b2fc42f5a8350b13b185dad56c2bc66f5d9771b0caa6d6c12e7c62b7d33dfc9e8877321efe1634a431443fc9f52412c1bd05137dbea543883422ae7857f23e0be47cdb8465339239092f5a658df77f1f4446f2';

const headers = {
  'Authorization': `Bearer ${STRAPI_TOKEN}`,
  'Content-Type': 'application/json',
};

// ── Page SEO updates (seoTitle + seoDescription + seoKeywords) ──
// Note: Strapi uses seoTitle/seoDescription/seoKeywords for BOTH pages and blog posts
const PAGE_UPDATES = [
  {
    slug: 'iso-9001',
    seoTitle: 'ISO 9001 Certificering: Kosten, Eisen & Begeleiding | MaasISO',
    seoDescription: 'Wat kost ISO 9001 certificering? Transparant kostenoverzicht, duidelijke eisen en stapsgewijze begeleiding voor MKB. Van nulmeting tot certificaat in 3-6 maanden.',
    seoKeywords: 'ISO 9001 certificering kosten, ISO 9001 kosten, ISO 9001 eisen, ISO 9001 certificaat, kwaliteitsmanagementsysteem MKB',
  },
  {
    slug: 'iso-27001',
    seoTitle: 'ISO 27001 Certificering: Kosten, Stappenplan & Advies | MaasISO',
    seoDescription: 'Wat kost ISO 27001 certificering? Compleet overzicht van kosten, doorlooptijd en eisen. Pragmatische begeleiding voor MKB van nulmeting tot audit.',
    seoKeywords: 'ISO 27001 certificering kosten, ISO 27001 kosten, ISO 27001 eisen, informatiebeveiliging certificering',
  },
  {
    slug: 'iso-14001',
    seoTitle: 'ISO 14001 Certificering: Kosten, Checklist & Begeleiding | MaasISO',
    seoDescription: 'ISO 14001 certificering voor milieumanagement. Wat zijn de kosten, eisen en stappen? Pragmatische begeleiding voor MKB van nulmeting tot certificaat.',
    seoKeywords: 'ISO 14001 certificering, ISO 14001 kosten, milieumanagement certificering, ISO 14001 eisen',
  },
  {
    slug: 'iso-45001',
    seoTitle: 'ISO 45001 Certificering: Kosten, Eisen & Arbo-management | MaasISO',
    seoDescription: 'ISO 45001 certificering voor gezond en veilig werken. Wat kost het? Welke eisen? Praktische begeleiding bij arbomanagement voor MKB-bedrijven.',
    seoKeywords: 'ISO 45001 certificering, ISO 45001 kosten, arbomanagement, veilig werken certificering',
  },
  {
    slug: 'bio',
    seoTitle: 'BIO (Baseline Informatiebeveiliging Overheid): Advies & Begeleiding | MaasISO',
    seoDescription: 'BIO-compliance voor overheidsorganisaties. Van BIR naar BIO: praktische begeleiding bij implementatie, gap-analyse en naleving.',
    seoKeywords: 'BIO baseline informatiebeveiliging overheid, BIO compliance, BIR naar BIO, informatiebeveiliging overheid',
  },
  {
    slug: 'avg',
    seoTitle: 'AVG Compliance: Privacy & GDPR Begeleiding voor MKB | MaasISO',
    seoDescription: 'AVG/GDPR compliance voor uw organisatie. Van verwerkingsregister tot privacybeleid: praktische begeleiding bij het voldoen aan de AVG.',
    seoKeywords: 'AVG compliance, GDPR begeleiding, privacy wetgeving MKB, verwerkingsregister AVG',
  },
];

// ── Blog post SEO updates (seoTitle + seoDescription + seoKeywords) ──
const BLOG_UPDATES = [
  {
    slug: 'taak-risico-analyse-voorbeeld-excel',
    seoTitle: 'TRA Voorbeeld Excel: Gratis Risico Analyse Template',
    seoDescription: 'Download een gratis TRA voorbeeld in Excel. Compleet taak risico analyse formulier met invulinstructies. Direct te gebruiken voor uw RI&E en veiligheidsanalyse.',
    seoKeywords: 'taak risico analyse voorbeeld excel, tra voorbeeld, tra formulier excel, risico analyse voorbeeld excel, taak risico analyse excel',
  },
  {
    slug: 'interne-audit-iso-9001-voorbeeld',
    seoTitle: 'Interne Audit ISO 9001: Voorbeeld Checklist & Vragen',
    seoDescription: 'Gratis voorbeeld voor uw interne audit ISO 9001. Inclusief checklist, auditvragen en stappenplan. Direct toepasbaar voor uw kwaliteitsmanagementsysteem.',
    seoKeywords: 'interne audit iso 9001 voorbeeld, interne audit checklist, iso 9001 audit vragen, audit checklist iso 9001, interne audit vragenlijst',
  },
  {
    slug: 'directiebeoordeling-iso-9001-voorbeeld',
    seoTitle: 'Directiebeoordeling ISO 9001: Voorbeeld Template & Uitleg',
    seoDescription: 'Compleet voorbeeld van een directiebeoordeling ISO 9001. Inclusief template, agendapunten en uitleg. Direct bruikbaar voor uw managementreview.',
    seoKeywords: 'directiebeoordeling iso 9001 voorbeeld, directiebeoordeling voorbeeld, iso 9001 directiebeoordeling, directiebeoordeling',
  },
  {
    slug: 'leveranciersbeoordeling-iso-9001',
    seoTitle: 'Leveranciersbeoordeling ISO 9001: Voorbeeld & Checklist',
    seoDescription: 'Voorbeeld leveranciersbeoordeling voor ISO 9001. Inclusief beoordelingscriteria, scoremodel en template. Voldoe aan de eisen van clausule 8.4.',
    seoKeywords: 'leveranciersbeoordeling iso 9001, iso 9001 leveranciersbeoordeling, leveranciersbeoordeling voorbeeld',
  },
  {
    slug: 'beleidsverklaring-iso-9001',
    seoTitle: 'Beleidsverklaring ISO 9001: Voorbeeld & Schrijfhulp',
    seoDescription: 'Hoe schrijf je een beleidsverklaring voor ISO 9001? Voorbeeld, template en tips. Voldoe aan de eisen van clausule 5.2 met een krachtig kwaliteitsbeleid.',
    seoKeywords: 'beleidsverklaring iso 9001, iso 9001 beleidsverklaring, beleidsverklaring, beleidsverklaring voorbeeld',
  },
  {
    slug: 'context-van-de-organisatie-iso-9001',
    seoTitle: 'Context van de Organisatie ISO 9001: Uitleg & Voorbeeld',
    seoDescription: 'Wat is de context van de organisatie volgens ISO 9001? Uitleg van clausule 4, stakeholderanalyse en SWOT-voorbeeld. Stapsgewijze aanpak voor uw organisatie.',
    seoKeywords: 'contextanalyse iso 9001, context van de organisatie iso 9001, iso 9001 context, stakeholderanalyse iso 9001',
  },
  {
    slug: 'avg-beeldmateriaal-toestemming',
    seoTitle: 'AVG & Beeldmateriaal: Wanneer Heb Je Toestemming Nodig?',
    seoDescription: 'Wanneer mag je foto\'s en video\'s gebruiken volgens de AVG? Uitleg over toestemming, grondslagen en praktische richtlijnen voor beeldmateriaal op de werkvloer.',
    seoKeywords: 'avg beeldmateriaal toestemming, avg foto\'s werknemers, beeldmateriaal avg, toestemming foto\'s avg',
  },
  {
    slug: 'iso-27001-checklist-augustus-2025',
    seoTitle: 'ISO 27001 Checklist: Overzicht Annex A Controls 2026',
    seoDescription: 'Uitgebreide ISO 27001 checklist met alle Annex A maatregelen. Controleer uw informatiebeveiliging en bereid uw organisatie voor op certificering.',
    seoKeywords: 'iso 27001 checklist, annex a iso 27001, iso 27001 controls, iso 27001 maatregelen checklist',
  },
  {
    slug: 'wat-is-een-isms',
    seoTitle: 'Wat is een ISMS? Betekenis, Opzet & Implementatie Uitgelegd',
    seoDescription: 'Wat is een ISMS (Information Security Management System)? Duidelijke uitleg over de betekenis, opzet en implementatie. Inclusief relatie met ISO 27001.',
    seoKeywords: 'isms betekenis, wat is een isms, isms, information security management system',
  },
];

async function apiFetch(path, options = {}) {
  const url = `${STRAPI_URL}${path}`;
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return JSON.parse(text);
}

// ── Step 1: Test connection ──
async function testConnection() {
  console.log('Testing Strapi API connection...');
  const data = await apiFetch('/api/pages?pagination[pageSize]=1&fields[0]=slug');
  console.log(`  Connected! Found ${data.meta?.pagination?.total ?? '?'} pages in Strapi.\n`);
}

// ── Step 2: Update pages ──
async function updatePages() {
  console.log('=== UPDATING SERVICE PAGES ===\n');

  for (const update of PAGE_UPDATES) {
    // Find the page by slug (Strapi v5 uses documentId for PUT)
    const data = await apiFetch(
      `/api/pages?filters[slug][$eq]=${update.slug}&fields[0]=slug&fields[1]=seoTitle&fields[2]=seoDescription&fields[3]=seoKeywords`
    );

    if (!data.data || data.data.length === 0) {
      console.log(`  SKIP: Page "${update.slug}" not found in Strapi`);
      continue;
    }

    const page = data.data[0];
    const docId = page.documentId;

    console.log(`  Page: ${update.slug} (documentId: ${docId})`);
    console.log(`    Current seoTitle: "${page.seoTitle || '(empty)'}"`);
    console.log(`    New seoTitle:     "${update.seoTitle}"`);

    const putData = {
      data: {
        seoTitle: update.seoTitle,
        seoDescription: update.seoDescription,
        seoKeywords: update.seoKeywords,
      },
    };

    await apiFetch(`/api/pages/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(putData),
    });

    console.log(`    ✓ Updated successfully\n`);
  }
}

// ── Step 3: Update blog posts ──
async function updateBlogPosts() {
  console.log('=== UPDATING BLOG POSTS ===\n');

  for (const update of BLOG_UPDATES) {
    // Find the blog post by slug
    const data = await apiFetch(
      `/api/blog-posts?filters[slug][$eq]=${update.slug}&fields[0]=slug&fields[1]=seoTitle&fields[2]=seoDescription`
    );

    if (!data.data || data.data.length === 0) {
      console.log(`  SKIP: Blog post "${update.slug}" not found in Strapi`);
      continue;
    }

    const post = data.data[0];
    const docId = post.documentId;

    console.log(`  Blog: ${update.slug} (documentId: ${docId})`);
    console.log(`    Current seoTitle: "${post.seoTitle || '(empty)'}"`);
    console.log(`    New seoTitle:     "${update.seoTitle}"`);

    const putData = {
      data: {
        seoTitle: update.seoTitle,
        seoDescription: update.seoDescription,
        seoKeywords: update.seoKeywords,
      },
    };

    await apiFetch(`/api/blog-posts/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(putData),
    });

    console.log(`    ✓ Updated successfully\n`);
  }
}

// ── Main ──
async function main() {
  try {
    await testConnection();
    await updatePages();
    await updateBlogPosts();
    console.log('\n=== ALL DONE ===');
    console.log('SEO fields updated in Strapi. Changes will be visible on the site:');
    console.log('  - Pages: within 24 hours (ISR revalidation)');
    console.log('  - Blog posts: within 30 minutes (ISR revalidation)');
  } catch (err) {
    console.error('\nERROR:', err.message);
    process.exit(1);
  }
}

main();
