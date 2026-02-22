
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
}

export function StatCard({ icon, value, label, trend }: StatCardProps) {
  return (
    <div className="flex-1 rounded-[var(--radius-lg)] bg-[var(--bg-tertiary)] p-[var(--space-4)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-accent)] to-transparent opacity-40" />
      <div className="relative z-10">
        <div className="text-[var(--text-tertiary)] mb-[var(--space-2)]">{icon}</div>
        <div className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
          {value}
        </div>
        <div className="text-[var(--text-xs)] font-medium text-[var(--text-secondary)] mt-[var(--space-1)] tracking-wide uppercase">
          {label}
        </div>
        {trend && (
          <div className="text-[var(--text-xs)] font-medium text-[var(--success)] mt-[var(--space-1)]">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
