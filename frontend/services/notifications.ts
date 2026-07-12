import axios from 'axios';
import { Notification } from '../types/notification';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await axios.get<Notification[]>(`${API_BASE_URL}/notifications`);
  return response.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await axios.put<Notification>(`${API_BASE_URL}/notifications/read`, { id });
  return response.data;
};

export const deleteNotification = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete<{ success: boolean }>(`${API_BASE_URL}/notifications`, {
    data: { id }
  });
  return response.data;
};
