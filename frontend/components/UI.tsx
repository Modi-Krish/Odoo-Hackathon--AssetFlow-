'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// ==========================
// CARD COMPONENT (32px radius, Molded Look)
// ==========================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean; // Kept for interface compatibility
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
        bg-slate-900 rounded-[32px] p-8 transition-all duration-300 ease-out
        shadow-extruded border border-white/20
        ${hoverEffect 
          ? 'hover:shadow-extruded-hover hover:-translate-y-[1px]' 
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
// BUTTON COMPONENT (16px radius, Tactile Press)
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
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px] active:translate-y-[0.5px] active:scale-[0.99]';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-400 text-white shadow-[6px_6px_12px_rgba(108,99,255,0.25),-6px_-6px_12px_rgba(255,255,255,0.6)] active:shadow-[inset_4px_4px_8px_rgba(50,40,150,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]',
    secondary: 'bg-slate-900 hover:bg-slate-850 text-slate-100 shadow-extruded active:shadow-inset-sm',
    outline: 'bg-slate-900 border border-slate-700/50 hover:bg-slate-850 text-slate-200 shadow-extruded active:shadow-inset-sm',
    danger: 'bg-rose-500 hover:bg-rose-400 text-white shadow-[6px_6px_12px_rgba(239,68,68,0.25),-6px_-6px_12px_rgba(255,255,255,0.6)] active:shadow-[inset_4px_4px_8px_rgba(150,30,30,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]',
    ghost: 'text-slate-300 hover:text-slate-100 hover:shadow-extruded-sm active:shadow-inset-sm px-3.5',
    gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-[6px_6px_12px_rgba(108,99,255,0.3),-6px_-6px_12px_rgba(255,255,255,0.6)] active:shadow-[inset_4px_4px_8px_rgba(50,40,150,0.35),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs h-10',
    md: 'px-5 py-3 text-sm h-12', // Minimum touch targets h-12 = 48px
    lg: 'px-7 py-4 text-base h-14'
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
// INPUT COMPONENT (16px radius, Inset Well)
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
          <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none
            shadow-inset transition-all duration-300 ease-out
            focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:bg-slate-950
            placeholder:text-slate-400
            ${error ? 'ring-2 ring-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================
// SELECT COMPONENT (16px radius, Inset Well)
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
          <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none
            shadow-inset transition-all duration-300 ease-out
            focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 appearance-none
            ${error ? 'ring-2 ring-rose-500' : ''}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1.25rem center',
            backgroundSize: '1.25em'
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ==========================
// BADGE COMPONENT (Soft Neumorphic contrast badges)
// ==========================
interface BadgeProps {
  content: string;
  type?: 'status' | 'priority' | 'role' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ content, type = 'default' }) => {
  const getStyles = () => {
    const val = content.toLowerCase();

    // Roles
    if (val === 'admin') return 'text-purple-600 bg-purple-500/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]';
    if (val === 'asset manager') return 'text-indigo-600 bg-indigo-500/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]';
    if (val === 'department head') return 'text-sky-600 bg-sky-500/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]';
    if (val === 'employee') return 'text-slate-500 bg-slate-500/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]';

    // Statuses & Actions
    if (val === 'available' || val === 'active') return 'text-emerald-500 bg-emerald-500/15 shadow-[inset_1px_1px_3px_rgba(56,178,172,0.3)]';
    if (val === 'allocated' || val === 'ongoing') return 'text-indigo-500 bg-indigo-500/15 shadow-[inset_1px_1px_3px_rgba(108,99,255,0.3)]';
    if (val === 'reserved' || val === 'upcoming') return 'text-amber-500 bg-amber-500/15 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]';
    if (val === 'under maintenance' || val === 'in progress') return 'text-orange-500 bg-orange-500/15 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]';
    if (val === 'lost' || val === 'broken' || val === 'rejected' || val === 'cancelled' || val === 'inactive' || val === 'critical') {
      return 'text-rose-500 bg-rose-500/15 shadow-[inset_1px_1px_3px_rgba(239,68,68,0.3)]';
    }
    if (val === 'completed' || val === 'resolved' || val === 'approved') return 'text-emerald-500 bg-emerald-500/15 shadow-[inset_1px_1px_3px_rgba(56,178,172,0.3)]';
    if (val === 'pending') return 'text-indigo-600 bg-indigo-500/10 shadow-[inset_1px_1px_3px_rgba(108,99,255,0.2)]';

    return 'text-slate-400 bg-slate-400/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]';
  };

  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold ${getStyles()}`}>
      {content}
    </span>
  );
};

// ==========================
// MODAL COMPONENT (Convex Lift, nested details)
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
      
      
      {/* Modal card — white surface with neumorphic shadow */}
      <div
        className="relative w-full max-w-lg rounded-[32px] p-8 border border-white/60 transition-all duration-300 scale-100 flex flex-col max-h-[90vh] z-10 animate-fade-in"
        style={{
          backgroundColor: '#f0f4f8',
          boxShadow: '9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-700/20">
          <h3 className="text-base font-bold text-slate-100 font-display">{title}</h3>
          
          {/* Circular Close Button */}
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-indigo-600 p-2.5 rounded-full shadow-extruded hover:shadow-extruded-sm active:shadow-inset-sm transition-all"
            style={{ backgroundColor: '#e0e5ec' }}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Scrollable inner content */}
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4.5 max-w-sm w-full">
      {activeToasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />,
          error: <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />,
          info: <Info className="text-indigo-600 flex-shrink-0" size={18} />,
          warning: <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
        };

        const borders = {
          success: 'border-l-4 border-emerald-500',
          error: 'border-l-4 border-rose-500',
          info: 'border-l-4 border-indigo-600',
          warning: 'border-l-4 border-amber-500'
        };

        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-4 p-5 rounded-2xl bg-slate-900 shadow-extruded text-slate-100
              transform translate-y-0 transition-all duration-300 animate-slide-in
              ${borders[toast.type]}
            `}
          >
            {icons[toast.type]}
            <p className="text-xs font-bold leading-5 flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};

// ==========================
// LOADER COMPONENT (Tactile Spinner)
// ==========================
export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading Data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin shadow-lg" />
      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{message}</p>
    </div>
  );
};

// ==========================
// ERROR MESSAGE COMPONENT (Error Banner Card)
// ==========================
export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="p-6 rounded-[32px] bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="flex-shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Operation Error</h4>
          <p className="text-xs text-rose-400 mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// ==========================
// SKELETON COMPONENT (Pulse Feed Placeholder)
// ==========================
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-16 w-full' }) => {
  return (
    <div className={`bg-slate-800/40 animate-pulse rounded-2xl ${className}`} />
  );
};

// ==========================
// EMPTY STATE COMPONENT (Feedback placeholder)
// ==========================
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[32px] border-2 border-dashed border-slate-800 bg-slate-900/10 text-center max-w-md mx-auto">
      {icon ? (
        <div className="mb-4 text-slate-500">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 text-lg mb-4">
          📭
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-medium">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

