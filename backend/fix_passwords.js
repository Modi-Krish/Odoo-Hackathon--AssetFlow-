const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await pool.query('UPDATE users SET password = $1', [hash]);
    console.log('Passwords updated to password123 successfully.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
