/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './api';
import { Department } from '../types';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<any>('/departments');
  return response.data.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await apiClient.get<any>(`/departments/${id}`);
  return response.data.data;
};

export const createDepartment = async (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  const response = await apiClient.post<any>('/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: string, data: Partial<Department>): Promise<Department> => {
  const response = await apiClient.put<any>(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};
