import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { addBooking, getTrainerClients } from '@/data/mockData';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';
import { formatDateForInput } from '@/lib/dateUtils';

interface ScheduleSessionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  trainerId: string;
  preselectedDate?: Date;
  preselectedTime?: string;
  preselectedClientId?: string;
}

export function ScheduleSessionModal({
  onClose,
  onSuccess,
  trainerId,
  preselectedDate,
  preselectedTime,
  preselectedClientId,
}: ScheduleSessionModalProps) {
  const clients = getTrainerClients(trainerId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    preselectedClientId ? clients.find((c) => c.id === preselectedClientId) : undefined
  );
  const [date, setDate] = useState(
    formatDateForInput(preselectedDate || new Date())
  );
  const [time, setTime] = useState(preselectedTime || '09:00');
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<'in-person' | 'virtual'>('in-person');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    addBooking({
      clientId: selectedClient.id,
      trainerId,
      date,
      time,
      duration,
      type,
      status: 'confirmed',
    });
    onSuccess();
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Schedule Session
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Search Client
            </label>
            <GlassInput
              placeholder="Type client name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-white/30"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl bg-white/20 p-2">
            {filteredClients.map((client) => (
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
                <p className="text-sm text-[var(--muted-foreground)]">{client.email}</p>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <p className="p-4 text-center text-[var(--muted-foreground)]">
                No clients found
              </p>
            )}
          </div>

          {selectedClient && (
            <p className="text-sm text-[var(--primary)] font-medium">
              Selected: {selectedClient.name}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
                Date
              </label>
              <GlassInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/30"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
                Time
              </label>
              <GlassInput
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Duration (min)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-white/30 border-0 outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              {[30, 45, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Type
            </label>
            <div className="flex gap-2">
              {(['in-person', 'virtual'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium capitalize',
                    type === t
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton type="button" fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!selectedClient}
            >
              Schedule
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
