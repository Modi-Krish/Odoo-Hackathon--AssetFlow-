'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, showToast } from '@/components/UI';
import { Bell, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, clearAllNotifications } = useApp();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Alerts' | 'Approvals' | 'Bookings'>('All');

  const handleClear = () => {
    clearAllNotifications();
    showToast('Activity feed cleared', 'success');
  };

  // Seed default items with metadata matching Screen 10 precisely
  const notificationItems = [
    { 
      id: 'n-1', 
      text: 'Laptop AF-0014 assigned to Priya shah', 
      category: 'Bookings', // assignments category
      time: '2m ago', 
      color: 'bg-indigo-600 shadow-[0_0_8px_#6c63ff]' 
    },
    { 
      id: 'n-2', 
      text: 'Maintenance request AF-0055 approved', 
      category: 'Approvals', 
      time: '18m ago', 
      color: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
    },
    { 
      id: 'n-3', 
      text: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM', 
      category: 'Bookings', 
      time: '1h ago', 
      color: 'bg-indigo-600 shadow-[0_0_8px_#6c63ff]' 
    },
    { 
      id: 'n-4', 
      text: 'Transfer approved : AF-0033 to facilities dept', 
      category: 'Approvals', 
      time: '3h ago', 
      color: 'bg-rose-600 shadow-[0_0_8px_#e11d48]' 
    },
    { 
      id: 'n-5', 
      text: 'Overdue return : AF-0021 was due 3 days ago', 
      category: 'Alerts', 
      time: '1d ago', 
      color: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' 
    },
    { 
      id: 'n-6', 
      text: 'audit discrepancy flagged : AF-0088 damaged', 
      category: 'Alerts', 
      time: '2d ago', 
      color: 'bg-slate-500 shadow-[0_0_8px_#64748b]' 
    }
  ];

  // Dynamic filter
  const filteredNotifications = activeFilter === 'All'
    ? notificationItems
    : notificationItems.filter(item => item.category === activeFilter);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Bell className="text-indigo-600 animate-float" size={22} />
            <span>Activity logs & Notifications</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Chronological operational timeline and warning updates</p>
        </div>
        <Button onClick={handleClear} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider">
          <Check size={14} /> Clear logs
        </Button>
      </div>

      <Card className="max-w-3xl bg-slate-900 border-none shadow-extruded p-6">
        
        {/* Screen 10 Tab Filters Header */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900 shadow-inset mb-6 gap-2 border-none max-w-md">
          {(['All', 'Alerts', 'Approvals', 'Bookings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none ${activeFilter === tab ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Screen 10 Roster Timeline */}
        <div className="space-y-4 pl-1 font-bold text-xs">
          {filteredNotifications.length === 0 ? (
            <p className="text-slate-400 italic py-6 text-center">No recent records under this filter.</p>
          ) : (
            filteredNotifications.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 shadow-extruded-sm border border-slate-700/5 hover:translate-x-0.5 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {/* Category dot shape */}
                  <div className={`w-2.5 h-2.5 rounded bg-indigo-600 ${item.color}`} />
                  <span className="text-slate-100 leading-relaxed normal-case">{item.text}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium select-none ml-4 flex-shrink-0">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>

      </Card>

    </div>
  );
}
