import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTextArea } from '@/components/glass/GlassInput';

const PRESET_MESSAGES = [
  'Reminder: Session tomorrow!',
  'Great progress this week!',
  "Don't forget to log your nutrition.",
  'Your program has been updated.',
  "You're running low on sessions! Consider purchasing more to stay on track.",
];

interface SendNotificationModalProps {
  onClose: () => void;
  clientName: string;
}

export function SendNotificationModal({
  onClose,
  clientName,
}: SendNotificationModalProps) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(onClose, 800);
  };

  if (sent) {
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
          <p className="text-lg font-semibold text-[var(--foreground)]">Notification sent!</p>
          <p className="text-[var(--muted-foreground)] mt-2">Message delivered to {clientName}</p>
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
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Send Notification - {clientName}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Type a message or choose a preset:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMessage(preset)}
                className="px-3 py-1.5 rounded-xl text-sm bg-white/50 hover:bg-white/70"
              >
                {preset}
              </button>
            ))}
          </div>
          <GlassTextArea
            placeholder="Or type your own message..."
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/30"
            required
          />
          <div className="flex gap-3">
            <GlassButton type="button" fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!message.trim()}
            >
              Send
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
