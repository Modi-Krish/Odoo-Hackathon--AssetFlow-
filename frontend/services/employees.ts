import apiClient from './api';
import { User } from '../types';

export const getEmployees = async (): Promise<User[]> => {
  const response = await apiClient.get<any>('/employees');
  return response.data.data;
};

export const getEmployeeById = async (id: string): Promise<User> => {
  const response = await apiClient.get<any>(`/employees/${id}`);
  return response.data.data;
};

export const createEmployee = async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const response = await apiClient.post<any>('/employees', data);
  return response.data.data;
};

export const updateEmployee = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<any>(`/employees/${id}`, data);
  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`/employees/${id}`);
};
