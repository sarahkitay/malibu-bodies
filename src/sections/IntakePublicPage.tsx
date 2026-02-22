import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/hooks/useTheme';
import { IntakeFormEmbed } from '@/sections/trainer/IntakeFormEmbed';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import '../App.css';

export function IntakePublicPage({ onSubmitted }: { onSubmitted?: () => void }) {
  const [showNewClientPopup, setShowNewClientPopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isNewClient = params.get('newClient') === '1' || params.get('newClient') === 'true';
  const inviteId = params.get('invite') ?? undefined;
  const trainerId = params.get('trainerId') ?? undefined;

  useEffect(() => {
    if (isNewClient) {
      setShowNewClientPopup(true);
    }
  }, [isNewClient]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--background)] pb-12 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[var(--foreground)] font-serif">
              Malibu Bodies Application & Intake Form
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Custom Programming, Coaching & In-Person Training
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-4">
              Pre-made programs are purchased separately.
            </p>
          </div>

          <GlassCard className="p-6">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-lg font-medium text-[var(--foreground)]">Thank you!</p>
                <p className="text-sm text-[var(--muted-foreground)]">Your application has been submitted. We will review within 3-5 business days.</p>
                <div className="flex flex-col gap-3 mt-6">
                  {onSubmitted && (
                    <GlassButton variant="primary" fullWidth onClick={onSubmitted}>
                      Continue to app
                    </GlassButton>
                  )}
                  <a
                    href="https://apps.apple.com/app/id1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-medium text-sm hover:opacity-90"
                  >
                    Download the app
                  </a>
                </div>
              </div>
            ) : (
              <IntakeFormEmbed
                trainerId={trainerId}
                inviteId={inviteId}
                newClient={isNewClient}
                onSuccess={() => {
                  setShowNewClientPopup(false);
                  setSubmitted(true);
                }}
              />
            )}
          </GlassCard>
        </div>

        <AnimatePresence>
          {showNewClientPopup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowNewClientPopup(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-[20%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto shadow-xl"
              >
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2 text-center">
                  Complete and submit intake form
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] text-center mb-6">
                  You&apos;ve been invited to join Malibu Bodies. Please fill out the form below to get started.
                </p>
                <GlassButton
                  variant="primary"
                  fullWidth
                  onClick={() => setShowNewClientPopup(false)}
                >
                  Got it
                </GlassButton>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}
