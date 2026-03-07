/**
 * EPWORLD Optimized Components
 * Lightweight, performance-focused UI components
 */

import type { ReactNode } from 'react';

// ============================================
// QUICK ACTION BUTTON
// ============================================

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  onClick?: () => void;
}

/**
 * Quick Action Button
 * Optimized for instant interaction feedback
 */
export function QuickActionButton({ icon, label, href, onClick }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-4 bg-slate-900 rounded-xl border border-slate-800 
                 hover:border-indigo-500 hover:bg-slate-800 active:scale-95 transition-all duration-150"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-150">{icon}</span>
      <span className="text-slate-300 text-sm font-medium group-hover:text-white">{label}</span>
    </a>
  );
}

// ============================================
// ACTIVITY ITEM
// ============================================

interface ActivityItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
}

/**
 * Activity Item
 * Compact display for activity feeds
 */
export function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-slate-400 text-sm truncate">{description}</p>
      </div>
      <span className="text-slate-500 text-xs whitespace-nowrap">{time}</span>
    </div>
  );
}

// ============================================
// SKELETON COMPONENTS
// ============================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton loader
 * Shows loading state with pulse animation
 */
export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800 rounded ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse">
      <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-20 bg-slate-800 rounded"></div>
        <div className="h-20 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg animate-pulse">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Optimized Button
 * Minimal re-render, fast feedback
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 active:bg-indigo-800',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500 active:bg-slate-800',
    outline: 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-slate-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"
003e</circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

/**
 * Card Component
 * Consistent styling with optional hover effect
 */
export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900 rounded-xl border border-slate-800 p-6
        ${hover ? 'hover:border-indigo-500 transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

/**
 * Badge Component
 */
export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-indigo-500/20 text-indigo-400',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  QuickActionButton,
  ActivityItem,
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  Button,
  Card,
  Badge,
};
