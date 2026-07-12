'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Building2, 
  Tags, 
  Users, 
  Package, 
  CalendarRange, 
  Calendar, 
  Wrench, 
  BarChart3, 
  Bell, 
  ChevronRight, 
  Menu, 
  X 
} from 'lucide-react';
import { Badge } from './UI';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Assets Directory', path: '/assets', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Asset Allocation', path: '/allocation', icon: CalendarRange, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Resource Booking', path: '/booking', icon: Calendar, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Admin'] },
    { name: 'Asset Categories', path: '/categories', icon: Tags, roles: ['Admin', 'Asset Manager'] },
    { name: 'Employee Directory', path: '/employees', icon: Users, roles: ['Admin'] },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-900 text-slate-300">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-900">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white font-black text-lg tracking-wider">A</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 tracking-wide text-md">AssetFlow</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Enterprise</span>
            </div>
          )}
        </Link>
        {/* Toggle Collapse Button for Desktop */}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex p-1 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-all"
        >
          <ChevronRight size={18} className={`transform transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* User Quick Info */}
      {!collapsed && (
        <div className="p-4 mx-4 mt-6 rounded-2xl bg-slate-900/40 border border-slate-800/40">
          <p className="text-xs font-semibold text-slate-400 truncate">{currentUser.name}</p>
          <p className="text-[10px] text-slate-500 truncate mb-2">{currentUser.email}</p>
          <Badge content={role} />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-900/50 to-indigo-950/20 border-l-4 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/20' 
                  : 'hover:bg-slate-900/50 hover:text-slate-100 text-slate-400'}
              `}
            >
              <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer info */}
      {!collapsed && (
        <div className="p-6 border-t border-slate-900 text-[10px] text-slate-600 font-medium">
          <p>AssetFlow ERP v1.0</p>
          <p className="mt-0.5">© 2026 Hackathon Edition</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-900 px-4 flex items-center justify-between z-40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-slate-100 text-md">AssetFlow</span>
        </Link>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar wrapper */}
      <aside className={`hidden md:block h-screen fixed left-0 top-0 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backer overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}
      
      {/* Spacer for layouts */}
      <div className={`hidden md:block transition-all duration-300 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
};
