'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input, Button, Card, showToast } from '@/components/UI';
import { LogIn, UserPlus, Info } from 'lucide-react';
import { UserRole } from '@/types';

export default function LoginPage() {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
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
        // Sign up automatically derives employee name from email prefix (Screen 1)
        const namePart = email.split('@')[0];
        const derivedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const res = await signup(derivedName, email);
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
    <div className="w-full max-w-md px-4 py-16 animate-fade-in relative z-10">
      
      {/* Brand Header (Matches Screen 1) */}
      <div className="text-center mb-8">
        {/* Tactile Circle Logo with AF */}
        <div className="inline-flex w-16 h-16 rounded-full bg-slate-900 items-center justify-center shadow-extruded border border-white/20 mb-4 animate-float">
          <span className="text-indigo-600 font-extrabold text-xl tracking-wide font-display">AF</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight font-display">AssetFlow - login</h2>
        <p className="text-xs text-slate-300 mt-1 font-bold uppercase tracking-widest">Enterprise Asset & Resource Portal</p>
      </div>

      {/* Main card */}
      <Card className="rounded-[32px] p-8 shadow-extruded bg-slate-900 border-none hover:shadow-extruded">
        {/* Toggle Mode Tab (recessed track, elevated active slide indicator) */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900 shadow-inset mb-6 border-none">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none ${isLogin ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none ${!isLogin ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              placeholder="**********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            
            {/* Screen 1: Forgot password Link */}
            {isLogin && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => showToast('Password reset link has been dispatched to your email!', 'info')}
                  className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 border-none shadow-none hover:shadow-none bg-transparent hover:translate-y-0 cursor-pointer"
                >
                  Forgot password
                </button>
              </div>
            )}
          </div>

          {/* Screen 1 registration helper blocks */}
          {!isLogin && (
            <div className="pt-2">
              <hr className="border-slate-700/20 my-4" />
              <p className="text-xs font-bold text-slate-150 pl-0.5">New here?</p>
              
              <div className="p-3.5 rounded-2xl bg-slate-900 shadow-inset-sm text-slate-300 font-bold text-xs mt-2 leading-relaxed">
                Sign up creates an employee account admin roles assigned later
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary"
            className="w-full mt-3.5 h-12 text-sm uppercase tracking-wider font-extrabold" 
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <span className="flex items-center gap-2 font-display">
                <LogIn size={16} /> Sign In
              </span>
            ) : (
              <span className="flex items-center gap-2 font-display">
                <UserPlus size={16} /> Create Account
              </span>
            )}
          </Button>
        </form>

        {/* Hackathon Quick Access panel */}
        <div className="mt-8 border-t border-slate-700/20 pt-6">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-3">
            <Info size={12} className="text-indigo-600 animate-float" />
            <span>Sandbox Pre-seeded Accounts (1-Click)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {testAccounts.map(acct => (
              <button
                key={acct.email}
                type="button"
                onClick={() => handleQuickLogin(acct.email)}
                className="p-3.5 rounded-2xl bg-slate-900 text-left hover:text-indigo-600 shadow-extruded hover:shadow-extruded-sm active:shadow-inset-sm transition-all border-none flex flex-col justify-between h-[68px] hover:translate-y-[-1px] active:translate-y-[0.5px]"
                disabled={loading}
              >
                <span className="text-xs font-bold text-slate-100 truncate w-full">{acct.name}</span>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider truncate w-full mt-1.5 leading-none">{acct.role.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
