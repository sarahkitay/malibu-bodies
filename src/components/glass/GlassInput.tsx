import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export function GlassInput({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className,
  ...props
}: GlassInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2 ml-1">
          {label}
        </label>
      )}
      <motion.div
        className={cn(
          'relative flex items-center',
          'glass-input transition-all duration-300',
          'focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:bg-white/70',
          error && 'ring-2 ring-[var(--destructive)]/50 bg-[var(--destructive)]/5'
        )}
        whileFocus={{ scale: 1.01 }}
      >
        {leftIcon && (
          <span className="absolute left-4 text-[var(--muted-foreground)]">
            {leftIcon}
          </span>
        )}
        <input
          className={cn(
            'w-full bg-transparent px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60',
            'outline-none',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-4 text-[var(--muted-foreground)]">
            {rightIcon}
          </span>
        )}
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-[var(--destructive)] ml-1"
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)] ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface GlassTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function GlassTextArea({
  label,
  error,
  helperText,
  className,
  ...props
}: GlassTextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2 ml-1">
          {label}
        </label>
      )}
      <motion.div
        className={cn(
          'relative',
          'glass-input transition-all duration-300',
          'focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:bg-white/70',
          error && 'ring-2 ring-[var(--destructive)]/50 bg-[var(--destructive)]/5'
        )}
      >
        <textarea
          className={cn(
            'w-full bg-transparent px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60',
            'outline-none resize-none',
            className
          )}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-[var(--destructive)] ml-1"
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)] ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
