import { cn } from '@/lib/utils';

/** CTA variants: primary=main action, secondary=alt, success=confirm, destructive=delete */
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function GlassButton({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out';
  
  const variants = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] glass-button-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]',
    secondary: 'glass-button text-[var(--foreground)] hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]',
    success: 'bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-95 hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]',
    danger: 'bg-[var(--destructive)] text-white hover:opacity-95 hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-white/40 hover:backdrop-blur-sm active:scale-[0.97]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-55 brightness-90 cursor-not-allowed hover:scale-100 hover:shadow-none pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  );
}
