'use client';

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from './UI';
import { usePathname, useRouter } from 'next/navigation';

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Redirect to login if user is not authenticated and trying to access app pages
    if (!currentUser && pathname !== '/login') {
      router.push('/login');
    }
    // Redirect to dashboard if authenticated and on login page or index
    else if (currentUser && (pathname === '/login' || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [currentUser, pathname, router, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLoginPage = pathname === '/login';

  if (!currentUser) {
    if (isLoginPage) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between bg-grid-pattern">
          <div className="flex-1 flex items-center justify-center relative">
            {children}
          </div>
          <ToastContainer />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center bg-grid-pattern">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If logged in, display full app layout with sidebar & navbar
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative bg-grid-pattern bg-slate-900">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative mt-16 md:mt-0 z-10">
          <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  );
};
