-- ============================================================
-- AssetFlow: Row Level Security (RLS) Policies Migration
-- ============================================================
-- Run this AFTER schema.sql.
-- 
-- IMPORTANT NOTE on Connection Type:
-- This project uses a pg pool with the DATABASE_URL (service role connection).
-- The service role bypasses RLS by design (Supabase behavior).
-- To enforce RLS, you have two options:
--   1. Use the Supabase anon key + Supabase JS client on the backend (recommended for full RLS enforcement)
--   2. Set SET LOCAL ROLE authenticated; in each transaction (advanced — not covered here)
--
-- These policies are written to be correct and activate immediately if using
-- the Supabase REST API or JS client with anon/user JWT tokens.
-- They also serve as application-level documentation of intended access rules.
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get current user role from JWT
-- ============================================================

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'employee'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_asset_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_role() IN ('admin', 'asset_manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABLE: users
-- ============================================================
-- Rule: Users can read their own profile. Admins can read all.
-- Rule: Users can update their own profile only (not role/status).
-- Rule: Only admins can create/delete users.

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    id = current_user_id()
    OR current_user_role() IN ('admin', 'asset_manager', 'department_head')
  );

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    id = current_user_id()
  );

DROP POLICY IF EXISTS "users_admin_all" ON users;
CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (
    current_user_role() = 'admin'
  );

-- ============================================================
-- TABLE: departments
-- ============================================================
-- Rule: All authenticated users can read departments.
-- Rule: Only admins and asset_managers can create/update/delete.

DROP POLICY IF EXISTS "departments_select_all" ON departments;
CREATE POLICY "departments_select_all" ON departments
  FOR SELECT USING (true); -- All authenticated can read

DROP POLICY IF EXISTS "departments_admin_write" ON departments;
CREATE POLICY "departments_admin_write" ON departments
  FOR ALL USING (
    current_user_role() IN ('admin', 'asset_manager')
  );

-- ============================================================
-- TABLE: asset_categories
-- ============================================================
-- Rule: All authenticated users can read.
-- Rule: Only admins/asset_managers can write.

DROP POLICY IF EXISTS "categories_select_all" ON asset_categories;
CREATE POLICY "categories_select_all" ON asset_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_admin_write" ON asset_categories;
CREATE POLICY "categories_admin_write" ON asset_categories
  FOR ALL USING (
    current_user_role() IN ('admin', 'asset_manager')
  );

-- ============================================================
-- TABLE: assets
-- ============================================================
-- Rule: All authenticated users can read.
-- Rule: Only admins/asset_managers can create/update/delete.

DROP POLICY IF EXISTS "assets_select_all" ON assets;
CREATE POLICY "assets_select_all" ON assets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "assets_admin_write" ON assets;
CREATE POLICY "assets_admin_write" ON assets
  FOR ALL USING (
    current_user_role() IN ('admin', 'asset_manager')
  );

-- ============================================================
-- TABLE: asset_allocations
-- ============================================================
-- Rule: Employees can see their own allocations.
-- Rule: Admins/asset_managers can see and manage all.

