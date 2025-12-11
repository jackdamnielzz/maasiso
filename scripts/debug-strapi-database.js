const { Client } = require('pg');

const client = new Client({
  host: 'centerbeam.proxy.rlwy.net',
  port: 52159,
  user: 'postgres',
  password: 'pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

async function debug() {
  try {
    await client.connect();
    console.log('✅ Connected to Railway PostgreSQL\n');

    // 1. List all tables
    console.log('=== ALL TABLES ===');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Total tables:', tables.rows.length);
    tables.rows.forEach(r => console.log('  -', r.table_name));

    // 2. Check content tables specifically
    console.log('\n=== CONTENT TABLE COUNTS ===');
    const contentTables = ['blog_posts', 'news_articles', 'pages', 'diensten', 'articles'];
    for (const table of contentTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${result.rows[0].count} records`);
      } catch (e) {
        console.log(`${table}: TABLE NOT FOUND`);
      }
    }

    // 3. Check for Strapi v5 tables (document system)
    console.log('\n=== STRAPI V5 DOCUMENT TABLES ===');
    const v5Tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%_documents' OR table_name LIKE '%document%')
      ORDER BY table_name
    `);
    if (v5Tables.rows.length > 0) {
      v5Tables.rows.forEach(r => console.log('  -', r.table_name));
    } else {
      console.log('  No v5 document tables found');
    }

    // 4. Check blog_posts structure
    console.log('\n=== BLOG_POSTS TABLE STRUCTURE ===');
    try {
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        ORDER BY ordinal_position
      `);
      structure.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`));
    } catch (e) {
      console.log('  Could not get structure:', e.message);
    }

    // 5. Sample data from blog_posts
    console.log('\n=== BLOG_POSTS SAMPLE DATA ===');
    try {
      const sample = await client.query(`
        SELECT id, title, published_at, created_at
        FROM blog_posts
        LIMIT 5
      `);
      sample.rows.forEach(r => console.log(`  ID: ${r.id}, Title: "${r.title}", Published: ${r.published_at}, Created: ${r.created_at}`));
    } catch (e) {
      console.log('  Error:', e.message);
    }

    // 6. Check published_at status
    console.log('\n=== PUBLISH STATUS CHECK ===');
    try {
      const pubStatus = await client.query(`
        SELECT 
          CASE WHEN published_at IS NULL THEN 'Draft' ELSE 'Published' END as status,
          COUNT(*) as count
        FROM blog_posts
        GROUP BY CASE WHEN published_at IS NULL THEN 'Draft' ELSE 'Published' END
      `);
      pubStatus.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));
    } catch (e) {
      console.log('  Error:', e.message);
    }

    // 7. Check Strapi internal tables
    console.log('\n=== STRAPI INTERNAL TABLES ===');
    const strapiTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'strapi_%'
      ORDER BY table_name
    `);
    strapiTables.rows.forEach(r => console.log('  -', r.table_name));

    // 8. Check strapi_content_types
    console.log('\n=== STRAPI_CONTENT_TYPES ===');
    try {
      const contentTypes = await client.query(`SELECT * FROM strapi_content_types LIMIT 10`);
      contentTypes.rows.forEach(r => console.log(`  UID: ${r.uid}`));
    } catch (e) {
      console.log('  Error or table not found:', e.message);
    }

    // 9. Check for document_id column (Strapi v5)
    console.log('\n=== DOCUMENT_ID CHECK (Strapi v5) ===');
    try {
      const docIdCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'document_id'
      `);
      if (docIdCheck.rows.length > 0) {
        console.log('  ✅ document_id column EXISTS (Strapi v5 format)');
        const docIds = await client.query(`SELECT id, document_id FROM blog_posts LIMIT 3`);
        docIds.rows.forEach(r => console.log(`    ID: ${r.id}, document_id: ${r.document_id}`));
      } else {
        console.log('  ❌ document_id column NOT FOUND (Strapi v4 format detected)');
      }
    } catch (e) {
      console.log('  Error:', e.message);
    }

    // 10. Check admin_users
    console.log('\n=== ADMIN USERS ===');
    try {
      const admins = await client.query(`SELECT id, firstname, email FROM admin_users LIMIT 5`);
      admins.rows.forEach(r => console.log(`  ID: ${r.id}, Name: ${r.firstname}, Email: ${r.email}`));
    } catch (e) {
      console.log('  Error:', e.message);
    }

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

debug();