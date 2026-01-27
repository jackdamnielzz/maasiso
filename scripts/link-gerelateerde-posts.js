#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔗 MAASISO - GERELATEERDE BLOG POSTS LINKEN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  Dit script linkt blog posts aan elkaar voor interne SEO/topical authority.
 *  Het omzeilt de Strapi Admin UI bug en schrijft direct naar de database.
 * 
 *  WANNEER GEBRUIKEN:
 *  - Na het publiceren van een nieuwe blog post
 *  - Om bestaande posts te linken aan gerelateerde content
 *  - Voor het opbouwen van topical authority clusters
 * 
 *  HOE TE RUNNEN:
 *  Dubbelklik op "Link Blog Posts" op je bureaublad
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const readline = require('readline');
const { Client } = require('pg');

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE CONFIGURATIE
// ═══════════════════════════════════════════════════════════════════════════════

const DATABASE_URL = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';

function createClient() {
  if (DATABASE_URL) {
    return new Client({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
    });
  }
  
  return new Client({
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT || '5432'),
    database: DATABASE_NAME,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    ssl: DATABASE_SSL ? { rejectUnauthorized: false } : false
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// READLINE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function vraag(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function clearScreen() {
  console.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE FUNCTIES
// ═══════════════════════════════════════════════════════════════════════════════

async function getAllPosts(client) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE published_at IS NOT NULL
    ORDER BY title ASC
  `);
  return result.rows;
}

async function getPostBySlug(client, slug) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

async function getPostById(client, id) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE id = $1
  `, [id]);
  return result.rows[0];
}

async function searchPosts(client, searchTerm) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE published_at IS NOT NULL
      AND (LOWER(title) LIKE $1 OR LOWER(slug) LIKE $1)
    ORDER BY title ASC
    LIMIT 20
  `, [`%${searchTerm.toLowerCase()}%`]);
  return result.rows;
}

async function getJoinTableInfo(client) {
  // Zoek specifiek naar de blog_posts_related_posts_lnk tabel
  const tableCheck = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_name = 'blog_posts_related_posts_lnk'
       OR table_name LIKE '%blog_posts%related%lnk%'
       OR table_name LIKE '%related_posts%lnk%'
  `);
  
  if (tableCheck.rows.length === 0) {
    return null;
  }
  
  const joinTable = tableCheck.rows[0].table_name;
  
  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [joinTable]);
  
  const colNames = columns.rows.map(r => r.column_name);
  
  return {
    table: joinTable,
    columns: colNames
  };
}

async function getRelatedPostsForPost(client, postId, joinInfo) {
  if (!joinInfo) return [];
  
  const colNames = joinInfo.columns;
  let sourceCol, targetCol;
  
  if (colNames.includes('blog_post_id') && colNames.includes('inv_blog_post_id')) {
    sourceCol = 'blog_post_id';
    targetCol = 'inv_blog_post_id';
  } else {
    const idCols = colNames.filter(c => c.includes('id') && c !== 'id');
    if (idCols.length >= 2) {
      sourceCol = idCols[0];
      targetCol = idCols[1];
    } else {
      return [];
    }
  }
  
  try {
    const result = await client.query(`
      SELECT bp.id, bp.slug, bp.title
      FROM ${joinInfo.table} jt
      JOIN blog_posts bp ON bp.id = jt.${targetCol}
      WHERE jt.${sourceCol} = $1
    `, [postId]);
    return result.rows;
  } catch (e) {
    return [];
  }
}

async function linkPosts(client, sourceId, targetId, joinInfo) {
  if (!joinInfo) {
    throw new Error('Join table niet gevonden');
  }
  
  // Gebruik altijd blog_post_id en inv_blog_post_id voor de related posts tabel
  const sourceCol = 'blog_post_id';
  const targetCol = 'inv_blog_post_id';
  
  // Check of link al bestaat
  const existing = await client.query(`
    SELECT * FROM ${joinInfo.table}
    WHERE ${sourceCol} = $1 AND ${targetCol} = $2
  `, [sourceId, targetId]);
  
  if (existing.rows.length > 0) {
    return { created: false, reason: 'bestaat al' };
  }
  
  // Maak de link
  await client.query(`
    INSERT INTO ${joinInfo.table} (${sourceCol}, ${targetCol})
    VALUES ($1, $2)
  `, [sourceId, targetId]);
  
  return { created: true };
}

