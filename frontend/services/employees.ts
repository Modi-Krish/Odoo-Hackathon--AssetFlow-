import apiClient from './api';
import { User } from '../types';

export const getEmployees = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/employees');
  return response.data.data;
};

export const getEmployeeById = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/employees/${id}`);
  return response.data.data;
};

export const createEmployee = async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const response = await apiClient.post<User>('/employees', data);
  return response.data.data;
};

export const updateEmployee = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<User>(`/employees/${id}`, data);
  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`/employees/${id}`);
};
