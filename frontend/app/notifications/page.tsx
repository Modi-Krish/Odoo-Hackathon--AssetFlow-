'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, showToast } from '@/components/UI';
import { Notification } from '../../types/notification';
import { getNotifications, markAsRead, deleteNotification } from '../../services/notifications';
import { NotificationCard } from '../../components/operations/NotificationCard';
import { Bell } from 'lucide-react';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-01',
    title: 'Asset Assigned',
    message: 'Dell XPS Laptop-01 has been assigned to John Doe.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: 'Unread',
    type: 'assignment'
  },
  {
    id: 'not-02',
    title: 'Maintenance Approved',
    message: 'Repair request for Monitor-01 has been approved.',
    createdAt: new Date().toISOString(), // Today
    status: 'Read',
    type: 'maintenance'
  },
  {
    id: 'not-03',
    title: 'Resource Booking Confirmed',
    message: 'Testing Lab booking for July 15, 2026 is confirmed.',
    createdAt: new Date().toISOString(), // Today
    status: 'Unread',
    type: 'booking'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
      }
    } catch (err) {
      console.warn('API error fetching notifications, loading mock notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notice as read
  const handleMarkRead = async (id: string) => {
    try {
      setLoading(true);
      const updated = await markAsRead(id);
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === id ? updated : n))
      );
      showToast('Notification marked as read', 'info');
    } catch (err) {
      console.warn('API error on read update, using fallback', err);
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === id ? { ...n, status: 'Read' } : n))
      );
      showToast('Notification marked as read (mock)', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteNotification(id);
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id));
      showToast('Notification deleted', 'success');
    } catch (err) {
      console.warn('API error on delete, using fallback', err);
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id));
      showToast('Notification deleted (mock)', 'success');
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const unread = notifications.filter((n: Notification) => n.status === 'Unread');
    if (unread.length === 0) return;
    unread.forEach((n: Notification) => handleMarkRead(n.id));
    showToast('All notifications marked as read', 'success');
  };

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n: Notification) => n.status === 'Unread')
    : notifications;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="text-indigo-400" size={22} />
            <span>Activity Logs & Notifications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Chronological audit stream of asset handoffs, work orders, scheduling reminders, and system alerts.</p>
        </div>
        
        {notifications.some((n: Notification) => n.status === 'Unread') && (
          <Button onClick={handleMarkAllRead} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter and Content section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filter controls column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-3 bg-slate-950/40 border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Filter Alerts</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('all')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${filter === 'all' ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span>All Activities</span>
                <Badge content={String(notifications.length)} />
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${filter === 'unread' ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span>Unread Alerts</span>
                <Badge content={String(notifications.filter((n: Notification) => n.status === 'Unread').length)} />
              </button>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="text-xs leading-relaxed text-slate-500 space-y-2 p-4 border-slate-850">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Notification Info</h4>
            <p>Notifications are generated automatically based on actions taken inside Asset Allocation, Resource Booking, and Maintenance workflows.</p>
          </Card>
        </div>

        {/* Notifications list feed */}
        <Card className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {filter === 'unread' ? 'Unread System Alerts' : 'Chronological Feed'}
            </span>
          </div>

          {loading && notifications.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          )}

          <div className="space-y-4">
            {displayedNotifications.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-12 text-center font-semibold">
                No notifications logged matching this filter.
              </p>
            ) : (
              displayedNotifications.map((notif: Notification) => (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
