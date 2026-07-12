import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
});

async function seed() {
  try {
    console.log('Connecting to DB and starting seed...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Insert Departments
    const deptRes = await pool.query(`
      INSERT INTO departments (name)
      VALUES 
        ('Information Technology'),
        ('Human Resources'),
        ('Finance'),
        ('Marketing')
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `);

    // We'll fetch them just in case they already existed
    const allDepts = await pool.query('SELECT id, name FROM departments');
    const itDept = allDepts.rows.find(d => d.name === 'Information Technology');

    // 2. Insert Users
    const users = [
      { name: 'Admin User', email: 'admin@assetflow.com', role: 'admin' },
      { name: 'Asset Manager', email: 'manager@assetflow.com', role: 'asset_manager' },
      { name: 'IT Head', email: 'head@assetflow.com', role: 'department_head' },
      { name: 'Employee One', email: 'employee@assetflow.com', role: 'employee' },
    ];

    for (const u of users) {
      await pool.query(`
        INSERT INTO users (name, email, password, role, department_id, status)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (email) DO NOTHING
      `, [u.name, u.email, hashedPassword, u.role, itDept?.id || null]);
    }

    console.log('Users inserted. Login details:');
    console.log('Email: admin@assetflow.com');
    console.log('Password: password123');

    // 3. Insert Categories
    const categories = [
      { name: 'Electronics', description: 'Laptops, screens, etc' },
      { name: 'Furniture', description: 'Desks, chairs' },
      { name: 'Vehicles', description: 'Company cars' }
    ];

    for (const c of categories) {
      await pool.query(`
        INSERT INTO asset_categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [c.name, c.description]);
    }

    const allCats = await pool.query('SELECT id, name FROM asset_categories');
    const elecCat = allCats.rows.find(c => c.name === 'Electronics');
    const furnCat = allCats.rows.find(c => c.name === 'Furniture');

    // 4. Insert Assets
    if (elecCat && furnCat && itDept) {
      await pool.query(`
        INSERT INTO assets (asset_tag, name, category_id, serial_number, condition, status, purchase_date, purchase_cost, location)
        VALUES 
          ('AF-001', 'MacBook Pro 16"', $1, 'MBP-2026-AF01', 'new', 'available', '2026-01-15', 2499, 'IT Storage'),
          ('AF-002', 'Dell XPS 15', $1, 'DELL-XPS-002', 'good', 'available', '2025-06-10', 1899, 'IT Storage'),
          ('AF-003', 'Herman Miller Chair', $2, 'HM-003', 'fair', 'available', '2024-11-12', 1200, 'HQ Floor 1'),
          ('AF-004', 'LG 4K Monitor', $1, 'LG-4K-004', 'new', 'available', '2026-03-20', 450, 'IT Storage')
        ON CONFLICT DO NOTHING
      `, [elecCat.id, furnCat.id]);
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
