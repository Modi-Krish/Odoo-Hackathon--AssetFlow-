'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input, Button, Card, showToast } from '@/components/UI';
import { LogIn, UserPlus, Key, Info } from 'lucide-react';
import { UserRole } from '@/types';

export default function LoginPage() {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-configured test accounts for 1-click hackathon login
  const testAccounts = [
    { name: 'Admin', email: 'admin@assetflow.com', role: 'Admin' as UserRole },
    { name: 'Asset Mgr', email: 'manager@assetflow.com', role: 'Asset Manager' as UserRole },
    { name: 'Dept Head', email: 'head@assetflow.com', role: 'Department Head' as UserRole },
    { name: 'Employee', email: 'employee@assetflow.com', role: 'Employee' as UserRole },
  ];

  const handleQuickLogin = async (testEmail: string) => {
    setLoading(true);
    try {
      const res = await login(testEmail);
      if (res.success) {
        showToast(`Welcome back, ${res.user?.name}!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Email is required', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email);
        if (res.success) {
          showToast(`Welcome back, ${res.user?.name}!`, 'success');
        } else {
          showToast(res.message, 'error');
        }
      } else {
        if (!name) {
          showToast('Name is required', 'error');
          setLoading(false);
          return;
        }
        const res = await signup(name, email);
        if (res.success) {
          showToast(res.message, 'success');
          setIsLogin(true);
          setEmail(email);
        } else {
          showToast(res.message, 'error');
        }
      }
    } catch (err) {
      showToast('An error occurred during authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center shadow-xl shadow-indigo-600/30 mb-4">
          <span className="text-white font-black text-2xl tracking-wider">A</span>
        </div>
        <h2 className="text-2xl font-black text-slate-100 tracking-wide">AssetFlow Portal</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Enterprise Asset & Resource Management System</p>
      </div>

      {/* Main card */}
      <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur-lg">
        {/* Toggle Mode Tabs */}
        <div className="flex border-b border-slate-800 mb-6 p-0.5 rounded-xl bg-slate-950/60">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <Button 
            type="submit" 
            variant="gradient"
            className="w-full mt-2" 
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <span className="flex items-center gap-2">
                <LogIn size={16} /> Sign In
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={16} /> Create Account
              </span>
            )}
          </Button>
        </form>

        {/* Hackathon Quick Access panel */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
            <Info size={12} className="text-slate-500" />
            <span>Hackathon Sandbox Accounts (1-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {testAccounts.map(acct => (
              <button
                key={acct.email}
                type="button"
                onClick={() => handleQuickLogin(acct.email)}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-left hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all group flex flex-col justify-between h-[64px]"
                disabled={loading}
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 truncate">{acct.name}</span>
                <span className="text-[9px] text-slate-500 font-medium truncate">{acct.role}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
