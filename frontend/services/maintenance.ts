import axios from 'axios';
import { Maintenance } from '../types/maintenance';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const createMaintenance = async (data: Omit<Maintenance, 'id' | 'status'>): Promise<Maintenance> => {
  const response = await axios.post<Maintenance>(`${API_BASE_URL}/maintenance`, data);
  return response.data;
};

export const getMaintenance = async (): Promise<Maintenance[]> => {
  const response = await axios.get<Maintenance[]>(`${API_BASE_URL}/maintenance`);
  return response.data;
};

export const approveMaintenance = async (id: string): Promise<Maintenance> => {
  const response = await axios.put<Maintenance>(`${API_BASE_URL}/maintenance/approve`, { id });
  return response.data;
};

export const rejectMaintenance = async (id: string): Promise<Maintenance> => {
  const response = await axios.put<Maintenance>(`${API_BASE_URL}/maintenance/reject`, { id });
  return response.data;
};
