import apiClient from './api';
import { AssetCategory } from '../types';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const getCategories = async (): Promise<AssetCategory[]> => {
  const response = await apiClient.get<AssetCategory[]>('/categories');
  return response.data.data;
};

export const getCategoryById = async (id: string): Promise<AssetCategory> => {
  const response = await apiClient.get<AssetCategory>(`/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (data: Omit<AssetCategory, 'id' | 'created_at' | 'updated_at'>): Promise<AssetCategory> => {
  const response = await apiClient.post<AssetCategory>('/categories', data);
  return response.data.data;
};

export const updateCategory = async (id: string, data: Partial<AssetCategory>): Promise<AssetCategory> => {
  const response = await apiClient.put<AssetCategory>(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
