-- AssetFlow Seed Data
-- Run after schema.sql

-- ============================================================
-- DEPARTMENTS
-- ============================================================

INSERT INTO departments (id, name, status) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'Engineering', true),
  ('d0000001-0000-0000-0000-000000000002', 'Human Resources', true),
  ('d0000001-0000-0000-0000-000000000003', 'Marketing', true),
  ('d0000001-0000-0000-0000-000000000004', 'Finance', true),
  ('d0000001-0000-0000-0000-000000000005', 'Operations', true);

-- ============================================================
-- USERS (passwords are bcrypt hash of "password123")
-- ============================================================

INSERT INTO users (id, name, email, password, role, department_id, status) VALUES
  ('u0000001-0000-0000-0000-000000000001', 'Krish Modi', 'admin@assetflow.com',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQCasNU1u0MR6gzRVQ5Ey7KTpOCm7y',
   'admin', 'd0000001-0000-0000-0000-000000000001', true),

  ('u0000001-0000-0000-0000-000000000002', 'Asset Manager', 'manager@assetflow.com',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQCasNU1u0MR6gzRVQ5Ey7KTpOCm7y',
   'asset_manager', 'd0000001-0000-0000-0000-000000000001', true),

  ('u0000001-0000-0000-0000-000000000003', 'Department Head', 'head@assetflow.com',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQCasNU1u0MR6gzRVQ5Ey7KTpOCm7y',
   'department_head', 'd0000001-0000-0000-0000-000000000002', true),

  ('u0000001-0000-0000-0000-000000000004', 'John Employee', 'john@assetflow.com',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQCasNU1u0MR6gzRVQ5Ey7KTpOCm7y',
   'employee', 'd0000001-0000-0000-0000-000000000002', true),

  ('u0000001-0000-0000-0000-000000000005', 'Jane Employee', 'jane@assetflow.com',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQCasNU1u0MR6gzRVQ5Ey7KTpOCm7y',
   'employee', 'd0000001-0000-0000-0000-000000000003', true);

-- Assign department heads
UPDATE departments SET head_id = 'u0000001-0000-0000-0000-000000000001'
  WHERE id = 'd0000001-0000-0000-0000-000000000001';
UPDATE departments SET head_id = 'u0000001-0000-0000-0000-000000000003'
  WHERE id = 'd0000001-0000-0000-0000-000000000002';

-- ============================================================
-- ASSET CATEGORIES
-- ============================================================

INSERT INTO asset_categories (id, name, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Electronics', 'Laptops, monitors, phones, and other electronic devices'),
  ('c0000001-0000-0000-0000-000000000002', 'Furniture', 'Desks, chairs, cabinets, and other office furniture'),
  ('c0000001-0000-0000-0000-000000000003', 'Vehicles', 'Company cars, vans, and other vehicles'),
  ('c0000001-0000-0000-0000-000000000004', 'Equipment', 'Projectors, printers, scanners, and other equipment'),
  ('c0000001-0000-0000-0000-000000000005', 'Software', 'Software licenses and subscriptions');

-- ============================================================
-- ASSETS
-- ============================================================

INSERT INTO assets (id, asset_tag, name, category_id, serial_number, condition, status, purchase_date, purchase_cost, location, bookable) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'AST-000001', 'MacBook Pro 16"',
   'c0000001-0000-0000-0000-000000000001', 'SN-MBP-2024-001', 'new', 'available',
   '2024-01-15', 2499.99, 'Engineering Lab', false),

  ('a0000001-0000-0000-0000-000000000002', 'AST-000002', 'Dell Monitor 27"',
   'c0000001-0000-0000-0000-000000000001', 'SN-DM-2024-001', 'new', 'available',
   '2024-02-01', 549.99, 'Engineering Lab', false),

  ('a0000001-0000-0000-0000-000000000003', 'AST-000003', 'Standing Desk',
   'c0000001-0000-0000-0000-000000000002', 'SN-SD-2024-001', 'good', 'available',
   '2024-01-20', 799.99, 'Office Floor 2', false),

  ('a0000001-0000-0000-0000-000000000004', 'AST-000004', 'Conference Room Projector',
   'c0000001-0000-0000-0000-000000000004', 'SN-CRP-2024-001', 'good', 'available',
   '2023-11-10', 1299.99, 'Conference Room A', true),

  ('a0000001-0000-0000-0000-000000000005', 'AST-000005', 'Company Van',
   'c0000001-0000-0000-0000-000000000003', 'SN-VAN-2024-001', 'good', 'available',
   '2024-03-01', 35000.00, 'Parking Lot B', true),

  ('a0000001-0000-0000-0000-000000000006', 'AST-000006', 'HP LaserJet Printer',
   'c0000001-0000-0000-0000-000000000004', 'SN-HLP-2024-001', 'fair', 'available',
   '2023-06-15', 899.99, 'Office Floor 1', true),

  ('a0000001-0000-0000-0000-000000000007', 'AST-000007', 'Ergonomic Chair',
   'c0000001-0000-0000-0000-000000000002', 'SN-EC-2024-001', 'new', 'allocated',
   '2024-04-01', 599.99, 'Office Floor 2', false),

  ('a0000001-0000-0000-0000-000000000008', 'AST-000008', 'iPhone 15 Pro',
   'c0000001-0000-0000-0000-000000000001', 'SN-IP-2024-001', 'new', 'available',
   '2024-05-01', 1199.99, 'IT Storage', false);

-- ============================================================
-- SAMPLE ALLOCATION (Ergonomic Chair → John Employee)
-- ============================================================

INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, allocation_date, expected_return) VALUES
  ('a0000001-0000-0000-0000-000000000007', 'u0000001-0000-0000-0000-000000000004',
   'u0000001-0000-0000-0000-000000000002', '2024-04-15', '2025-04-15');

-- ============================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (title, description, user_id) VALUES
  ('Welcome to AssetFlow', 'Your account has been created successfully.', 'u0000001-0000-0000-0000-000000000001'),
  ('Asset Allocated', 'Ergonomic Chair has been assigned to John Employee.', 'u0000001-0000-0000-0000-000000000004'),
  ('System Ready', 'AssetFlow is configured and ready to use.', 'u0000001-0000-0000-0000-000000000001');
