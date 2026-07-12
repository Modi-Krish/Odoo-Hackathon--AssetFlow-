import apiClient from './api';
import { Department } from '../types';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<Department[]>('/departments');
  return response.data.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await apiClient.get<Department>(`/departments/${id}`);
  return response.data.data;
};

export const createDepartment = async (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  const response = await apiClient.post<Department>('/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: string, data: Partial<Department>): Promise<Department> => {
  const response = await apiClient.put<Department>(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};
