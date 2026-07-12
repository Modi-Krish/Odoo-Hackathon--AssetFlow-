export type UserRole = 'admin' | 'asset_manager' | 'department_head' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  status: boolean; // true = Active, false = Inactive
}

export interface Department {
  id: string;
  name: string;
  head_id?: string; // User ID of Department Head
  status: boolean; // true = Active, false = Inactive
  parent_id?: string; // Optional for hierarchy
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
}

export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Broken';
export type AssetStatus = 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';

export interface Asset {
  id: string;
  asset_tag: string; // e.g. AF-0001
  name: string;
  category_id: string;
  serial_number: string;
  condition: AssetCondition;
  status: AssetStatus;
  purchase_date: string;
  purchase_cost: number;
  location: string;
  bookable: boolean;
  assigned_to_id?: string; // Currently allocated user (optional)
  department_id?: string; // Currently allocated department (optional)
}

export interface AssetAllocation {
  id: string;
  asset_id: string;
  employee_id: string;
  allocation_date: string;
  expected_return?: string;
  returned: boolean;
  return_date?: string;
  condition_check?: string;
}

export type TransferStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TransferRequest {
  id: string;
  asset_id: string;
  from_employee_id: string;
  to_employee_id: string;
  status: TransferStatus;
  created_at: string;
}

export type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  asset_id: string;
  booked_by: string; // User ID
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
}

export type MaintenanceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Technician Assigned' | 'In Progress' | 'Resolved';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  created_by: string; // User ID
  technician?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  user_id: string;
  read: boolean;
  created_at: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  scope_type: 'department' | 'location';
  scope_value: string; // department ID or location name
  auditor_id: string; // User ID
  status: 'Active' | 'Closed';
  created_at: string;
}

export interface AuditItem {
  id: string;
  audit_cycle_id: string;
  asset_id: string;
  status: 'Pending' | 'Verified' | 'Missing' | 'Damaged';
  notes?: string;
  updated_at?: string;
}
