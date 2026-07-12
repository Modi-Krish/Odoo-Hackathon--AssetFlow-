'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge, showToast } from '@/components/UI';
import { Bell, Check, Clock, Eye, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    currentUser, 
    users 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!currentUser) return null;

  // Filter notifications for this specific user
  const userNotifications = notifications.filter(n => n.user_id === currentUser.id);

  const displayedNotifications = filter === 'unread' 
    ? userNotifications.filter(n => !n.read) 
    : userNotifications;

  const handleReadClick = (id: string) => {
    markNotificationRead(id);
    showToast('Alert marked as read', 'info');
  };

  const handleClear = () => {
    if (userNotifications.length === 0) return;
    clearAllNotifications();
    showToast('Cleared all notifications', 'success');
  };

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
        
        {userNotifications.some(n => !n.read) && (
          <Button onClick={handleClear} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
            <Check size={14} /> Mark All as Read
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
                <Badge content={String(userNotifications.length)} />
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${filter === 'unread' ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span>Unread Alerts</span>
                <Badge content={String(userNotifications.filter(n => !n.read).length)} />
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

          <div className="divide-y divide-slate-800/40 space-y-4">
            {displayedNotifications.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-12 text-center font-semibold">
                No notifications logged matching this filter.
              </p>
            ) : (
              displayedNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`
                    pt-4 first:pt-0 flex items-start gap-4 transition-all
                    ${notif.read ? 'opacity-65' : ''}
                  `}
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${notif.read ? 'bg-slate-900 border-slate-850 text-slate-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                    <Bell size={16} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-300' : 'text-indigo-400'}`}>{notif.title}</h4>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-600" />
                        <span className="text-[10px] text-slate-600 font-semibold">{new Date(notif.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{notif.description}</p>
                    
                    {!notif.read && (
                      <button 
                        onClick={() => handleReadClick(notif.id)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 mt-2 flex items-center gap-1"
                      >
                        <Check size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
