import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTextArea } from '@/components/glass/GlassInput';
import { addProgressNote } from '@/data/mockData';
import type { ProgressNote } from '@/types';

interface QuickNoteModalProps {
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
  trainerId: string;
}

const NOTE_TYPES: ProgressNote['type'][] = ['general', 'praise', 'milestone', 'concern'];

export function QuickNoteModal({
  onClose,
  onSuccess,
  clientId,
  clientName,
  trainerId,
}: QuickNoteModalProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<ProgressNote['type']>('general');
  const [sharedWithClient, setSharedWithClient] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addProgressNote({
      clientId,
      trainerId,
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      type,
      sharedWithClient,
    });
    onSuccess();
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Quick Note - {clientName}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize ${
                    type === t
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[var(--muted-foreground)]" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Share with client</p>
                <p className="text-xs text-[var(--muted-foreground)]">They’ll see this in their Progress tab</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sharedWithClient}
              onClick={() => setSharedWithClient((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${sharedWithClient ? 'bg-[var(--primary)]' : 'bg-white/50'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${sharedWithClient ? 'left-[22px]' : 'left-1'}`}
              />
            </button>
          </div>
          <GlassTextArea
            placeholder="Write your note..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-white/30"
            required
          />
          <div className="flex gap-3">
            <GlassButton type="button" fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" fullWidth disabled={!content.trim()}>
              Save Note
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
