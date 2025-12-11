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

    // Check files_related_mph - what entities are the files linked to?
    console.log('=== FILES_RELATED_MPH (Morphic Relations) ===');
    const relatedTable = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'files_related_mph'
    `);
    console.log('Columns in files_related_mph:');
    relatedTable.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    // Get distinct related_type values (what content types have files)
    console.log('\n=== DISTINCT RELATED TYPES ===');
    const relatedTypes = await client.query(`
      SELECT related_type, COUNT(*) as count 
      FROM files_related_mph 
      GROUP BY related_type 
      ORDER BY count DESC
    `);
    relatedTypes.rows.forEach(r => console.log(`  ${r.related_type}: ${r.count} files`));

    // Check if the content exists in the related tables
    console.log('\n=== CHECKING IF RELATED CONTENT EXISTS ===');
    for (const row of relatedTypes.rows) {
      const relType = row.related_type;
      // Extract table name from related_type (format: api::blog-post.blog-post)
      const parts = relType.split('.');
      if (parts.length >= 2) {
        const tableName = parts[parts.length - 1].replace(/-/g, '_') + 's';
        try {
          const count = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          console.log(`  ${tableName}: ${count.rows[0].count} rows (has ${row.count} file links)`);
        } catch (e) {
          console.log(`  ${tableName}: ERROR - ${e.message.substring(0, 50)}`);
        }
      }
    }

    // Sample of files_related_mph to see IDs
    console.log('\n=== SAMPLE FILES_RELATED_MPH ===');
    const sample = await client.query(`
      SELECT id, file_id, related_type, field, "order" 
      FROM files_related_mph 
      LIMIT 10
    `);
    sample.rows.forEach(r => console.log(`  File ${r.file_id} -> ${r.related_type} (field: ${r.field})`));

    // Check if there's document_id in files_related_mph (Strapi v5)
    console.log('\n=== CHECKING FOR DOCUMENT_ID LINKAGE ===');
    const hasDocId = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'files_related_mph' 
      AND column_name LIKE '%document%'
    `);
    if (hasDocId.rows.length > 0) {
      console.log('Has document columns:', hasDocId.rows.map(r => r.column_name));
    } else {
      console.log('No document_id column in files_related_mph');
    }

    // Check blog_posts ID sequence specifically
    console.log('\n=== BLOG_POSTS SEQUENCE ===');
    const seqCheck = await client.query(`
      SELECT last_value, is_called 
      FROM blog_posts_id_seq
    `);
    console.log('blog_posts_id_seq:', seqCheck.rows[0]);

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

debug();