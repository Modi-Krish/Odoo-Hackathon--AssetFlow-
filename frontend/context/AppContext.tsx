/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Department, AssetCategory, Asset, AssetAllocation,
  TransferRequest, Booking, MaintenanceRequest, Notification,
  AuditCycle, AuditItem, UserRole, AssetStatus, AssetCondition,
  TransferStatus, BookingStatus
} from '../types';

import { loginAPI, signupAPI, getProfileAPI } from '../services/auth';
import { getDepartments, createDepartment, updateDepartment as updateDepartmentAPI, deleteDepartment as deleteDepartmentAPI } from '../services/departments';
import { getCategories, createCategory, updateCategory as updateCategoryAPI, deleteCategory as deleteCategoryAPI } from '../services/categories';
import { getEmployees, createEmployee, updateEmployee as updateEmployeeAPI, deleteEmployee as deleteEmployeeAPI } from '../services/employees';
import { getAssets, createAsset, updateAsset as updateAssetAPI, deleteAsset as deleteAssetAPI } from '../services/assets';
import { allocateAsset as allocateAssetAPI, returnAsset as returnAssetAPI, requestTransfer as requestTransferAPI, approveTransfer as approveTransferAPI, rejectTransfer as rejectTransferAPI, getPendingTransfers, getAllocationHistory } from '../services/allocation';
import { getBookings, createBooking, cancelBooking as cancelBookingAPI } from '../services/booking';
import { getMaintenanceRequests, createMaintenanceRequest, approveMaintenance, rejectMaintenance } from '../services/maintenance';
import { getNotifications, markAsRead } from '../services/notifications';
import { clearTokenCookie, setTokenCookie } from '../services/api';

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
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // CRUD Actions
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<AssetCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<AssetCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addEmployee: (employee: Omit<User, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<User>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  addAsset: (asset: Omit<Asset, 'id' | 'asset_tag' | 'status'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  // Workflow Actions
  allocateAsset: (assetId: string, employeeId: string, expectedReturn?: string) => Promise<{ success: boolean; message: string }>;
  returnAsset: (assetId: string, condition: AssetCondition, notes: string) => Promise<{ success: boolean; message: string }>;
  requestTransfer: (assetId: string, toEmployeeId: string) => Promise<{ success: boolean; message: string }>;
  approveTransfer: (transferId: string) => Promise<{ success: boolean; message: string }>;
  rejectTransfer: (transferId: string) => Promise<{ success: boolean; message: string }>;
  
  // Bookings
  bookResource: (assetId: string, start: string, end: string) => Promise<{ success: boolean; message: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  
  // Maintenance
  raiseMaintenance: (assetId: string, issue: string, priority: MaintenanceRequest['priority']) => Promise<{ success: boolean; message: string }>;
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest['status'], technician?: string) => Promise<{ success: boolean; message: string }>;
  
  // Audits
  createAuditCycle: (name: string, scopeType: 'department' | 'location', scopeValue: string, auditorId: string) => Promise<{ success: boolean; message: string }>;
  updateAuditItem: (itemId: string, status: AuditItem['status'], notes?: string) => Promise<void>;
  closeAuditCycle: (cycleId: string) => Promise<void>;
  
  // Notification utilities
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => void;
  addSystemNotification: (title: string, description: string, userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileRes = await getProfileAPI();
          if (profileRes.user) {
            setCurrentUser(profileRes.user);
          } else {
            localStorage.removeItem('token');
            clearTokenCookie();
          }
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('token');
          clearTokenCookie();
        }
      }
      setIsLoaded(true);
    };
    initAuth();
  }, []);

  // Hydrate Data on Login
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser) return;
      try {
        const [
          fetchedUsers,
          fetchedDepts,
          fetchedCats,
          fetchedAssets,
          fetchedMaint,
          fetchedAlloc,
          fetchedTransfers,
          fetchedBookings,
          fetchedNotifs
        ] = await Promise.all([
          getEmployees().catch(() => []),
          getDepartments().catch(() => []),
          getCategories().catch(() => []),
          getAssets().catch(() => []),
          getMaintenanceRequests().catch(() => []),
          getAllocationHistory().catch(() => []),
          getPendingTransfers().catch(() => []),
          getBookings().catch(() => []),
          getNotifications().catch(() => [])
        ]);

        setUsers(fetchedUsers);
        setDepartments(fetchedDepts);
        setCategories(fetchedCats);
        setAssets(fetchedAssets);
        setMaintenance(fetchedMaint);
        setAllocations(fetchedAlloc as unknown as AssetAllocation[]);
        setTransfers(fetchedTransfers as unknown as TransferRequest[]);
        setBookings(fetchedBookings as unknown as Booking[]);
        setNotifications(fetchedNotifs as unknown as Notification[]);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  // Auth Operations
  const login = async (email: string, password?: string) => {
    try {
      const res = await loginAPI(email, password);
      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        setTokenCookie(res.token);
        setCurrentUser(res.user);
        return { success: true, message: 'Logged in successfully', user: res.user };
      }
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name: string, email: string, password?: string) => {
    try {
      const res = await signupAPI(name, email, password);
      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    clearTokenCookie();
    setUsers([]);
    setDepartments([]);
    setCategories([]);
    setAssets([]);
  };

  // Notification Helper
  const addSystemNotification = (title: string, description: string, userId: string) => {
    // Ideally this goes to backend, but sticking to interface for now
  };

  // CRUD Departments
  const addDepartment = async (dept: Omit<Department, 'id'>) => {
    try {
      const newDept = await createDepartment(dept as unknown as any);
      setDepartments(prev => [...prev, newDept]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateDepartment = async (id: string, updatedFields: Partial<Department>) => {
    try {
      const updated = await updateDepartmentAPI(id, updatedFields);
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await deleteDepartmentAPI(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // CRUD Categories
  const addCategory = async (cat: Omit<AssetCategory, 'id'>) => {
    try {
      const newCat = await createCategory(cat as unknown as any);
      setCategories(prev => [...prev, newCat]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<AssetCategory>) => {
    try {
      const updated = await updateCategoryAPI(id, updatedFields);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryAPI(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // CRUD Employees
  const addEmployee = async (emp: Omit<User, 'id'>) => {
    try {
      const newEmp = await createEmployee(emp as unknown as any);
      setUsers(prev => [...prev, newEmp]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateEmployee = async (id: string, updatedFields: Partial<User>) => {
    try {
      const updated = await updateEmployeeAPI(id, updatedFields);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteEmployeeAPI(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // CRUD Assets
  const addAsset = async (asset: Omit<Asset, 'id' | 'asset_tag' | 'status'>) => {
    try {
      const newAsset = await createAsset(asset as unknown as any);
      setAssets(prev => [...prev, newAsset]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAsset = async (id: string, updatedFields: Partial<Asset>) => {
    try {
      const updated = await updateAssetAPI(id, updatedFields);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await deleteAssetAPI(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Workflow Actions
  const allocateAsset = async (assetId: string, employeeId: string, expectedReturn?: string) => {
    try {
      const res = await allocateAssetAPI({ assetId, employeeId, expectedReturn } as unknown as any);
      // Trigger a re-fetch of assets and allocations here for simplicity
      const [fetchedAssets, fetchedAlloc] = await Promise.all([getAssets(), getAllocationHistory()]);
      setAssets(fetchedAssets);
      setAllocations(fetchedAlloc as unknown as AssetAllocation[]);
      return { success: true, message: 'Asset allocated' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Allocation failed' };
    }
  };

  const returnAsset = async (assetId: string, condition: AssetCondition, notes: string) => {
    try {
      await returnAssetAPI(assetId);
      const [fetchedAssets, fetchedAlloc] = await Promise.all([getAssets(), getAllocationHistory()]);
      setAssets(fetchedAssets);
      setAllocations(fetchedAlloc as unknown as AssetAllocation[]);
      return { success: true, message: 'Asset returned' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Return failed' };
    }
  };

  const requestTransfer = async (assetId: string, toEmployeeId: string) => {
    try {
      await requestTransferAPI({ assetId, toEmployeeId } as unknown as any);
      const fetchedTransfers = await getPendingTransfers();
      setTransfers(fetchedTransfers as unknown as TransferRequest[]);
      return { success: true, message: 'Transfer requested' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Transfer request failed' };
    }
  };

  const approveTransfer = async (transferId: string) => {
    try {
      await approveTransferAPI(transferId);
      const [fetchedAssets, fetchedTransfers] = await Promise.all([getAssets(), getPendingTransfers()]);
      setAssets(fetchedAssets);
      setTransfers(fetchedTransfers as unknown as TransferRequest[]);
      return { success: true, message: 'Transfer approved' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Approval failed' };
    }
  };

  const rejectTransfer = async (transferId: string) => {
    try {
      await rejectTransferAPI(transferId);
      const fetchedTransfers = await getPendingTransfers();
      setTransfers(fetchedTransfers as unknown as TransferRequest[]);
      return { success: true, message: 'Transfer rejected' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Rejection failed' };
    }
  };

  const bookResource = async (assetId: string, start: string, end: string) => {
    try {
      await createBooking({ assetId, start_time: start, end_time: end } as unknown as any);
      const fetchedBookings = await getBookings();
      setBookings(fetchedBookings as unknown as Booking[]);
      return { success: true, message: 'Resource booked' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Booking failed' };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await cancelBookingAPI(bookingId);
      const fetchedBookings = await getBookings();
      setBookings(fetchedBookings as unknown as Booking[]);
      return { success: true, message: 'Booking cancelled' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Cancellation failed' };
    }
  };

  const raiseMaintenance = async (assetId: string, issue: string, priority: MaintenanceRequest['priority']) => {
    try {
      await createMaintenanceRequest({ assetId, issue, priority } as unknown as any);
      const fetchedMaint = await getMaintenanceRequests();
      setMaintenance(fetchedMaint);
      return { success: true, message: 'Maintenance ticket created' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create ticket' };
    }
  };

  const updateMaintenanceStatus = async (requestId: string, status: MaintenanceRequest['status'], technician?: string) => {
    try {
      if (status === 'Approved') await approveMaintenance(requestId);
      else if (status === 'Rejected') await rejectMaintenance(requestId);
      // For other statuses we might need an update API which isn't there yet, handle later.
      const fetchedMaint = await getMaintenanceRequests();
      setMaintenance(fetchedMaint);
      return { success: true, message: 'Status updated' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  const createAuditCycle = async (name: string, scopeType: 'department' | 'location', scopeValue: string, auditorId: string) => {
    return { success: true, message: 'Not implemented' };
  };

  const updateAuditItem = async (itemId: string, status: AuditItem['status'], notes?: string) => {};
  const closeAuditCycle = async (cycleId: string) => {};

  const markNotificationRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, categories, assets, allocations, transfers, bookings,
      maintenance, notifications, audits, auditItems,
      login, signup, logout,
      addDepartment, updateDepartment, deleteDepartment,
      addCategory, updateCategory, deleteCategory,
      addEmployee, updateEmployee, deleteEmployee,
      addAsset, updateAsset, deleteAsset,
      allocateAsset, returnAsset, requestTransfer, approveTransfer, rejectTransfer,
      bookResource, cancelBooking,
      raiseMaintenance, updateMaintenanceStatus,
      createAuditCycle, updateAuditItem, closeAuditCycle,
      markNotificationRead, clearAllNotifications, addSystemNotification
    }}>
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