async function unlinkPosts(client, sourceId, targetId, joinInfo) {
  if (!joinInfo) {
    throw new Error('Join table niet gevonden');
  }
  
  const colNames = joinInfo.columns;
  let sourceCol, targetCol;
  
  if (colNames.includes('blog_post_id') && colNames.includes('inv_blog_post_id')) {
    sourceCol = 'blog_post_id';
    targetCol = 'inv_blog_post_id';
  } else {
    const idCols = colNames.filter(c => c.includes('id') && c !== 'id');
    if (idCols.length >= 2) {
      sourceCol = idCols[0];
      targetCol = idCols[1];
    } else {
      throw new Error('Kan kolommen niet bepalen');
    }
  }
  
  const result = await client.query(`
    DELETE FROM ${joinInfo.table} 
    WHERE ${sourceCol} = $1 AND ${targetCol} = $2
  `, [sourceId, targetId]);
  
  return result.rowCount > 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MENU FUNCTIES
// ═══════════════════════════════════════════════════════════════════════════════

function printHeader() {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log('  ║   🔗  MAASISO - GERELATEERDE BLOG POSTS LINKEN              ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

function printMenu() {
  console.log('  ┌─────────────────────────────────────────────────────────────┐');
  console.log('  │  HOOFDMENU                                                  │');
  console.log('  ├─────────────────────────────────────────────────────────────┤');
  console.log('  │                                                             │');
  console.log('  │   1. 📋 Alle blog posts bekijken                           │');
  console.log('  │   2. 🔍 Blog post zoeken                                   │');
  console.log('  │   3. ➕ Gerelateerde posts toevoegen aan een post          │');
  console.log('  │   4. 👁️  Gerelateerde posts bekijken van een post          │');
  console.log('  │   5. ➖ Gerelateerde post verwijderen                       │');
  console.log('  │   6. 📖 Instructies lezen                                  │');
  console.log('  │   0. 🚪 Afsluiten                                          │');
  console.log('  │                                                             │');
  console.log('  └─────────────────────────────────────────────────────────────┘');
  console.log('\n');
}

function printInstructies() {
  clearScreen();
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   📖 INSTRUCTIES - GERELATEERDE POSTS LINKEN                ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('  WANNEER GEBRUIK JE DIT SCRIPT?');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  • Na het publiceren van een NIEUWE blog post');
  console.log('  • Om bestaande posts te linken aan gerelateerde content');
  console.log('  • Voor het opbouwen van "topical authority" clusters');
  console.log('\n');
  console.log('  WAT ZIJN GERELATEERDE POSTS?');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  Gerelateerde posts zijn andere blog posts die:');
  console.log('  • Over hetzelfde onderwerp gaan (bijv. ISO 9001)');
  console.log('  • Elkaar aanvullen (bijv. checklist + uitleg)');
  console.log('  • Samen een "cluster" vormen voor SEO');
  console.log('\n');
  console.log('  HOEVEEL POSTS LINKEN?');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  • Minimaal: 2-3 gerelateerde posts per artikel');
  console.log('  • Maximaal: 5-7 posts (meer wordt onoverzichtelijk)');
  console.log('  • Kwaliteit > kwantiteit: alleen relevante links!');
  console.log('\n');
  console.log('  WAAROM WERKT DE STRAPI ADMIN UI NIET?');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  Strapi v5 heeft een bug met "self-referencing" relaties.');
  console.log('  De Admin UI geeft een foutmelding bij het opslaan.');
  console.log('  Dit script omzeilt die bug door direct naar de database');
  console.log('  te schrijven.');
  console.log('\n');
}

/**
 * Toon een genummerde lijst van posts en laat de gebruiker kiezen
 */
async function kiesPostUitLijst(client, posts, prompt, excludeIds = []) {
  // Filter uitgesloten posts
  const beschikbarePosts = posts.filter(p => !excludeIds.includes(p.id));
  
  if (beschikbarePosts.length === 0) {
    console.log('\n  ⚠️ Geen posts beschikbaar om te kiezen.\n');
    return null;
  }
  
  console.log('\n  ─────────────────────────────────────────────────────────────────');
  console.log('  KIES EEN POST (voer het nummer in):');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  // Toon posts met titel EN slug
  for (let i = 0; i < beschikbarePosts.length; i++) {
    const post = beschikbarePosts[i];
    const nummer = String(i + 1).padStart(2, ' ');
    const titel = post.title.length > 45 ? post.title.substring(0, 42) + '...' : post.title;
    console.log(`  ${nummer}. ${titel}`);
    console.log(`      └─ ${post.slug}`);
  }
  
  console.log('\n   0. Annuleren / Terug');
  console.log('');
  
  const keuze = await vraag(`  ${prompt}: `);
  
  if (keuze.trim() === '0' || keuze.trim() === '') {
    return null;
  }
  
  const index = parseInt(keuze.trim()) - 1;
  
  if (isNaN(index) || index < 0 || index >= beschikbarePosts.length) {
    console.log('\n  ⚠️ Ongeldige keuze.\n');
    return null;
  }
  
  return beschikbarePosts[index];
}

/**
 * Laat de gebruiker meerdere posts kiezen uit een lijst
 */
async function kiesMeerderePostsUitLijst(client, posts, bronPost, joinInfo) {
  const excludeIds = [bronPost.id];
  
  // Haal huidige gerelateerde posts op
  const huidige = await getRelatedPostsForPost(client, bronPost.id, joinInfo);
  const huidigeIds = huidige.map(p => p.id);
  
  // Filter beschikbare posts (niet de bron, niet al gelinkt)
  const beschikbarePosts = posts.filter(p =>
    p.id !== bronPost.id && !huidigeIds.includes(p.id)
  );
  
  if (beschikbarePosts.length === 0) {
    console.log('\n  ⚠️ Alle posts zijn al gelinkt aan deze post.\n');
    return [];
  }
  
  const gekozenPosts = [];
  
  while (true) {
    clearScreen();
    printHeader();
    
    console.log(`  📄 BRON POST: "${bronPost.title}"`);
    console.log(`     └─ ${bronPost.slug}\n`);
    
    if (huidige.length > 0 || gekozenPosts.length > 0) {
      console.log('  Huidige gerelateerde posts:');
      for (const p of huidige) {
        console.log(`    ✓ ${p.title}`);
        console.log(`      └─ ${p.slug}`);
      }
      for (const p of gekozenPosts) {
        console.log(`    + ${p.title} (nieuw)`);
        console.log(`      └─ ${p.slug}`);
      }
      console.log('');
    }
    
    // Filter al gekozen posts uit de lijst
    const nogBeschikbaar = beschikbarePosts.filter(p =>
      !gekozenPosts.some(g => g.id === p.id)
    );
    
    if (nogBeschikbaar.length === 0) {
      console.log('  ✅ Alle beschikbare posts zijn geselecteerd.\n');
      break;
    }
    
    console.log('  ─────────────────────────────────────────────────────────────────');
    console.log('  KIES POSTS OM TOE TE VOEGEN (voer nummer in, of 0 om te stoppen):');
    console.log('  ─────────────────────────────────────────────────────────────────\n');
    
    for (let i = 0; i < nogBeschikbaar.length; i++) {
      const post = nogBeschikbaar[i];
      const nummer = String(i + 1).padStart(2, ' ');
      const titel = post.title.length > 45 ? post.title.substring(0, 42) + '...' : post.title;
      console.log(`  ${nummer}. ${titel}`);
      console.log(`      └─ ${post.slug}`);
    }
    
    console.log('\n   0. Klaar met selecteren');
    console.log('');
    
    const keuze = await vraag('  Kies een nummer: ');
    
    if (keuze.trim() === '0' || keuze.trim() === '') {
      break;
    }
    
    const index = parseInt(keuze.trim()) - 1;
    
    if (isNaN(index) || index < 0 || index >= nogBeschikbaar.length) {
      console.log('\n  ⚠️ Ongeldige keuze. Probeer opnieuw.');
      await vraag('\n  Druk op Enter om door te gaan...');
      continue;
    }
    
    const gekozenPost = nogBeschikbaar[index];
    gekozenPosts.push(gekozenPost);
    console.log(`\n  ✅ "${gekozenPost.title}" toegevoegd aan selectie.`);
    console.log(`     └─ ${gekozenPost.slug}`);
    await vraag('\n  Druk op Enter om door te gaan (of kies nog een post)...');
  }
  
  return gekozenPosts;
}

async function bekijkAllePosts(client) {
  clearScreen();
  printHeader();
  console.log('  📋 ALLE GEPUBLICEERDE BLOG POSTS');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  const posts = await getAllPosts(client);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${post.title}`);
    console.log(`      Slug: ${post.slug}`);
    console.log('');
  }
  
  console.log(`  ─────────────────────────────────────────────────────────────────`);
  console.log(`  Totaal: ${posts.length} posts\n`);
}

async function zoekPost(client) {
  clearScreen();
  printHeader();
  console.log('  🔍 BLOG POST ZOEKEN');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  const zoekterm = await vraag('  Zoekterm (titel of slug): ');
  
  if (!zoekterm.trim()) {
    console.log('\n  ⚠️ Geen zoekterm ingevoerd\n');
    return;
  }
  
  const posts = await searchPosts(client, zoekterm.trim());
  
  if (posts.length === 0) {
    console.log('\n  ❌ Geen posts gevonden\n');
    return;
  }
  
  console.log(`\n  Gevonden (${posts.length}):\n`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${post.title}`);
    console.log(`      Slug: ${post.slug}`);
    console.log('');
  }
}

async function voegGerelateerdePostsToe(client, joinInfo, allePosts) {
  clearScreen();
  printHeader();
  console.log('  ➕ GERELATEERDE POSTS TOEVOEGEN');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  // Stap 1: Selecteer de bron post uit de lijst
  console.log('  STAP 1: Selecteer de BRON post (waar je links aan toevoegt)\n');
  
  const bronPost = await kiesPostUitLijst(client, allePosts, 'Kies de bron post');
  
  if (!bronPost) {
    console.log('\n  ⚠️ Geen post geselecteerd.\n');
    return;
  }
  
  console.log(`\n  ✅ Geselecteerd: "${bronPost.title}"\n`);
  
  // Stap 2: Selecteer meerdere gerelateerde posts
  console.log('  STAP 2: Selecteer de posts die je wilt linken\n');
  await vraag('  Druk op Enter om door te gaan...');
  
  const gekozenPosts = await kiesMeerderePostsUitLijst(client, allePosts, bronPost, joinInfo);
  
  if (gekozenPosts.length === 0) {
    console.log('\n  ⚠️ Geen posts geselecteerd om toe te voegen.\n');
    return;
  }
  
  // Stap 3: Verwerk de links
  clearScreen();
  printHeader();
  console.log('  ➕ LINKS AANMAKEN');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  console.log(`  Bron: "${bronPost.title}"\n`);
  console.log('  Verwerken...\n');
  
  let toegevoegd = 0;
  let overgeslagen = 0;
  let mislukt = 0;
  
  for (const targetPost of gekozenPosts) {
    try {
      const result = await linkPosts(client, bronPost.id, targetPost.id, joinInfo);
      if (result.created) {
        console.log(`  ✅ "${targetPost.title}" - toegevoegd`);
        toegevoegd++;
      } else {
        console.log(`  ⏭️ "${targetPost.title}" - ${result.reason}`);
        overgeslagen++;
      }
    } catch (e) {
      console.log(`  ❌ "${targetPost.title}" - fout: ${e.message}`);
      mislukt++;
    }
  }
  
  console.log('\n  ─────────────────────────────────────────────────────────────────');
  console.log(`  📊 RESULTAAT:`);
  console.log(`     Toegevoegd: ${toegevoegd}`);
  console.log(`     Overgeslagen: ${overgeslagen}`);
  console.log(`     Mislukt: ${mislukt}`);
  console.log('');
}

async function bekijkGerelateerdePostsVanPost(client, joinInfo, allePosts) {
  clearScreen();
  printHeader();
  console.log('  👁️ GERELATEERDE POSTS BEKIJKEN');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  const post = await kiesPostUitLijst(client, allePosts, 'Kies een post');
  
  if (!post) {
    console.log('\n  ⚠️ Geen post geselecteerd.\n');
    return;
  }
  
  console.log(`\n  📄 "${post.title}"\n`);
  
  const gerelateerd = await getRelatedPostsForPost(client, post.id, joinInfo);
  
  if (gerelateerd.length === 0) {
    console.log('  Geen gerelateerde posts gevonden.\n');
    console.log('  💡 Tip: Gebruik optie 3 om gerelateerde posts toe te voegen.\n');
    return;
  }
  
  console.log(`  Gerelateerde posts (${gerelateerd.length}):\n`);
  
  for (let i = 0; i < gerelateerd.length; i++) {
    const p = gerelateerd[i];
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${p.title}`);
    console.log(`      Slug: ${p.slug}`);
    console.log('');
  }
}

async function verwijderGerelateerdePost(client, joinInfo, allePosts) {
  clearScreen();
  printHeader();
  console.log('  ➖ GERELATEERDE POST VERWIJDEREN');
  console.log('  ─────────────────────────────────────────────────────────────────\n');
  
  // Stap 1: Selecteer de bron post
  console.log('  STAP 1: Selecteer de post waarvan je een link wilt verwijderen\n');
  
  const bronPost = await kiesPostUitLijst(client, allePosts, 'Kies de bron post');
  
  if (!bronPost) {
    console.log('\n  ⚠️ Geen post geselecteerd.\n');
    return;
  }
  
  console.log(`\n  📄 "${bronPost.title}"\n`);
  
  const gerelateerd = await getRelatedPostsForPost(client, bronPost.id, joinInfo);
  
  if (gerelateerd.length === 0) {
    console.log('  Geen gerelateerde posts om te verwijderen.\n');
    return;
  }
  
  // Stap 2: Selecteer de te verwijderen post
  console.log('  STAP 2: Selecteer de link die je wilt verwijderen\n');
  
  const targetPost = await kiesPostUitLijst(client, gerelateerd, 'Kies de link om te verwijderen');
  
  if (!targetPost) {
    console.log('\n  ⚠️ Geen link geselecteerd.\n');
    return;
  }
  
  try {
    const verwijderd = await unlinkPosts(client, bronPost.id, targetPost.id, joinInfo);
    if (verwijderd) {
      console.log(`\n  ✅ Link naar "${targetPost.title}" verwijderd.\n`);
    } else {
      console.log(`\n  ⚠️ Link bestond niet.\n`);
    }
  } catch (e) {
    console.log(`\n  ❌ Fout: ${e.message}\n`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  // Check database configuratie
  if (!DATABASE_URL && !DATABASE_HOST) {
    console.error('\n  ❌ FOUT: Database configuratie niet gevonden!');
    console.error('     Zorg dat je in de maasiso-strapi-railway folder bent');
    console.error('     en dat .env of .env.local bestaat met database credentials.\n');
    process.exit(1);
  }
  
  const client = createClient();
  
  try {
    await client.connect();
    
    // Haal join table info op
    const joinInfo = await getJoinTableInfo(client);
    if (!joinInfo) {
      console.error('\n  ❌ FOUT: Join table voor gerelateerde posts niet gevonden!');
      console.error('     Controleer of de Strapi database correct is geconfigureerd.\n');
      process.exit(1);
    }
    
    // Haal alle posts op (eenmalig voor snelheid)
    let allePosts = await getAllPosts(client);
    
    // Main loop
    while (true) {
      clearScreen();
      printHeader();
      printMenu();
      
      const keuze = await vraag('  Kies een optie (0-6): ');
      
      switch (keuze.trim()) {
        case '1':
          await bekijkAllePosts(client);
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '2':
          await zoekPost(client);
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '3':
          // Refresh posts lijst voor het geval er nieuwe zijn
          allePosts = await getAllPosts(client);
          await voegGerelateerdePostsToe(client, joinInfo, allePosts);
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '4':
          await bekijkGerelateerdePostsVanPost(client, joinInfo, allePosts);
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '5':
          await verwijderGerelateerdePost(client, joinInfo, allePosts);
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '6':
          printInstructies();
          await vraag('\n  Druk op Enter om terug te gaan...');
          break;
          
        case '0':
        case 'q':
        case 'Q':
          console.log('\n  👋 Tot ziens!\n');
          rl.close();
          await client.end();
          process.exit(0);
          
        default:
          console.log('\n  ⚠️ Ongeldige keuze. Probeer opnieuw.');
          await vraag('\n  Druk op Enter om door te gaan...');
      }
    }
  } catch (e) {
    console.error(`\n  ❌ Database fout: ${e.message}\n`);
    rl.close();
    process.exit(1);
  }
}

main();
