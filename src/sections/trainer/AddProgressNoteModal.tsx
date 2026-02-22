import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Paperclip, Share2 } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTextArea } from '@/components/glass/GlassInput';
import { addProgressNote, getTrainerClients } from '@/data/mockData';
import { currentUser } from '@/data/mockData';
import type { ProgressNote } from '@/types';
import { cn } from '@/lib/utils';

const NOTE_TYPES: ProgressNote['type'][] = ['general', 'praise', 'milestone', 'concern'];

interface AddProgressNoteModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  defaultClientId?: string;
}

export function AddProgressNoteModal({
  onClose,
  onSuccess,
  defaultClientId,
}: AddProgressNoteModalProps) {
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ProgressNote['type']>('general');
  const [sharedWithClient, setSharedWithClient] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clients = getTrainerClients(currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !clientId) return;
    const attachmentUrl = file ? URL.createObjectURL(file) : undefined;
    addProgressNote({
      clientId,
      trainerId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      type,
      attachmentUrl,
      attachmentName: file?.name,
      sharedWithClient,
    });
    onSuccess?.();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Add Progress Note</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Client *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[var(--border)] text-[var(--foreground)]"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
                    type === t ? 'bg-[var(--primary)] text-white' : 'bg-white/50 hover:bg-white/70'
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
                <p className="text-xs text-[var(--muted-foreground)]">They’ll see this note in their Progress tab</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sharedWithClient}
              onClick={() => setSharedWithClient((v) => !v)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                sharedWithClient ? 'bg-[var(--primary)]' : 'bg-white/50'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
                  sharedWithClient ? 'left-[22px]' : 'left-1'
                )}
              />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Note *
            </label>
            <GlassTextArea
              placeholder="Write your note..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-white/30"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Attach image or file (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 border border-dashed border-[var(--border)] w-full hover:bg-white/70"
            >
              <Paperclip className="w-4 h-4 text-[var(--muted-foreground)]" />
              <span className="text-sm text-[var(--muted-foreground)]">
                {file ? file.name : 'Choose image or file'}
              </span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <GlassButton type="button" fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!content.trim() || !clientId}
            >
              Save Note
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
