import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Connected to database successfully!');

    // Reset schema
    console.log('Resetting public schema...');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema...');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('Applying seed data...');
    await client.query(seedSql);
    console.log('Seed data applied successfully.');

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
