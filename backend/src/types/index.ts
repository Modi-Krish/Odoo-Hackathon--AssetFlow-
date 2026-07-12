// ============================================================
// AssetFlow Type Definitions
// ============================================================

export enum UserRole {
  ADMIN = 'admin',
  ASSET_MANAGER = 'asset_manager',
  DEPARTMENT_HEAD = 'department_head',
  EMPLOYEE = 'employee',
}

export enum AssetCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum AssetStatus {
  AVAILABLE = 'available',
  ALLOCATED = 'allocated',
  RESERVED = 'reserved',
  UNDER_MAINTENANCE = 'under_maintenance',
  LOST = 'lost',
  RETIRED = 'retired',
  DISPOSED = 'disposed',
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum BookingStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReportType {
  ASSET = 'asset',
  DEPARTMENT = 'department',
  MAINTENANCE = 'maintenance',
  ALLOCATION = 'allocation',
}

// ============================================================
// Interfaces
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department_id: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  name: string;
  head_id: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  category_id: string | null;
  serial_number: string | null;
  condition: AssetCondition;
  status: AssetStatus;
  purchase_date: Date | null;
  purchase_cost: number | null;
  location: string | null;
  bookable: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AssetAllocation {
  id: string;
  asset_id: string;
  employee_id: string;
  allocated_by: string | null;
  allocation_date: Date;
  expected_return: Date | null;
  actual_return: Date | null;
  returned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TransferRequest {
  id: string;
  asset_id: string;
  from_employee: string;
  to_employee: string;
  requested_by: string | null;
  status: TransferStatus;
  approved_by: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  asset_id: string;
  booked_by: string;
  start_time: Date;
  end_time: Date;
  status: BookingStatus;
  purpose: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  requested_by: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  technician_id: string | null;
  approved_by: string | null;
  resolved_at: Date | null;
  attachments: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  read: boolean;
  created_at: Date;
}

export interface Report {
  id: string;
  type: ReportType;
  generated_by: string;
  filters: Record<string, unknown>;
  data: Record<string, unknown>;
  created_at: Date;
}

// ============================================================
// JWT Payload
// ============================================================

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  department_id: string | null;
}

// ============================================================
// Express Request Extension
// ============================================================

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
