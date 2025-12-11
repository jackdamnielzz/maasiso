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

    // Check if ANY tables have data at all
    console.log('=== CHECKING ALL CONTENT TABLE ROW COUNTS ===');
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    for (const row of allTables.rows) {
      const table = row.table_name;
      try {
        const count = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        const cnt = parseInt(count.rows[0].count);
        if (cnt > 0) {
          console.log(`  ✅ ${table}: ${cnt} rows`);
        }
      } catch (e) {
        // Skip errors
      }
    }

    // Check categories and tags specifically (simpler content types)
    console.log('\n=== CATEGORIES & TAGS ===');
    try {
      const cats = await client.query(`SELECT * FROM categories LIMIT 5`);
      console.log('Categories:', cats.rows.length > 0 ? cats.rows : 'EMPTY');
    } catch(e) { console.log('Categories error:', e.message); }

    try {
      const tags = await client.query(`SELECT * FROM tags LIMIT 5`);
      console.log('Tags:', tags.rows.length > 0 ? tags.rows : 'EMPTY');
    } catch(e) { console.log('Tags error:', e.message); }

    // Check files table (media)
    console.log('\n=== FILES TABLE (Media) ===');
    try {
      const files = await client.query(`SELECT COUNT(*) as count FROM files`);
      console.log('Files count:', files.rows[0].count);
      if (parseInt(files.rows[0].count) > 0) {
        const sample = await client.query(`SELECT id, name, url FROM files LIMIT 3`);
        sample.rows.forEach(r => console.log(`  File: ${r.name} -> ${r.url}`));
      }
    } catch(e) { console.log('Files error:', e.message); }

    // Check admin_permissions (should have data from Strapi)
    console.log('\n=== ADMIN PERMISSIONS ===');
    try {
      const perms = await client.query(`SELECT COUNT(*) as count FROM admin_permissions`);
      console.log('Admin permissions:', perms.rows[0].count);
    } catch(e) { console.log('Permissions error:', e.message); }

    // Check strapi_core_store_settings (metadata)
    console.log('\n=== STRAPI SETTINGS ===');
    try {
      const settings = await client.query(`SELECT key, value FROM strapi_core_store_settings LIMIT 5`);
      settings.rows.forEach(r => {
        const val = r.value ? r.value.substring(0, 100) : 'null';
        console.log(`  ${r.key}: ${val}...`);
      });
    } catch(e) { console.log('Settings error:', e.message); }

    // Check sequence values (can indicate if data was ever inserted)
    console.log('\n=== TABLE SEQUENCES (indicates if data was ever inserted) ===');
    const seqCheck = await client.query(`
      SELECT schemaname, sequencename, last_value 
      FROM pg_sequences 
      WHERE schemaname = 'public'
      AND last_value > 1
      ORDER BY last_value DESC
      LIMIT 10
    `);
    seqCheck.rows.forEach(r => console.log(`  ${r.sequencename}: last_value = ${r.last_value}`));

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

debug();