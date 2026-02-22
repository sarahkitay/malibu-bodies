import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-5 empty-state-icon-bg">
        <Icon size={28} className="text-[var(--primary)] opacity-70" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-[240px] mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
