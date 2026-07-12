import apiClient from './api';
import { Booking } from '../types';

export const createBooking = async (data: Omit<Booking, 'id' | 'status' | 'created_at'>): Promise<Booking> => {
  const response = await apiClient.post<any>(`/bookings`, data);
  return response.data.data;
};

export const getBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<any>(`/bookings`);
  return response.data.data;
};

export const cancelBooking = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<any>(`/bookings`, {
    data: { id }
  });
  return response.data.data;
};
