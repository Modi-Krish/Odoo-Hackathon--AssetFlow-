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
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/20 text-slate-200">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/20">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Tactile Circle Logo */}
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-[4px_4px_8px_rgba(108,99,255,0.3),-4px_-4px_8px_rgba(255,255,255,0.6)]">
            <span className="text-white font-extrabold text-lg tracking-wider font-display">A</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-100 tracking-tight text-sm font-display leading-tight">AssetFlow</span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-none mt-0.5">Enterprise</span>
            </div>
          )}
        </Link>
        {/* Toggle Collapse Button (Tactile Circle) */}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex p-2.5 bg-slate-900 rounded-full text-slate-400 hover:text-indigo-600 shadow-extruded hover:shadow-extruded-sm active:shadow-inset-sm transition-all"
        >
          <ChevronRight size={14} className={`transform transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Recessed User Profile Well */}
      {!collapsed && (
        <div className="p-4.5 mx-5 mt-6 rounded-2xl bg-slate-900 shadow-inset-sm flex flex-col items-center text-center">
          {/* User Icon Circle Well */}
          <div className="w-10 h-10 rounded-full bg-slate-900 shadow-inset flex items-center justify-center text-indigo-600 mb-2">
            <Users size={16} />
          </div>
          <p className="text-xs font-bold text-slate-100 truncate w-full">{currentUser.name}</p>
          <p className="text-[10px] text-slate-300 truncate w-full mt-0.5 mb-2.5">{currentUser.email}</p>
          <Badge content={role} />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 group
                ${isActive 
                  ? 'bg-slate-900 text-indigo-600 shadow-inset-sm' 
                  : 'hover:shadow-extruded-sm active:shadow-inset-sm hover:text-indigo-600 text-slate-300'}
              `}
            >
              <Icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-600'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer info */}
      {!collapsed && (
        <div className="p-6 border-t border-slate-700/20 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <p>AssetFlow ERP v1.0</p>
          <p className="mt-0.5 text-slate-400">© 2026 Hackathon</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700/20 px-4 flex items-center justify-between z-40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-sm">A</span>
          </div>
          <span className="font-extrabold text-slate-100 text-sm font-display">AssetFlow</span>
        </Link>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-2.5 bg-slate-900 rounded-full shadow-extruded text-slate-400 hover:text-indigo-600"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
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
