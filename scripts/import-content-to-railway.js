/**
 * Import Strapi Content to Railway PostgreSQL
 * 
 * This script imports the exported content from the VPS to Railway.
 * It handles Strapi v5 compatibility by adding document_id where needed.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Railway PostgreSQL configuration
const RAILWAY_CONFIG = {
  host: 'centerbeam.proxy.rlwy.net',
  port: 52159,
  user: 'postgres',
  password: 'pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

// Generate unique document_id for Strapi v5
function generateDocumentId() {
  return crypto.randomBytes(12).toString('hex');
}

// Transform row for Strapi v5 compatibility
function transformRow(row, tableName) {
  const transformed = { ...row };
  
  // Content tables that need document_id
  const contentTables = ['blog_posts', 'news_articles', 'pages', 'categories', 'tags', 'services', 'testimonials', 'tools', 'whitepapers'];
  
  if (contentTables.includes(tableName)) {
    // Add document_id if not present
    if (!transformed.document_id) {
      transformed.document_id = generateDocumentId();
    }
    
    // Add locale if not present (for i18n-enabled tables)
    if (['blog_posts', 'news_articles', 'pages'].includes(tableName)) {
      if (!transformed.locale) {
        transformed.locale = 'en';
      }
    }
  }
  
  return transformed;
}

// Escape value for SQL
function escapeValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function importData() {
  console.log('=== Importing Content to Railway ===\n');
  
  const exportPath = path.join(__dirname, '..', 'backups', 'strapi-content-export-combined.json');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Export file not found:', exportPath);
    return;
  }
  
  let rawData = fs.readFileSync(exportPath, 'utf8');
  
  // Remove psql header line if present
  if (rawData.startsWith('Output format')) {
    rawData = rawData.substring(rawData.indexOf('\n') + 1);
  }
  
  const data = JSON.parse(rawData);
  
  console.log('📁 Loaded export file');
  Object.entries(data).forEach(([table, rows]) => {
    if (rows && rows.length > 0) {
      console.log(`   ${table}: ${rows.length} records`);
    }
  });
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    console.log('\n✅ Connected to Railway PostgreSQL\n');
    
    // Import order matters due to foreign key constraints
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
      'blog_posts_categories_lnk',
      'blog_posts_tags_lnk',
      'news_articles_categories_lnk',
      'news_articles_tags_lnk'
    ];
    
    for (const tableName of importOrder) {
      const rows = data[tableName];
      
      if (!rows || rows.length === 0) {
        console.log(`⚪ ${tableName}: skipped (no data)`);
        continue;
      }
      
      let imported = 0;
      let errors = 0;
      
      // Get table columns from database
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [tableName]);
      const validColumns = columnsResult.rows.map(r => r.column_name);
      
      for (const row of rows) {
        const transformed = transformRow(row, tableName);
        
        // Filter to only include valid columns
        const columns = Object.keys(transformed).filter(c => validColumns.includes(c));
        const values = columns.map(c => transformed[c]);
        
        try {
          // Use parameterized query for safety
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          const columnNames = columns.map(c => `"${c}"`).join(', ');
          
          // Try INSERT first, if fails try UPDATE (upsert)
          const query = `
            INSERT INTO "${tableName}" (${columnNames})
            VALUES (${placeholders})
            ON CONFLICT (id) DO UPDATE SET
            ${columns.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ')}
          `;
          
          await client.query(query, values);
          imported++;
          
        } catch (e) {
          errors++;
          if (!e.message.includes('duplicate key')) {
            console.log(`  ⚠️ Error in ${tableName} (id=${transformed.id}): ${e.message.substring(0, 80)}`);
          }
        }
      }
      
      console.log(`✅ ${tableName}: ${imported}/${rows.length} imported (${errors} errors)`);
    }
    
    // Update sequences to avoid ID conflicts on new inserts
    console.log('\n📋 Updating sequences...');
    for (const tableName of importOrder) {
      try {
        await client.query(`
          SELECT setval('${tableName}_id_seq', COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true)
        `);
      } catch (e) {
        // Sequence might not exist for link tables
      }
    }
    
    // Verify import
    console.log('\n=== Verification ===');
    for (const tableName of ['blog_posts', 'news_articles', 'pages', 'categories', 'tags']) {
      const result = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`  ${tableName}: ${result.rows[0].count} records`);
    }
    
    console.log('\n✅ Import complete!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

// Run import
importData();