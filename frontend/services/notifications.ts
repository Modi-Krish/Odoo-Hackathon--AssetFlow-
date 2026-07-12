import apiClient from './api';
import { Notification } from '../types/notification';

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<{ success: boolean; data: Notification[] }>('/notifications');
  return response.data.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.patch<{ success: boolean; data: Notification }>(
    `/notifications/${id}/read`
  );
  return response.data.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

