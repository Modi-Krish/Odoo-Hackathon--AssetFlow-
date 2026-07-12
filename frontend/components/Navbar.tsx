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
    <header className="h-20 bg-slate-900/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_12px_-2px_rgba(163,177,198,0.2)] border-b border-white/20">
      {/* Title */}
      <div className="hidden md:block">
        <h1 className="text-base font-extrabold text-slate-100 tracking-tight font-display leading-tight">{getPageTitle()}</h1>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">Enterprise Resource Portal</p>
      </div>
      <div className="md:hidden w-10 h-10" />

      {/* Right Action Icons */}
      <div className="flex items-center gap-4.5">
        
        {/* Hackathon Role Switcher Helper */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-4.5 py-3 rounded-2xl bg-slate-900 text-slate-200 hover:text-indigo-600 shadow-extruded hover:shadow-extruded-sm active:shadow-inset-sm transition-all text-xs font-bold border-none"
          >
            <UserIcon size={14} className="text-slate-300" />
            <span className="hidden sm:inline text-slate-200">{currentUser.name.split(' ')[0]}</span>
            <span className="text-[9px] text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-500/10 font-black tracking-wide border border-indigo-500/10">{currentUser.role}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border-none p-2 shadow-extruded z-50 animate-fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-700/20 mb-1.5">
                <p className="text-xs font-bold text-slate-100">Quick Switch Role</p>
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">Demo Sandbox Utility</p>
              </div>
              <div className="space-y-1">
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white text-slate-300 transition-all shadow-none border-none hover:shadow-none hover:translate-y-0"
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <Check size={12} className="text-indigo-600 group-hover:text-white" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-700/20 mt-1.5 pt-1.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all border-none shadow-none hover:shadow-none"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown (tactile circular button) */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-3 bg-slate-900 rounded-full text-slate-300 hover:text-indigo-600 shadow-extruded hover:shadow-extruded-sm active:shadow-inset-sm transition-all border-none relative"
          >
            <Bell size={16} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_#6c63ff]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-[24px] bg-slate-900 p-3 shadow-extruded border-none z-50 flex flex-col max-h-96 animate-fade-in">
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-700/20 mb-1.5">
                <span className="text-xs font-bold text-slate-100">Notifications ({unreadNotifications.length})</span>
                {unreadNotifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] text-indigo-600 hover:text-indigo-500 font-extrabold uppercase tracking-wide border-none shadow-none hover:shadow-none bg-transparent hover:translate-y-0"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 py-1 divide-y divide-slate-700/10">
                {unreadNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-300 text-xs italic font-bold">
                    No new notifications
                  </div>
                ) : (
                  unreadNotifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotifClick(n.id)}
                      className="p-3 hover:bg-slate-850/40 transition-all cursor-pointer group rounded-xl"
                    >
                      <h4 className="text-xs font-bold text-indigo-600 group-hover:text-indigo-500">{n.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-semibold">{n.description}</p>
                      <span className="text-[9px] text-slate-400 block mt-2 font-bold">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
