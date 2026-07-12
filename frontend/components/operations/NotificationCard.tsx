import React from 'react';
import { Notification } from '../../types/notification';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete
}) => {
  const getIconAndClass = (type: string) => {
    switch (type) {
      case 'assignment':
        return {
          icon: '📦',
          bg: 'bg-blue-50 dark:bg-blue-950/30'
        };
      case 'maintenance':
        return {
          icon: '🔧',
          bg: 'bg-amber-50 dark:bg-amber-950/30'
        };
      case 'booking':
        return {
          icon: '📅',
          bg: 'bg-indigo-50 dark:bg-indigo-950/30'
        };
      default:
        return {
          icon: '🔔',
          bg: 'bg-gray-50 dark:bg-gray-800'
        };
    }
  };

  const { icon, bg } = getIconAndClass(notification.type);

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isUnread = notification.status === 'Unread';

  return (
    <div
      className={`flex items-start justify-between rounded-xl border p-5 shadow-sm transition-all duration-300 ${
        isUnread
          ? 'border-indigo-100 bg-indigo-50/10 dark:border-indigo-950/40 dark:bg-indigo-950/5'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
    >
      <div className="flex gap-4">
        {/* Emoji Icon Badge */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${bg}`}>
          {icon}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-bold ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {notification.title}
            </h4>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
              isUnread
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {notification.status}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notification.message}
          </p>

          <span className="block text-xs text-gray-400 dark:text-gray-500 pt-1">
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="rounded-lg p-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            title="Mark as Read"
          >
            Mark Read
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(notification.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
            title="Delete"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
