import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  press?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  press = false,
  className,
  onClick,
  onDrag,
  onDragStart,
  onDragEnd,
  ...props
}: GlassCardProps) {
  const baseClass = variant === 'strong' ? 'glass-strong' : variant === 'subtle' ? 'glass-subtle' : 'glass-card';
  const shouldPress = press || !!onClick;

  const commonProps = {
    className: cn(baseClass, 'p-4', hover && 'cursor-pointer', className),
    onClick,
    ...props
  };

  if (onClick) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <motion.div
        {...(commonProps as any)}
        whileHover={hover ? { y: -2 } : undefined}
        whileTap={shouldPress ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }
  return <div {...commonProps}>{children}</div>;
}

export function GlassCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('pb-[var(--space-4)]', className)}>{children}</div>;
}

export function GlassCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('pb-[var(--space-4)]', className)}>{children}</div>;
}

export function GlassCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('pt-[var(--space-4)] border-t border-[var(--border-subtle)] flex items-center gap-[var(--space-3)]', className)}>
      {children}
    </div>
  );
}
