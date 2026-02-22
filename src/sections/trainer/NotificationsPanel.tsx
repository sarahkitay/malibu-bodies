import { motion } from 'framer-motion';
import { X, Calendar, UtensilsCrossed, Image, MessageCircle } from 'lucide-react';
import { getNotificationsForTrainer } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const notifications = getNotificationsForTrainer(trainerId);

  const Icon = ({ type }: { type: string }) => {
    if (type === 'session_request') return <Calendar className="w-4 h-4 text-amber-500" />;
    if (type === 'nutrition') return <UtensilsCrossed className="w-4 h-4 text-green-500" />;
    if (type === 'photo') return <Image className="w-4 h-4 text-blue-500" />;
    if (type === 'client_contact') return <MessageCircle className="w-4 h-4 text-[var(--primary)]" />;
    return null;
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-hidden max-w-lg mx-auto flex flex-col"
      >
        <div className="sticky top-0 glass-strong px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Notifications</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                    <Icon type={n.type} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{n.clientName}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{n.message}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {new Date(n.date).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[var(--muted-foreground)]">No new notifications</p>
              <p className="text-sm text-[var(--muted-foreground)]/70 mt-1">
                Client updates and session requests will appear here
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
