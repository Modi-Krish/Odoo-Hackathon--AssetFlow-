-- AssetFlow Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'asset_manager', 'department_head', 'employee');

CREATE TYPE asset_condition AS ENUM ('new', 'good', 'fair', 'poor');

CREATE TYPE asset_status AS ENUM (
  'available', 'allocated', 'reserved',
  'under_maintenance', 'lost', 'retired', 'disposed'
);

CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE booking_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

CREATE TYPE maintenance_status AS ENUM (
  'pending', 'approved', 'rejected',
  'in_progress', 'resolved'
);

CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE report_type AS ENUM ('asset', 'department', 'maintenance', 'allocation');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. departments (created before users so users can reference it)
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL UNIQUE,
  head_id     UUID,  -- FK added after users table
  status      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 2. users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'employee',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status        BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Add FK for department head
ALTER TABLE departments
  ADD CONSTRAINT fk_department_head
  FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. asset_categories
CREATE TABLE asset_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 4. assets
CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_tag     VARCHAR(50) NOT NULL UNIQUE,
  name          VARCHAR(255) NOT NULL,
  category_id   UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  serial_number VARCHAR(255) UNIQUE,
  condition     asset_condition DEFAULT 'new',
  status        asset_status DEFAULT 'available',
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  location      VARCHAR(255),
  bookable      BOOLEAN DEFAULT false,
  image_url     VARCHAR(500),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 5. asset_allocations
CREATE TABLE asset_allocations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allocated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return DATE,
  actual_return   DATE,
  returned        BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- 6. transfer_requests
CREATE TABLE transfer_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_employee UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_employee   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  status        transfer_status DEFAULT 'pending',
  approved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 7. bookings
CREATE TABLE bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  booked_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time  TIMESTAMP NOT NULL,
  end_time    TIMESTAMP NOT NULL,
  status      booking_status DEFAULT 'upcoming',
  purpose     TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- 8. maintenance_requests
CREATE TABLE maintenance_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  requested_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue         TEXT NOT NULL,
  priority      maintenance_priority DEFAULT 'medium',
  status        maintenance_status DEFAULT 'pending',
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at   TIMESTAMP,
  attachments   TEXT[],
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 9. notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 10. reports
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          report_type NOT NULL,
  generated_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filters       JSONB DEFAULT '{}',
  data          JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_allocations_asset ON asset_allocations(asset_id);
CREATE INDEX idx_allocations_employee ON asset_allocations(employee_id);
CREATE INDEX idx_allocations_returned ON asset_allocations(returned);
CREATE INDEX idx_bookings_asset ON bookings(asset_id);
CREATE INDEX idx_bookings_time ON bookings(start_time, end_time);
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_transfer_status ON transfer_requests(status);
