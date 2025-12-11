/**
 * Strapi Content Migration Script
 * 
 * Purpose: Extract content from old VPS and import to Railway
 * 
 * Usage:
 *   1. First run with --export flag on VPS or via SSH
 *   2. Then run with --import flag locally to push to Railway
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway PostgreSQL configuration
const RAILWAY_CONFIG = {
  host: 'centerbeam.proxy.rlwy.net',
  port: 52159,
  user: 'postgres',
  password: 'pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

// VPS PostgreSQL configuration (for SSH tunnel)
const VPS_CONFIG = {
  host: '127.0.0.1',  // Via SSH tunnel
  port: 5432,
  user: 'strapi',
  password: 'Niekties@100',
  database: 'strapi_db'
};

// Content tables to migrate
const CONTENT_TABLES = [
  'blog_posts',
  'news_articles',
  'pages',
  'categories',
  'tags',
  'services',
  'testimonials',
  'tools',
  'whitepapers',
  'newsletter_subscribers',
  'whitepaper_leads',
  // Link tables
  'blog_posts_categories_lnk',
  'blog_posts_tags_lnk',
  'news_articles_categories_lnk',
  'news_articles_tags_lnk',
  // Components
  'components_page_blocks_buttons',
  'components_page_blocks_feature_grids',
  'components_page_blocks_heroes',
  'components_page_blocks_image_galleries',
  'components_page_blocks_text_blocks',
  'components_shared_cta_buttons',
  'components_shared_features',
  'global_content_blocks',
  'layout_presets',
  'page_templates',
  'section_templates'
];

async function exportFromVPS() {
  console.log('=== EXPORTING CONTENT FROM VPS ===\n');
  
  const client = new Client(VPS_CONFIG);
  const exportData = {};
  
  try {
    await client.connect();
    console.log('✅ Connected to VPS PostgreSQL\n');
    
    for (const table of CONTENT_TABLES) {
      try {
        const result = await client.query(`SELECT * FROM "${table}"`);
        if (result.rows.length > 0) {
          exportData[table] = result.rows;
          console.log(`  ✅ ${table}: ${result.rows.length} rows exported`);
        } else {
          console.log(`  ⚪ ${table}: empty`);
        }
      } catch (e) {
        console.log(`  ❌ ${table}: ${e.message.substring(0, 50)}`);
      }
    }
    
    // Save to JSON file
    const exportPath = path.join(__dirname, '..', 'backups', 'strapi-content-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`\n✅ Export saved to: ${exportPath}`);
    
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

async function transformForV5(data) {
  /**
   * Strapi v5 requires document_id for content entries
   * We need to generate unique document_ids for each record
   */
  const crypto = require('crypto');
  
  const transformed = {};
  
  for (const [table, rows] of Object.entries(data)) {
    transformed[table] = rows.map(row => {
      // Add document_id if not present (for content tables)
      if (!row.document_id && ['blog_posts', 'news_articles', 'pages', 'categories', 
          'tags', 'services', 'testimonials', 'tools', 'whitepapers'].includes(table)) {
        row.document_id = crypto.randomBytes(16).toString('hex').substring(0, 24);
      }
      
      // Add locale if not present (Strapi v5 requirement)
      if (!row.locale && ['blog_posts', 'news_articles', 'pages'].includes(table)) {
        row.locale = 'en';
      }
      
      return row;
    });
  }
  
  return transformed;
}

async function importToRailway() {
  console.log('=== IMPORTING CONTENT TO RAILWAY ===\n');
  
  const exportPath = path.join(__dirname, '..', 'backups', 'strapi-content-export.json');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Export file not found. Run --export first.');
    console.log('   Expected: ' + exportPath);
    return;
  }
  
  const rawData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const data = await transformForV5(rawData);
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to Railway PostgreSQL\n');
    
    // Import order matters due to foreign keys
    const importOrder = [
      'categories',
      'tags',
      'blog_posts',
      'news_articles',
      'pages',
      'services',
      'testimonials',
      'tools',
      'whitepapers',
      'newsletter_subscribers',
      'whitepaper_leads',
      'blog_posts_categories_lnk',
      'blog_posts_tags_lnk',
      'news_articles_categories_lnk',
      'news_articles_tags_lnk',
      'components_page_blocks_buttons',
      'components_page_blocks_feature_grids',
      'components_page_blocks_heroes',
      'components_page_blocks_image_galleries',
      'components_page_blocks_text_blocks',
      'components_shared_cta_buttons',
      'components_shared_features',
      'global_content_blocks',
      'layout_presets',
      'page_templates',
      'section_templates'
    ];
    
    for (const table of importOrder) {
      if (!data[table] || data[table].length === 0) continue;
      
      const rows = data[table];
      let inserted = 0;
      
      for (const row of rows) {
        try {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          // Use ON CONFLICT to handle existing records
          const query = `
            INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (id) DO UPDATE SET ${columns.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ')}
          `;
          
          await client.query(query, values);
          inserted++;
        } catch (e) {
          if (!e.message.includes('duplicate key')) {
            console.log(`  ⚠️ ${table} row error: ${e.message.substring(0, 60)}`);
          }
        }
      }
      
      console.log(`  ✅ ${table}: ${inserted}/${rows.length} rows imported`);
    }
    
    // Update sequences
    console.log('\nUpdating sequences...');
    for (const table of importOrder) {
      if (!data[table] || data[table].length === 0) continue;
      try {
        await client.query(`SELECT setval('${table}_id_seq', (SELECT COALESCE(MAX(id), 1) FROM "${table}"), true)`);
      } catch (e) {
        // Sequence might not exist for all tables
      }
    }
    
    console.log('\n✅ Import complete!');
    
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

async function verifyImport() {
  console.log('=== VERIFYING IMPORT ===\n');
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    
    for (const table of ['blog_posts', 'news_articles', 'pages', 'categories', 'tags']) {
      const result = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`  ${table}: ${result.rows[0].count} rows`);
    }
    
  } finally {
    await client.end();
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--export')) {
  exportFromVPS();
} else if (args.includes('--import')) {
  importToRailway();
} else if (args.includes('--verify')) {
  verifyImport();
} else {
  console.log(`
Strapi Content Migration Script
================================

Usage:
  node migrate-strapi-content.js --export   Export from VPS (run via SSH tunnel)
  node migrate-strapi-content.js --import   Import to Railway
  node migrate-strapi-content.js --verify   Verify import results

Steps:
  1. Set up SSH tunnel to VPS: ssh -L 5432:127.0.0.1:5432 root@153.92.223.23
  2. Run: node migrate-strapi-content.js --export
  3. Run: node migrate-strapi-content.js --import
  4. Run: node migrate-strapi-content.js --verify
  `);
}