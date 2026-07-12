import apiClient from './api';
import { Asset } from '../types';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const getAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets');
  return response.data;
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> => {
  const response = await apiClient.post<Asset>('/assets', data);
  return response.data;
};

export const updateAsset = async (id: string, data: Partial<Asset>): Promise<Asset> => {
  const response = await apiClient.put<Asset>(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: string): Promise<void> => {
  await apiClient.delete(`/assets/${id}`);
};
