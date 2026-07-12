'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// ==========================
// CARD COMPONENT
// ==========================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glass = true, 
  hoverEffect = true,
  ...props 
}) => {
  return (
    <div
      className={`
        rounded-2xl border p-6 transition-all duration-300
        ${glass 
          ? 'bg-slate-900/60 backdrop-blur-md border-slate-800/60 shadow-xl' 
          : 'bg-slate-900 border-slate-800 shadow-lg'}
        ${hoverEffect 
          ? 'hover:border-indigo-500/40 hover:shadow-indigo-500/5 hover:-translate-y-0.5' 
          : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================
// BUTTON COMPONENT
// ==========================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50',
    outline: 'border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
    ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200',
    gradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================
// INPUT COMPONENT
// ==========================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-slate-950 text-slate-100 text-sm
            transition-all duration-200 focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:bg-slate-900
            ${error 
              ? 'border-rose-500 focus:ring-rose-500/20' 
              : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/20'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================
// SELECT COMPONENT
// ==========================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-slate-950 text-slate-100 text-sm
            transition-all duration-200 focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:bg-slate-900 appearance-none
            ${error 
              ? 'border-rose-500 focus:ring-rose-500/20' 
              : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/20'}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25em'
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ==========================
// BADGE COMPONENT
// ==========================
interface BadgeProps {
  content: string;
  type?: 'status' | 'priority' | 'role' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ content, type = 'default' }) => {
  const getStyles = () => {
    const val = content.toLowerCase();

    // Roles
    if (val === 'admin') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (val === 'asset manager') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (val === 'department head') return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    if (val === 'employee') return 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    // Statuses
    if (val === 'available' || val === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (val === 'allocated' || val === 'ongoing') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (val === 'reserved' || val === 'upcoming') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (val === 'under maintenance' || val === 'in progress') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (val === 'lost' || val === 'broken' || val === 'rejected' || val === 'cancelled' || val === 'inactive' || val === 'critical') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (val === 'retired' || val === 'disposed') return 'bg-slate-600/10 text-slate-400 border-slate-600/20';
    if (val === 'completed' || val === 'resolved' || val === 'approved') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (val === 'pending') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

    // Priorities
    if (val === 'high') return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    if (val === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    if (val === 'low') return 'bg-slate-500/10 text-slate-400 border-slate-500/25';

    return 'bg-slate-800 text-slate-400 border-slate-700/50';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {content}
    </span>
  );
};

// ==========================
// MODAL COMPONENT
// ==========================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================
// TOAST NOTIFICATION CONTAINER & TRIGGERS
// ==========================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

export const showToast = (message: string, type: ToastType = 'success') => {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, type }];
  toastListeners.forEach(listener => listener(toasts));
  
  // Auto dismiss after 4 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toasts));
  }, 4000);
};

export const ToastContainer: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleChange = (newToasts: ToastItem[]) => {
      setActiveToasts(newToasts);
    };
    toastListeners.push(handleChange);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleChange);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {activeToasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="text-emerald-400 flex-shrink-0" size={18} />,
          error: <AlertCircle className="text-rose-400 flex-shrink-0" size={18} />,
          info: <Info className="text-sky-400 flex-shrink-0" size={18} />,
          warning: <AlertTriangle className="text-amber-400 flex-shrink-0" size={18} />
        };

        const bgStyles = {
          success: 'bg-emerald-950/90 border-emerald-800/50 text-emerald-200',
          error: 'bg-rose-950/90 border-rose-800/50 text-rose-200',
          info: 'bg-sky-950/90 border-sky-800/50 text-sky-200',
          warning: 'bg-amber-950/90 border-amber-800/50 text-amber-200'
        };

        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md
              transform translate-y-0 transition-all duration-300 animate-slide-in
              ${bgStyles[toast.type]}
            `}
          >
            {icons[toast.type]}
            <p className="text-xs font-medium leading-5 flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
