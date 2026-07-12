import axios from 'axios';
import { Booking } from '../types/booking';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const createBooking = async (data: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
  const response = await axios.post<Booking>(`${API_BASE_URL}/bookings`, data);
  return response.data;
};

export const getBookings = async (): Promise<Booking[]> => {
  const response = await axios.get<Booking[]>(`${API_BASE_URL}/bookings`);
  return response.data;
};

export const cancelBooking = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete<{ success: boolean }>(`${API_BASE_URL}/bookings`, {
    data: { id } // standard REST delete with body, or can be query ?id=
  });
  return response.data;
};
