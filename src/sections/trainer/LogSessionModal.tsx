import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { useClientSession, getTrainerClients } from '@/data/mockData';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

interface LogSessionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  trainerId: string;
}

export function LogSessionModal({
  onClose,
  onSuccess,
  trainerId,
}: LogSessionModalProps) {
  const clients = getTrainerClients(trainerId).filter((c) => c.sessionsRemaining > 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [logged, setLogged] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const handleLog = () => {
    if (!selectedClient) return;
    const success = useClientSession(selectedClient.id);
    if (success) {
      setLogged(true);
      onSuccess();
      setTimeout(onClose, 1200);
    }
  };

  if (logged) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="glass-strong rounded-3xl p-8 text-center max-w-sm mx-4"
        >
          <p className="text-lg font-semibold text-[var(--foreground)]">Session logged!</p>
          <p className="text-[var(--muted-foreground)] mt-2">
            1 session used for {selectedClient?.name}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Log Session</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Select a client to use 1 session from their membership:
          </p>
          <GlassInput
            placeholder="Search client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-white/30"
          />
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl bg-white/20 p-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    'w-full p-3 rounded-xl text-left transition-colors',
                    selectedClient?.id === client.id
                      ? 'bg-[var(--primary)]/20 ring-2 ring-[var(--primary)]/40'
                      : 'hover:bg-white/50'
                  )}
                >
                  <p className="font-medium text-[var(--foreground)]">{client.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {client.sessionsRemaining} sessions remaining
                  </p>
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-[var(--muted-foreground)]">
                No clients with sessions remaining
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <GlassButton fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              fullWidth
              onClick={handleLog}
              disabled={!selectedClient}
            >
              Log Session
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </>
  );
}
