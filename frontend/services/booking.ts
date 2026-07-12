import apiClient from './api';
import { Booking } from '../types';

export const createBooking = async (data: Omit<Booking, 'id' | 'status' | 'created_at'>): Promise<Booking> => {
  const response = await apiClient.post<Booking>(`/bookings`, data);
  return response.data.data;
};

export const getBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>(`/bookings`);
  return response.data.data;
};

export const cancelBooking = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/bookings`, {
    data: { id }
  });
  return response.data.data;
};
