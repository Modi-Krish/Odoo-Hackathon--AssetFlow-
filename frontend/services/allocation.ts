import apiClient from './api';
import { Allocation, Transfer } from '../types/allocation';

export const allocateAsset = async (data: Omit<Allocation, 'id' | 'status' | 'allocationDate'>): Promise<Allocation> => {
  const response = await apiClient.post<any>(`/allocation`, data);
  return response.data.data;
};

export const returnAsset = async (id: string): Promise<Allocation> => {
  const response = await apiClient.put<any>(`/allocation/return`, { id });
  return response.data.data;
};

export const getAllocationHistory = async (): Promise<Allocation[]> => {
  const response = await apiClient.get<any>(`/allocation/history`);
  return response.data.data;
};

export const requestTransfer = async (data: Omit<Transfer, 'id' | 'status'>): Promise<Transfer> => {
  const response = await apiClient.post<any>(`/allocation/transfer`, data);
  return response.data.data;
};

export const approveTransfer = async (id: string): Promise<Transfer> => {
  const response = await apiClient.put<any>(`/allocation/transfer/approve`, { id });
  return response.data.data;
};

export const rejectTransfer = async (id: string): Promise<Transfer> => {
  const response = await apiClient.put<any>(`/allocation/transfer/reject`, { id });
  return response.data.data;
};

export const getPendingTransfers = async (): Promise<Transfer[]> => {
  const response = await apiClient.get<any>(`/allocation/transfer/pending`);
  return response.data.data;
};

