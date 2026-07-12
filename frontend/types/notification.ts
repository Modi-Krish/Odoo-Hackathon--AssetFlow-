export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  status: 'Read' | 'Unread';
  type: 'assignment' | 'maintenance' | 'booking' | 'system';
}
