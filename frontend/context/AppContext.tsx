'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, signupAPI, getProfileAPI } from '../services/auth';
import {
  User,
  Department,
  AssetCategory,
  Asset,
  AssetAllocation,
  TransferRequest,
  Booking,
  MaintenanceRequest,
  Notification,
  AuditCycle,
  AuditItem,
  UserRole,
  AssetStatus,
  AssetCondition,
  TransferStatus,
  BookingStatus,
  MaintenanceStatus
} from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  categories: AssetCategory[];
  assets: Asset[];
  allocations: AssetAllocation[];
  transfers: TransferRequest[];
  bookings: Booking[];
  maintenance: MaintenanceRequest[];
  notifications: Notification[];
  audits: AuditCycle[];
  auditItems: AuditItem[];
  
  // Auth Actions
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // CRUD Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  addCategory: (category: Omit<AssetCategory, 'id'>) => void;
  updateCategory: (id: string, category: Partial<AssetCategory>) => void;
  deleteCategory: (id: string) => void;
  
  addEmployee: (employee: Omit<User, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<User>) => void;
  deleteEmployee: (id: string) => void;
  
  addAsset: (asset: Omit<Asset, 'id' | 'asset_tag' | 'status'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Workflow Actions
  allocateAsset: (assetId: string, employeeId: string, expectedReturn?: string) => { success: boolean; message: string };
  returnAsset: (assetId: string, condition: AssetCondition, notes: string) => { success: boolean; message: string };
  requestTransfer: (assetId: string, toEmployeeId: string) => { success: boolean; message: string };
  approveTransfer: (transferId: string) => { success: boolean; message: string };
  rejectTransfer: (transferId: string) => { success: boolean; message: string };
  
  // Bookings
  bookResource: (assetId: string, start: string, end: string) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => { success: boolean; message: string };
  
  // Maintenance
  raiseMaintenance: (assetId: string, issue: string, priority: MaintenanceRequest['priority']) => { success: boolean; message: string };
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest['status'], technician?: string) => { success: boolean; message: string };
  
  // Audits
  createAuditCycle: (name: string, scopeType: 'department' | 'location', scopeValue: string, auditorId: string) => { success: boolean; message: string };
  updateAuditItem: (itemId: string, status: AuditItem['status'], notes?: string) => void;
  closeAuditCycle: (cycleId: string) => void;
  
  // Notification utilities
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addSystemNotification: (title: string, description: string, userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Data
const defaultUsers: User[] = [
  { id: 'u-1', name: 'Krish Lead', email: 'admin@assetflow.com', role: 'Admin', status: true },
  { id: 'u-2', name: 'Sarah Connor', email: 'manager@assetflow.com', role: 'Asset Manager', status: true },
  { id: 'u-3', name: 'Raj Kumar', email: 'head@assetflow.com', role: 'Department Head', department_id: 'd-1', status: true },
  { id: 'u-4', name: 'Priya Sharma', email: 'employee@assetflow.com', role: 'Employee', department_id: 'd-1', status: true },
  { id: 'u-5', name: 'John Doe', email: 'john@assetflow.com', role: 'Employee', department_id: 'd-2', status: true },
];

const defaultDepartments: Department[] = [
  { id: 'd-1', name: 'Information Technology', head_id: 'u-3', status: true },
  { id: 'd-2', name: 'Human Resources', head_id: 'u-2', status: true },
  { id: 'd-3', name: 'Finance', status: true },
  { id: 'd-4', name: 'Marketing', status: true },
];

const defaultCategories: AssetCategory[] = [
  { id: 'c-1', name: 'Electronics', description: 'Laptops, screens, keyboard, accessories' },
  { id: 'c-2', name: 'Furniture', description: 'Desks, chairs, filing cabinets' },
  { id: 'c-3', name: 'Vehicles', description: 'Company cars, vans' },
  { id: 'c-4', name: 'Lab Equipment', description: 'Scientific measurement tools' },
];

const defaultAssets: Asset[] = [
  { id: 'a-1', asset_tag: 'AF-0001', name: 'MacBook Pro 16"', category_id: 'c-1', serial_number: 'MBP-2026-AF01', condition: 'New', status: 'Allocated', purchase_date: '2026-01-15', purchase_cost: 2499, location: 'HQ Floor 2', bookable: false, assigned_to_id: 'u-4', department_id: 'd-1' },
  { id: 'a-2', asset_tag: 'AF-0002', name: 'Dell XPS 15', category_id: 'c-1', serial_number: 'DELL-XPS-AF02', condition: 'Good', status: 'Available', purchase_date: '2025-06-10', purchase_cost: 1899, location: 'IT Inventory Room', bookable: false },
  { id: 'a-3', asset_tag: 'AF-0003', name: 'Ergonomic Standing Desk', category_id: 'c-2', serial_number: 'DESK-ERG-AF03', condition: 'Good', status: 'Allocated', purchase_date: '2025-09-01', purchase_cost: 650, location: 'HQ Floor 1', bookable: false, assigned_to_id: 'u-5', department_id: 'd-2' },
  { id: 'a-4', asset_tag: 'AF-0004', name: 'Herman Miller Aeron Chair', category_id: 'c-2', serial_number: 'HM-AER-AF04', condition: 'Good', status: 'Available', purchase_date: '2024-11-12', purchase_cost: 1200, location: 'IT Inventory Room', bookable: false },
  { id: 'a-5', asset_tag: 'AF-0005', name: 'Meeting Room B2 Screen (65")', category_id: 'c-1', serial_number: 'SAMP-65-AF05', condition: 'Good', status: 'Available', purchase_date: '2025-02-20', purchase_cost: 899, location: 'Conference Room B2', bookable: true },
  { id: 'a-6', asset_tag: 'AF-0006', name: 'Tesla Model 3 (Company Car)', category_id: 'c-3', serial_number: 'TSLA-M3-AF06', condition: 'Good', status: 'Under Maintenance', purchase_date: '2024-05-18', purchase_cost: 38000, location: 'HQ Parking Lot A', bookable: true }
];

const defaultAllocations: AssetAllocation[] = [
  { id: 'al-1', asset_id: 'a-1', employee_id: 'u-4', allocation_date: '2026-02-01', expected_return: '2026-12-31', returned: false },
  { id: 'al-2', asset_id: 'a-3', employee_id: 'u-5', allocation_date: '2025-09-05', expected_return: '2026-06-30', returned: false }
];

const defaultMaintenance: MaintenanceRequest[] = [
  { id: 'm-1', asset_id: 'a-6', issue: 'Battery temperature sensor warning on display dashboard.', priority: 'High', status: 'In Progress', created_by: 'u-2', technician: 'Electra Tesla Center', created_at: '2026-07-10T10:00:00Z' }
];

const defaultBookings: Booking[] = [
  { id: 'b-1', asset_id: 'a-5', booked_by: 'u-3', start_time: '2026-07-12T09:00:00Z', end_time: '2026-07-12T10:00:00Z', status: 'Completed', created_at: '2026-07-11T15:00:00Z' }
];

const defaultNotifications: Notification[] = [
  { id: 'n-1', title: 'Asset Assigned', description: 'MacBook Pro 16" (AF-0001) has been assigned to Priya Sharma.', user_id: 'u-4', read: false, created_at: '2026-07-12T08:00:00Z' },
  { id: 'n-2', title: 'Maintenance Ongoing', description: 'Tesla Model 3 (AF-0006) maintenance request approved and technician assigned.', user_id: 'u-2', read: true, created_at: '2026-07-11T12:00:00Z' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const loadData = () => {
      const getLocal = <T,>(key: string, fallback: T): T => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      };

      setUsers(getLocal('af_users', defaultUsers));
      setDepartments(getLocal('af_departments', defaultDepartments));
      setCategories(getLocal('af_categories', defaultCategories));
      setAssets(getLocal('af_assets', defaultAssets));
      setAllocations(getLocal('af_allocations', defaultAllocations));
      setTransfers(getLocal('af_transfers', []));
      setBookings(getLocal('af_bookings', defaultBookings));
      setMaintenance(getLocal('af_maintenance', defaultMaintenance));
      setNotifications(getLocal('af_notifications', defaultNotifications));
      setAudits(getLocal('af_audits', []));
      setAuditItems(getLocal('af_audit_items', []));
      
      const loggedInToken = localStorage.getItem('token');
      if (loggedInToken) {
        // Fetch profile
        getProfileAPI().then(res => {
          if (res.user) {
            setCurrentUser(res.user);
          }
        }).catch(() => {
          localStorage.removeItem('token');
        });
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Sync to LocalStorage helper
  const sync = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Auth Operations
  const login = async (email: string, role?: UserRole) => {
    try {
      const res = await loginAPI(email, 'password123'); // Assuming default password for hackathon
      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        setCurrentUser(res.user);
        return { success: true, message: 'Logged in successfully', user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Login error' };
    }
  };

  const signup = async (name: string, email: string) => {
    try {
      const res = await signupAPI(name, email, 'password123');
      return { success: true, message: 'Account created successfully' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Signup error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  // Notification Helper
  const addSystemNotification = (title: string, description: string, userId: string) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}`,
      title,
      description,
      user_id: userId,
      read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev];
      sync('af_notifications', next);
      return next;
    });
  };

  // CRUD Departments
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `d-${Date.now()}` };
    const next = [...departments, newDept];
    setDepartments(next);
    sync('af_departments', next);
  };

  const updateDepartment = (id: string, updatedFields: Partial<Department>) => {
    const next = departments.map(d => (d.id === id ? { ...d, ...updatedFields } : d));
    setDepartments(next);
    sync('af_departments', next);
  };

  const deleteDepartment = (id: string) => {
    const next = departments.filter(d => d.id !== id);
    setDepartments(next);
    sync('af_departments', next);
  };

  // CRUD Categories
  const addCategory = (cat: Omit<AssetCategory, 'id'>) => {
    const newCat: AssetCategory = { ...cat, id: `c-${Date.now()}` };
    const next = [...categories, newCat];
    setCategories(next);
    sync('af_categories', next);
  };

  const updateCategory = (id: string, updatedFields: Partial<AssetCategory>) => {
    const next = categories.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setCategories(next);
    sync('af_categories', next);
  };

  const deleteCategory = (id: string) => {
    const next = categories.filter(c => c.id !== id);
    setCategories(next);
    sync('af_categories', next);
  };

  // CRUD Employees (Users)
  const addEmployee = (emp: Omit<User, 'id'>) => {
    const newEmp: User = { ...emp, id: `u-${Date.now()}` };
    const next = [...users, newEmp];
    setUsers(next);
    sync('af_users', next);
  };

  const updateEmployee = (id: string, updatedFields: Partial<User>) => {
    const next = users.map(u => (u.id === id ? { ...u, ...updatedFields } : u));
    setUsers(next);
    sync('af_users', next);
    // If updating current user, sync their profile
    if (currentUser && currentUser.id === id) {
      const updatedCurUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedCurUser);
      sync('af_current_user', updatedCurUser);
    }
  };

  const deleteEmployee = (id: string) => {
    const next = users.filter(u => u.id !== id);
    setUsers(next);
    sync('af_users', next);
  };

  // CRUD Assets
  const addAsset = (assetFields: Omit<Asset, 'id' | 'asset_tag' | 'status'>) => {
    const assetCount = assets.length + 1;
    const padNum = String(assetCount).padStart(4, '0');
    const newAsset: Asset = {
      ...assetFields,
      id: `a-${Date.now()}`,
      asset_tag: `AF-${padNum}`,
      status: 'Available'
    };
    const next = [...assets, newAsset];
    setAssets(next);
    sync('af_assets', next);
  };

  const updateAsset = (id: string, updatedFields: Partial<Asset>) => {
    const next = assets.map(a => (a.id === id ? { ...a, ...updatedFields } : a));
    setAssets(next);
    sync('af_assets', next);
  };

  const deleteAsset = (id: string) => {
    const next = assets.filter(a => a.id !== id);
    setAssets(next);
    sync('af_assets', next);
  };

  // ALLOCATION WORKFLOW
  const allocateAsset = (assetId: string, employeeId: string, expectedReturn?: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };
    
    // Check if asset is already allocated
    if (asset.status !== 'Available') {
      const activeAlloc = allocations.find(al => al.asset_id === assetId && !al.returned);
      const holder = activeAlloc ? users.find(u => u.id === activeAlloc.employee_id) : null;
      const holderName = holder ? holder.name : 'another employee';
      return { 
        success: false, 
        message: `Already Allocated: This asset is currently held by ${holderName}. Please raise a Transfer Request instead.` 
      };
    }

    const employee = users.find(u => u.id === employeeId);
    if (!employee) return { success: false, message: 'Employee not found' };

    // Update Asset Status
    const updatedAssets = assets.map(a => 
      a.id === assetId 
        ? { ...a, status: 'Allocated' as AssetStatus, assigned_to_id: employeeId, department_id: employee.department_id } 
        : a
    );
    setAssets(updatedAssets);
    sync('af_assets', updatedAssets);

    // Create Allocation Record
    const newAlloc: AssetAllocation = {
      id: `al-${Date.now()}`,
      asset_id: assetId,
      employee_id: employeeId,
      allocation_date: new Date().toISOString().split('T')[0],
      expected_return: expectedReturn,
      returned: false
    };
    const updatedAllocations = [...allocations, newAlloc];
    setAllocations(updatedAllocations);
    sync('af_allocations', updatedAllocations);

    // Log Notification
    addSystemNotification(
      'Asset Allocated',
      `Asset ${asset.name} (${asset.asset_tag}) has been successfully allocated to ${employee.name}.`,
      employeeId
    );

    return { success: true, message: 'Asset allocated successfully!' };
  };

  const returnAsset = (assetId: string, condition: AssetCondition, notes: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    // Find active allocation
    const activeAllocIdx = allocations.findIndex(al => al.asset_id === assetId && !al.returned);
    if (activeAllocIdx === -1) return { success: false, message: 'No active allocation found for this asset' };

    const empId = allocations[activeAllocIdx].employee_id;

    // Update Allocation Record
    const updatedAllocations = allocations.map((al, idx) => 
      idx === activeAllocIdx 
        ? { ...al, returned: true, return_date: new Date().toISOString().split('T')[0], condition_check: notes } 
        : al
    );
    setAllocations(updatedAllocations);
    sync('af_allocations', updatedAllocations);

    // Update Asset Status back to Available
    const updatedAssets = assets.map(a => 
      a.id === assetId 
        ? { ...a, status: 'Available' as AssetStatus, condition, assigned_to_id: undefined, department_id: undefined } 
        : a
    );
    setAssets(updatedAssets);
    sync('af_assets', updatedAssets);

    addSystemNotification(
      'Asset Returned',
      `Asset ${asset.name} (${asset.asset_tag}) has been returned and marked ${condition}.`,
      empId
    );

    return { success: true, message: 'Asset successfully returned!' };
  };

  const requestTransfer = (assetId: string, toEmployeeId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    // Check who has it
    const activeAlloc = allocations.find(al => al.asset_id === assetId && !al.returned);
    if (!activeAlloc) return { success: false, message: 'This asset is not currently allocated to anyone' };

    const fromEmployeeId = activeAlloc.employee_id;
    if (fromEmployeeId === toEmployeeId) return { success: false, message: 'Cannot transfer an asset to the same employee' };

    const newTransfer: TransferRequest = {
      id: `tr-${Date.now()}`,
      asset_id: assetId,
      from_employee_id: fromEmployeeId,
      to_employee_id: toEmployeeId,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const next = [...transfers, newTransfer];
    setTransfers(next);
    sync('af_transfers', next);

    // Notify target employee and department head
    addSystemNotification(
      'Transfer Request Raised',
      `A request has been made to transfer ${asset.name} to you. Pending manager approval.`,
      toEmployeeId
    );

    return { success: true, message: 'Transfer request submitted successfully. Awaiting approval!' };
  };

  const approveTransfer = (transferId: string) => {
    const req = transfers.find(t => t.id === transferId);
    if (!req) return { success: false, message: 'Transfer request not found' };

    // 1. Mark existing allocation as returned
    const activeAllocIdx = allocations.findIndex(al => al.asset_id === req.asset_id && !al.returned);
    if (activeAllocIdx !== -1) {
      allocations[activeAllocIdx] = {
        ...allocations[activeAllocIdx],
        returned: true,
        return_date: new Date().toISOString().split('T')[0],
        condition_check: 'Transferred'
      };
      sync('af_allocations', allocations);
    }

    // 2. Create new allocation record
    const targetEmp = users.find(u => u.id === req.to_employee_id);
    const newAlloc: AssetAllocation = {
      id: `al-${Date.now()}`,
      asset_id: req.asset_id,
      employee_id: req.to_employee_id,
      allocation_date: new Date().toISOString().split('T')[0],
      returned: false
    };
    const updatedAllocations = [...allocations, newAlloc];
    setAllocations(updatedAllocations);
    sync('af_allocations', updatedAllocations);

    // 3. Update Asset Assigned employee
    const updatedAssets = assets.map(a => 
      a.id === req.asset_id 
        ? { ...a, assigned_to_id: req.to_employee_id, department_id: targetEmp?.department_id } 
        : a
    );
    setAssets(updatedAssets);
    sync('af_assets', updatedAssets);

    // 4. Update Transfer request status
    const updatedTransfers = transfers.map(t => t.id === transferId ? { ...t, status: 'Approved' as TransferStatus } : t);
    setTransfers(updatedTransfers);
    sync('af_transfers', updatedTransfers);

    addSystemNotification(
      'Transfer Approved',
      `Asset transfer approved. The asset is now assigned to ${targetEmp?.name}.`,
      req.to_employee_id
    );

    return { success: true, message: 'Transfer request approved and asset reallocated!' };
  };

  const rejectTransfer = (transferId: string) => {
    const req = transfers.find(t => t.id === transferId);
    if (!req) return { success: false, message: 'Transfer request not found' };

    const updatedTransfers = transfers.map(t => t.id === transferId ? { ...t, status: 'Rejected' as TransferStatus } : t);
    setTransfers(updatedTransfers);
    sync('af_transfers', updatedTransfers);

    addSystemNotification(
      'Transfer Rejected',
      `The transfer request for the asset was rejected by the manager.`,
      req.from_employee_id
    );

    return { success: true, message: 'Transfer request rejected.' };
  };

  // BOOKING WITH OVERLAP VALIDATION
  const bookResource = (assetId: string, start: string, end: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };
    if (!asset.bookable) return { success: false, message: 'This asset is not set as bookable/shared resource' };

    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();

    if (startMs >= endMs) {
      return { success: false, message: 'End time must be after start time' };
    }

    // Overlap validation: check active bookings for the same asset
    const isOverlapping = bookings.some(b => {
      if (b.asset_id !== assetId || b.status === 'Cancelled') return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      
      // (StartA < EndB) and (EndA > StartB)
      return startMs < bEnd && endMs > bStart;
    });

    if (isOverlapping) {
      return { 
        success: false, 
        message: 'Overlap Warning: Two people cannot book the same room/resource at overlapping times. Select another slot.' 
      };
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      asset_id: assetId,
      booked_by: currentUser?.id || 'guest',
      start_time: start,
      end_time: end,
      status: 'Upcoming',
      created_at: new Date().toISOString()
    };

    const next = [...bookings, newBooking];
    setBookings(next);
    sync('af_bookings', next);

    addSystemNotification(
      'Resource Booked',
      `Booking confirmed for ${asset.name} from ${new Date(start).toLocaleString()} to ${new Date(end).toLocaleTimeString()}`,
      currentUser?.id || ''
    );

    return { success: true, message: 'Resource booked successfully!' };
  };

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as BookingStatus } : b);
    setBookings(updatedBookings);
    sync('af_bookings', updatedBookings);
    return { success: true, message: 'Booking cancelled' };
  };

  // MAINTENANCE WORKFLOW
  const raiseMaintenance = (assetId: string, issue: string, priority: MaintenanceRequest['priority']) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    const newReq: MaintenanceRequest = {
      id: `m-${Date.now()}`,
      asset_id: assetId,
      issue,
      priority,
      status: 'Pending',
      created_by: currentUser?.id || 'guest',
      created_at: new Date().toISOString()
    };

    const next = [...maintenance, newReq];
    setMaintenance(next);
    sync('af_maintenance', next);

    // Notify Asset Managers
    users.filter(u => u.role === 'Asset Manager' || u.role === 'Admin').forEach(mgr => {
      addSystemNotification(
        'Maintenance Raised',
        `Maintenance requested for ${asset.name} (${asset.asset_tag}). Issue: ${issue.substring(0, 40)}...`,
        mgr.id
      );
    });

    return { success: true, message: 'Maintenance request submitted! Awaiting approval.' };
  };

  const updateMaintenanceStatus = (requestId: string, status: MaintenanceRequest['status'], technician?: string) => {
    const req = maintenance.find(m => m.id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    const updatedMaintenance = maintenance.map(m => {
      if (m.id === requestId) {
        const updated = { ...m, status };
        if (technician) updated.technician = technician;
        if (status === 'Resolved') updated.resolved_at = new Date().toISOString();
        return updated;
      }
      return m;
    });

    setMaintenance(updatedMaintenance);
    sync('af_maintenance', updatedMaintenance);

    // If approved, update Asset Status to "Under Maintenance"
    if (status === 'Approved') {
      const updatedAssets = assets.map(a => a.id === req.asset_id ? { ...a, status: 'Under Maintenance' as AssetStatus } : a);
      setAssets(updatedAssets);
      sync('af_assets', updatedAssets);
    }
    // If resolved, update Asset Status back to "Available" (or whatever allocation is active)
    else if (status === 'Resolved') {
      const activeAlloc = allocations.find(al => al.asset_id === req.asset_id && !al.returned);
      const newStatus: AssetStatus = activeAlloc ? 'Allocated' : 'Available';

      const updatedAssets = assets.map(a => 
        a.id === req.asset_id 
          ? { ...a, status: newStatus } 
          : a
      );
      setAssets(updatedAssets);
      sync('af_assets', updatedAssets);
    }

    addSystemNotification(
      'Maintenance Status Updated',
      `Maintenance request for asset status transitioned to ${status}.`,
      req.created_by
    );

    return { success: true, message: `Maintenance status updated to ${status}!` };
  };

  // AUDITS SYSTEM
  const createAuditCycle = (name: string, scopeType: 'department' | 'location', scopeValue: string, auditorId: string) => {
    const cycleId = `ac-${Date.now()}`;
    const newCycle: AuditCycle = {
      id: cycleId,
      name,
      scope_type: scopeType,
      scope_value: scopeValue,
      auditor_id: auditorId,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    // Find assets in scope
    let scopedAssets: Asset[] = [];
    if (scopeType === 'department') {
      scopedAssets = assets.filter(a => a.department_id === scopeValue);
    } else {
      scopedAssets = assets.filter(a => a.location.toLowerCase() === scopeValue.toLowerCase());
    }

    if (scopedAssets.length === 0) {
      return { success: false, message: 'No assets found within this audit scope. Select another scope.' };
    }

    const items: AuditItem[] = scopedAssets.map(a => ({
      id: `ai-${Date.now()}-${a.id}`,
      audit_cycle_id: cycleId,
      asset_id: a.id,
      status: 'Pending',
    }));

    const nextAudits = [...audits, newCycle];
    setAudits(nextAudits);
    sync('af_audits', nextAudits);

    const nextItems = [...auditItems, ...items];
    setAuditItems(nextItems);
    sync('af_audit_items', nextItems);

    addSystemNotification(
      'Audit Cycle Assigned',
      `You have been assigned as the auditor for the cycle: ${name}.`,
      auditorId
    );

    return { success: true, message: `Audit cycle created with ${scopedAssets.length} assets assigned.` };
  };

  const updateAuditItem = (itemId: string, status: AuditItem['status'], notes?: string) => {
    const next = auditItems.map(item => 
      item.id === itemId 
        ? { ...item, status, notes, updated_at: new Date().toISOString() } 
        : item
    );
    setAuditItems(next);
    sync('af_audit_items', next);
  };

  const closeAuditCycle = (cycleId: string) => {
    // Lock cycle
    const nextAudits = audits.map(c => c.id === cycleId ? { ...c, status: 'Closed' as const } : c);
    setAudits(nextAudits);
    sync('af_audits', nextAudits);

    // Update missing assets to status: Lost
    const cycleItems = auditItems.filter(item => item.audit_cycle_id === cycleId);
    const missingAssetIds = cycleItems.filter(item => item.status === 'Missing').map(item => item.asset_id);
    const damagedAssetIds = cycleItems.filter(item => item.status === 'Damaged').map(item => item.asset_id);

    if (missingAssetIds.length > 0 || damagedAssetIds.length > 0) {
      const nextAssets = assets.map(a => {
        if (missingAssetIds.includes(a.id)) {
          return { ...a, status: 'Lost' as AssetStatus };
        }
        if (damagedAssetIds.includes(a.id)) {
          return { ...a, condition: 'Broken' as AssetCondition };
        }
        return a;
      });
      setAssets(nextAssets);
      sync('af_assets', nextAssets);
    }

    const cycle = audits.find(c => c.id === cycleId);
    if (cycle) {
      addSystemNotification(
        'Audit Cycle Closed',
        `Discrepancy report finalized for audit ${cycle.name}. Closed successfully.`,
        cycle.auditor_id
      );
    }
  };

  // Notification read/unread mark
  const markNotificationRead = (id: string) => {
    const next = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(next);
    sync('af_notifications', next);
  };

  const clearAllNotifications = () => {
    const next = notifications.map(n => ({ ...n, read: true }));
    setNotifications(next);
    sync('af_notifications', next);
  };

  if (!isLoaded) {
    return null; // Return loading or render nothing until state loads from localStorage
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        departments,
        categories,
        assets,
        allocations,
        transfers,
        bookings,
        maintenance,
        notifications,
        audits,
        auditItems,
        login,
        signup,
        logout,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addCategory,
        updateCategory,
        deleteCategory,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addAsset,
        updateAsset,
        deleteAsset,
        allocateAsset,
        returnAsset,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        bookResource,
        cancelBooking,
        raiseMaintenance,
        updateMaintenanceStatus,
        createAuditCycle,
        updateAuditItem,
        closeAuditCycle,
        markNotificationRead,
        clearAllNotifications,
        addSystemNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
