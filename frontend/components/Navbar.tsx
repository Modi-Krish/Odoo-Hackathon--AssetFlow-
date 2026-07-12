'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, ChevronDown, Check, User as UserIcon } from 'lucide-react';
import { Badge, showToast } from './UI';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, logout, notifications, markNotificationRead, clearAllNotifications, login } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!currentUser) return null;

  const unreadNotifications = notifications.filter(n => !n.read && n.user_id === currentUser.id);

  // Derive page title from pathname
  const getPageTitle = () => {
    if (!pathname) return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    
    const primaryPath = parts[0];
    const map: Record<string, string> = {
      dashboard: 'Dashboard Overview',
      assets: 'Assets Management',
      allocation: 'Asset Allocation & Returns',
      booking: 'Resource Scheduling',
      maintenance: 'Maintenance Workflows',
      departments: 'Departments Administration',
      categories: 'Asset Categories Config',
      employees: 'Employee Directory',
      reports: 'Reports & Analytics',
      notifications: 'Activity Log & Notifications',
    };
    return map[primaryPath] || primaryPath.charAt(0).toUpperCase() + primaryPath.slice(1);
  };

  const handleRoleSwitch = async (role: UserRole) => {
    const res = await login(currentUser.email, role);
    if (res.success) {
      showToast(`Switched view to: ${role}`, 'info');
      setProfileOpen(false);
    }
  };

  const handleNotifClick = (id: string) => {
    markNotificationRead(id);
  };

  const handleClearAll = () => {
    clearAllNotifications();
    showToast('All notifications marked as read', 'success');
    setNotifOpen(false);
  };

  const rolesList: UserRole[] = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];

  return (
    <header className="h-20 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-bold text-slate-100 tracking-wide">{getPageTitle()}</h1>
        <p className="text-[11px] text-slate-500 font-medium">Enterprise Resource Portal</p>
      </div>
      <div className="md:hidden w-10 h-10" /> {/* Spacer on mobile for absolute hamburger menu */}

      {/* Right Action Icons */}
      <div className="flex items-center gap-4">
        
        {/* Hackathon Role Switcher Helper */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all text-xs font-semibold"
          >
            <UserIcon size={14} className="text-slate-400" />
            <span className="hidden sm:inline text-slate-200">{currentUser.name.split(' ')[0]}</span>
            <span className="text-[10px] text-indigo-400 px-1.5 py-0.5 rounded-md bg-indigo-500/10 font-bold border border-indigo-500/20">{currentUser.role}</span>
            <ChevronDown size={12} className="text-slate-500" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-300">Quick Switch Role</p>
                <p className="text-[10px] text-slate-500">Demo hackathon helper utility</p>
              </div>
              <div className="space-y-0.5">
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs font-medium hover:bg-indigo-600 hover:text-white text-slate-400 transition-all"
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <Check size={12} className="text-indigo-400 group-hover:text-white" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all relative"
          >
            <Bell size={18} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 flex flex-col max-h-96">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">Notifications ({unreadNotifications.length})</span>
                {unreadNotifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 py-1 divide-y divide-slate-800/40">
                {unreadNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No new notifications
                  </div>
                ) : (
                  unreadNotifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotifClick(n.id)}
                      className="p-3 hover:bg-slate-800/40 transition-all cursor-pointer group"
                    >
                      <h4 className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.description}</p>
                      <span className="text-[9px] text-slate-600 block mt-1.5">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
