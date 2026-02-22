import { CreditCard, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Header } from '@/components/Header';
import { getClientById, getPastMemberships } from '@/data/mockData';

interface ClientMembershipsProps {
  clientId: string;
  onBack: () => void;
}

export function ClientMemberships({ clientId, onBack }: ClientMembershipsProps) {
  const client = getClientById(clientId);
  const pastMemberships = client ? getPastMemberships(client.trainerId) : [];

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Memberships"
        subtitle="Purchase sessions & programs"
        showBack
        onBack={onBack}
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Repurchase</h3>
        <p className="text-sm text-[var(--muted-foreground)]">Past packages from your trainer</p>
        {pastMemberships.length > 0 ? (
          pastMemberships.map((m) => (
            <GlassCard key={m.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">{m.name}</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {m.description || ''} • ${m.price}
                    </p>
                  </div>
                </div>
                <a href={m.squarePaymentUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <GlassButton variant="primary" fullWidth leftIcon={<ExternalLink className="w-4 h-4" />}>
                    Repurchase on Square
                  </GlassButton>
                </a>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-6">
            <p className="text-[var(--muted-foreground)]">No past memberships available. Contact your trainer.</p>
          </GlassCard>
        )}

        <GlassCard className="p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-2">Other Options</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Contact {client?.trainerName || 'your trainer'} for custom packages, in-person training, or session packs.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