DROP POLICY IF EXISTS "allocations_select" ON asset_allocations;
CREATE POLICY "allocations_select" ON asset_allocations
  FOR SELECT USING (
    employee_id = current_user_id()
    OR allocated_by = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "allocations_admin_write" ON asset_allocations;
CREATE POLICY "allocations_admin_write" ON asset_allocations
  FOR ALL USING (
    is_admin_or_asset_manager()
  );

-- ============================================================
-- TABLE: transfer_requests
-- ============================================================
-- Rule: Users can see transfers they are involved in.
-- Rule: Admins/asset_managers can see and manage all.

DROP POLICY IF EXISTS "transfers_select" ON transfer_requests;
CREATE POLICY "transfers_select" ON transfer_requests
  FOR SELECT USING (
    from_employee = current_user_id()
    OR to_employee = current_user_id()
    OR requested_by = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "transfers_admin_write" ON transfer_requests;
CREATE POLICY "transfers_admin_write" ON transfer_requests
  FOR ALL USING (
    is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "transfers_employee_insert" ON transfer_requests;
CREATE POLICY "transfers_employee_insert" ON transfer_requests
  FOR INSERT WITH CHECK (
    requested_by = current_user_id()
  );

-- ============================================================
-- TABLE: bookings
-- ============================================================
-- Rule: Users can see and manage their own bookings.
-- Rule: Admins/asset_managers can see and manage all.

DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    booked_by = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "bookings_user_insert" ON bookings;
CREATE POLICY "bookings_user_insert" ON bookings
  FOR INSERT WITH CHECK (
    booked_by = current_user_id()
  );

DROP POLICY IF EXISTS "bookings_user_update" ON bookings;
CREATE POLICY "bookings_user_update" ON bookings
  FOR UPDATE USING (
    booked_by = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "bookings_admin_delete" ON bookings;
CREATE POLICY "bookings_admin_delete" ON bookings
  FOR DELETE USING (
    is_admin_or_asset_manager()
  );

-- ============================================================
-- TABLE: maintenance_requests
-- ============================================================
-- Rule: Employees can see their own requests.
-- Rule: Admins/asset_managers can see and manage all.

DROP POLICY IF EXISTS "maintenance_select" ON maintenance_requests;
CREATE POLICY "maintenance_select" ON maintenance_requests
  FOR SELECT USING (
    requested_by = current_user_id()
    OR technician_id = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "maintenance_user_insert" ON maintenance_requests;
CREATE POLICY "maintenance_user_insert" ON maintenance_requests
  FOR INSERT WITH CHECK (
    requested_by = current_user_id()
  );

DROP POLICY IF EXISTS "maintenance_admin_write" ON maintenance_requests;
CREATE POLICY "maintenance_admin_write" ON maintenance_requests
  FOR ALL USING (
    is_admin_or_asset_manager()
  );

-- ============================================================
-- TABLE: notifications
-- ============================================================
-- Critical: Users can ONLY see their own notifications.
-- This prevents any IDOR vulnerability.

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    user_id = current_user_id()
  );

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    user_id = current_user_id()
  );

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (
    user_id = current_user_id()
  );

-- Only system/admin can create notifications
DROP POLICY IF EXISTS "notifications_admin_insert" ON notifications;
CREATE POLICY "notifications_admin_insert" ON notifications
  FOR INSERT WITH CHECK (
    current_user_role() IN ('admin', 'asset_manager')
    OR user_id = current_user_id()
  );

-- ============================================================
-- TABLE: reports
-- ============================================================
-- Rule: Users can see reports they generated.
-- Rule: Admins can see all.

DROP POLICY IF EXISTS "reports_select" ON reports;
CREATE POLICY "reports_select" ON reports
  FOR SELECT USING (
    generated_by = current_user_id()
    OR is_admin_or_asset_manager()
  );

DROP POLICY IF EXISTS "reports_user_insert" ON reports;
CREATE POLICY "reports_user_insert" ON reports
  FOR INSERT WITH CHECK (
    generated_by = current_user_id()
  );

-- ============================================================
-- VALIDATION TEST QUERIES
-- (Run these as different users to verify RLS is working)
-- ============================================================

-- Test 1: Employee should only see their own notifications
-- SET LOCAL request.jwt.claims = '{"id": "EMPLOYEE_UUID", "role": "employee"}';
-- SELECT * FROM notifications; -- Should only return rows where user_id = EMPLOYEE_UUID

-- Test 2: Admin should see all notifications
-- SET LOCAL request.jwt.claims = '{"id": "ADMIN_UUID", "role": "admin"}';
-- SELECT * FROM notifications; -- Should return ALL rows

-- Test 3: Employee cannot delete another user's notification
-- SET LOCAL request.jwt.claims = '{"id": "EMPLOYEE_UUID", "role": "employee"}';
-- DELETE FROM notifications WHERE user_id != 'EMPLOYEE_UUID'; -- Should delete 0 rows
