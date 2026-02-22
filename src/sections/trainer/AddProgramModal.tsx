import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Link2 } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { addTrainerProgram, updateTrainerProgram } from '@/data/mockData';
import type { TrainerProgram } from '@/types';

interface AddProgramModalProps {
  onClose: () => void;
  onSave: () => void;
  program?: TrainerProgram | null;
}

export function AddProgramModal({ onClose, onSave, program }: AddProgramModalProps) {
  const [name, setName] = useState(program?.name ?? '');
  const [description, setDescription] = useState(program?.description ?? '');
  const [price, setPrice] = useState(program?.price?.toString() ?? '');
  const [paymentLink, setPaymentLink] = useState(program?.paymentLink ?? '');
  const [paidCash, setPaidCash] = useState(program?.paidCash ?? false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (program) {
      setName(program.name);
      setDescription(program.description ?? '');
      setPrice(program.price?.toString() ?? '');
      setPaymentLink(program.paymentLink ?? '');
      setPaidCash(program.paidCash ?? false);
    }
  }, [program]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Program name is required');
      return;
    }

    if (program) {
      updateTrainerProgram(program.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        paymentLink: paidCash ? undefined : paymentLink.trim() || undefined,
        paidCash,
      });
    } else {
      addTrainerProgram({
        name: trimmedName,
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        paymentLink: paidCash ? undefined : paymentLink.trim() || undefined,
        paidCash,
      });
    }
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-white/10 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{program ? 'Edit Program' : 'Add Program'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-[var(--foreground)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Program name *</label>
            <GlassInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 8-Week Strength" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
            <GlassTextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included..." rows={2} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Price ($)</label>
            <GlassInput type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={paidCash}
              onChange={(e) => setPaidCash(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 accent-[var(--primary)]"
            />
            <span className="text-sm text-[var(--foreground)]">Paid cash</span>
          </label>

          {!paidCash && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center gap-1">
                <Link2 className="w-4 h-4" /> Payment link
              </label>
              <GlassInput
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              {program ? 'Save changes' : 'Add Program'}
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
