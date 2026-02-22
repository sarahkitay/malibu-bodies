import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className,
}: GlassBadgeProps) {
  const variants = {
    default: 'bg-white/60 text-[var(--foreground)]',
    primary: 'bg-[var(--primary)]/20 text-[var(--primary)]',
    success: 'bg-green-500/15 text-green-600',
    warning: 'bg-amber-500/15 text-amber-600',
    danger: 'bg-[var(--destructive)]/20 text-[var(--destructive)]',
    info: 'bg-blue-500/15 text-blue-600',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg backdrop-blur-sm border border-white/20',
        variants[variant],
        sizes[size],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {pulse && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-sm mr-1.5 animate-pulse',
          variant === 'success' && 'bg-green-500',
          variant === 'primary' && 'bg-[var(--primary)]',
          variant === 'danger' && 'bg-[var(--destructive)]',
          variant === 'warning' && 'bg-amber-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'default' && 'bg-[var(--muted-foreground)]',
        )} />
      )}
      {children}
    </motion.span>
  );
}
