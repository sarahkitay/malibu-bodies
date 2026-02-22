import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Header } from '@/components/Header';
import { AddProgressNoteModal } from '@/sections/trainer/AddProgressNoteModal';
import { getAllNotes, getTrainerClients, getClientById } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { ProgressNote } from '@/types';

interface ProgressNotesTabProps {
  onBack: () => void;
}

export function ProgressNotesTab({ onBack }: ProgressNotesTabProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const [filterClientId, setFilterClientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [, setRefresh] = useState(0);

  const clients = getTrainerClients(trainerId);
  let notes = getAllNotes(trainerId);
  if (filterClientId) {
    notes = notes.filter((n) => n.clientId === filterClientId);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen pb-above-nav">
      <Header
        title="Progress Notes"
        subtitle="View and add client notes"
        showBack
        onBack={onBack}
        rightAction={
          <GlassButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddNote(true)}>
            Add Note
          </GlassButton>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Client filter */}
        <div>
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
            Filter by client
          </label>
          <select
            value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 text-[var(--foreground)]"
          >
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <GlassInput
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/50"
        />

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note, index) => {
              const client = getClientById(note.clientId);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-medium text-[var(--primary)]">
                          {client?.name ?? 'Unknown client'}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <NoteTypeBadge type={note.type} />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            note.sharedWithClient !== false
                              ? 'bg-green-500/15 text-green-600'
                              : 'bg-[var(--muted-foreground)]/20 text-[var(--muted-foreground)]'
                          )}>
                            {note.sharedWithClient !== false ? 'Shared with client' : 'Private'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[var(--foreground)]">{note.content}</p>
                      {note.attachmentUrl && (
                        <a
                          href={note.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--primary)] mt-2 inline-flex items-center gap-1"
                        >
                          {note.attachmentName || 'View attachment'}
                        </a>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          ) : (
            <GlassCard className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">
                {searchQuery.trim() || filterClientId
                  ? 'No matching notes'
                  : 'No progress notes yet'}
              </p>
              {!searchQuery.trim() && !filterClientId && (
                <GlassButton className="mt-4" variant="primary" onClick={() => setShowAddNote(true)}>
                  Add your first note
                </GlassButton>
              )}
            </GlassCard>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddNote && (
          <AddProgressNoteModal
            onClose={() => setShowAddNote(false)}
            onSuccess={() => {
              setShowAddNote(false);
              setRefresh((r) => r + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteTypeBadge({ type }: { type: ProgressNote['type'] }) {
  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        type === 'praise' && 'bg-green-500/15 text-green-600',
        type === 'concern' && 'bg-amber-500/15 text-amber-600',
        type === 'milestone' && 'bg-blue-500/15 text-blue-600',
        type === 'general' && 'bg-[var(--muted-foreground)]/15 text-[var(--muted-foreground)]'
      )}
    >
      {type}
    </span>
  );
}
