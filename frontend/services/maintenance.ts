import apiClient from './api';
import { MaintenanceRequest as Maintenance } from '../types';

export const createMaintenanceRequest = async (data: Omit<Maintenance, 'id' | 'status' | 'created_at'>): Promise<Maintenance> => {
  const response = await apiClient.post<Maintenance>(`/maintenance`, data);
  return response.data.data;
};

export const getMaintenanceRequests = async (): Promise<Maintenance[]> => {
  const response = await apiClient.get<Maintenance[]>(`/maintenance`);
  return response.data.data;
};

export const approveMaintenance = async (id: string): Promise<Maintenance> => {
  const response = await apiClient.put<Maintenance>(`/maintenance/approve`, { id });
  return response.data.data;
};

export const rejectMaintenance = async (id: string): Promise<Maintenance> => {
  const response = await apiClient.put<Maintenance>(`/maintenance/reject`, { id });
  return response.data.data;
};
