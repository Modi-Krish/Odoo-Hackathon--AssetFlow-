import axios from 'axios';
import { Allocation } from '../types/allocation';

// Use environment variable or default to localhost for API base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const allocateAsset = async (data: Omit<Allocation, 'id' | 'status' | 'allocationDate'>): Promise<Allocation> => {
  const response = await axios.post<Allocation>(`${API_BASE_URL}/allocation`, data);
  return response.data;
};

export const returnAsset = async (id: string): Promise<Allocation> => {
  const response = await axios.put<Allocation>(`${API_BASE_URL}/allocation/return`, { id });
  return response.data;
};

export const getAllocationHistory = async (): Promise<Allocation[]> => {
  const response = await axios.get<Allocation[]>(`${API_BASE_URL}/allocation/history`);
  return response.data;
};
