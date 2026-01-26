/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ@centerbeam.proxy.rlwy.net:52159/railway';

const sqlPath = path.join(__dirname, 'strapi-db-migration.sql');

const run = async () => {
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`SQL file not found at ${sqlPath}`);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

run();
