import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Target, Award, ChevronRight, Dumbbell, Heart, MessageCircle, Star, Gift, Flame, Apple, Scale, ClipboardList, Video, X, Smile, Sparkles, Activity } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { CountUp } from '@/components/ui/CountUp';
import { WelcomeHeader } from '@/components/Header';
import { getClientById, getClientBookings, getAffirmationOfTheDay, updateBookingStatus, requestClientReschedule, isBookingWithin24Hours, updateClientGoals, getClientNotificationLevel, setClientNotificationLevel, addClientFeedback, getClientStarCount, getClientGifts, getProgressStreak, getSharedWorkoutPrograms, getProgramCompletion, setProgramWorkoutCompletion, getExerciseVideo, getExerciseExplanation, getIdentityWorksheetEntries, getClientNotifications, getUnreadClientNotificationCount, markClientNotificationsRead } from '@/data/mockData';
import { parseLocalDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { getActivityGreeting } from '@/lib/greeting';

interface ClientDashboardProps {
  clientId: string;
  onViewSchedule: () => void;
  onViewProgress: () => void;
  onViewIdentitySheet?: () => void;
  onViewProfile?: () => void;
}

const PREBUILT_GOALS = ['Build muscle', 'Lose weight', 'Gain strength', 'Longevity', 'Improve flexibility', 'Increase energy', 'Better posture', 'Stress relief'];

function getGoalIcon(goal: string) {
  const g = goal.toLowerCase();
  if (g.includes('muscle') || g.includes('strength')) return Dumbbell;
  if (g.includes('weight') || g.includes('ton')) return Scale;
  if (g.includes('energy') || g.includes('endurance') || g.includes('active')) return Flame;
  if (g.includes('posture') || g.includes('mobility') || g.includes('flex')) return Activity;
  if (g.includes('stress') || g.includes('mind')) return Heart;
  if (g.includes('nutrition') || g.includes('food')) return Apple;
  return Target;
}

export function ClientDashboard({ clientId, onViewSchedule, onViewProgress, onViewIdentitySheet }: ClientDashboardProps) {
  const [, setRefreshKey] = useState(0);
  const [showRescheduleModal, setShowRescheduleModal] = useState<{ bookingId: string } | null>(null);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeelModal, setShowFeelModal] = useState<'feel' | 'help' | null>(null);
  const [showProgramRating, setShowProgramRating] = useState<{ programId: string; date: string } | null>(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState<{ name: string; videoUrl?: string; explanation?: string; sets?: number; reps?: string; duration?: string; weight?: string } | null>(null);
  const client = getClientById(clientId);
  const streak = getProgressStreak(clientId);
  const sharedPrograms = getSharedWorkoutPrograms(clientId);
  const identityEntries = getIdentityWorksheetEntries(clientId);
  const latestIdentity = identityEntries[0];
  const identityCompleted = latestIdentity?.answers && [latestIdentity.answers.decl1, latestIdentity.answers.decl2, latestIdentity.answers.decl3].every(Boolean);
  const identityStatus: 'not_started' | 'partial' | 'completed' = identityEntries.length === 0 ? 'not_started' : identityCompleted ? 'completed' : 'partial';
  const identitySheetLabel = identityStatus === 'not_started' ? 'Start identity sheet' : identityStatus === 'completed' ? 'View identity sheet' : 'Continue identity sheet';
  if (!client) return null;
  const clientBookings = getClientBookings(client.id);
  const upcomingBooking = clientBookings.find(b => parseLocalDate(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && b.status !== 'cancelled');
  const todayKey = new Date().toDateString();
  const completedWorkoutToday = clientBookings.some((b) => parseLocalDate(b.date).toDateString() === todayKey && b.status === 'completed');
  const hasWorkoutToday = clientBookings.some((b) => parseLocalDate(b.date).toDateString() === todayKey && b.status !== 'cancelled');
  const affirmation = getAffirmationOfTheDay(clientId);
  const within24h = upcomingBooking ? isBookingWithin24Hours(upcomingBooking) : false;
  const starCount = getClientStarCount(clientId);
  const gifts = getClientGifts(clientId);

  const stats = [
    { label: 'Sessions Left', value: client.sessionsRemaining, icon: Calendar },
    { label: 'Total Sessions', value: client.totalSessions, icon: Dumbbell },
    { label: 'Progress', value: '85%', icon: TrendingUp },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen pb-above-nav"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <WelcomeHeader 
        name={client.name}
        role="Client"
        avatar={client.avatar}
        notificationCount={getUnreadClientNotificationCount(clientId)}
        onNotificationClick={() => setShowNotifications(true)}
        activityMessage={getActivityGreeting(hasWorkoutToday, completedWorkoutToday)}
      />

      {getUnreadClientNotificationCount(clientId) > 0 && (() => {
        const unread = getClientNotifications(clientId).filter((n) => !n.read);
        const starNotice = unread.find((n) => n.type === 'star_received');
        return starNotice ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-2 flex items-center gap-2 rounded-xl bg-white/30 border border-white/50 px-4 py-2.5 text-left text-sm font-medium text-[var(--foreground)] hover:bg-white/40"
            onClick={() => setShowNotifications(true)}
          >
            <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)] shrink-0" />
            <span>{starNotice.trainerName} sent you a star!</span>
          </motion.button>
        ) : null;
      })()}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 space-y-6 max-w-lg mx-auto"
      >
        {/* Affirmation of the Day */}
        {affirmation && (
          <motion.div variants={itemVariants}>
            <div
              className="rounded-[var(--radius-card)] p-4 text-center"
              style={{
                background: (affirmation.color === '#F6A5C0' || !affirmation.color) ? 'linear-gradient(180deg, #F6A5C0 0%, #E890AB 100%)' : (affirmation.color || '#fce7f3'),
                color: affirmation.textColor || '#374151',
                fontFamily: affirmation.fontFamily || undefined,
              }}
            >
              {affirmation.graphic && affirmation.graphic !== 'none' && (
                <span className="flex justify-center mb-2" style={{ color: affirmation.textColor || '#374151' }}>
                  {affirmation.graphic === 'smiley' && <Smile className="w-6 h-6" />}
                  {affirmation.graphic === 'heart' && <Heart className="w-6 h-6" />}
                  {affirmation.graphic === 'star' && <Star className="w-6 h-6" />}
                  {affirmation.graphic === 'sparkle' && <Sparkles className="w-6 h-6" />}
                </span>
              )}
              <p className="italic font-medium">&ldquo;{affirmation.content}&rdquo;</p>
              <p className="text-xs mt-1 opacity-70">Affirmation of the day</p>
            </div>
          </motion.div>
        )}

        {/* Next Session - first content section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-section-header text-[var(--foreground)]">Next Session</h2>
            <button 
              onClick={onViewSchedule}
              className="text-sm text-[var(--primary)] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {upcomingBooking ? (
            <GlassCard variant="strong" className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--theme-gradient-start), var(--theme-gradient-end))' }}>
                    <span className="text-xs opacity-80">
                      {parseLocalDate(upcomingBooking.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold">
                      {parseLocalDate(upcomingBooking.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--foreground)]">
                      {parseLocalDate(upcomingBooking.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {upcomingBooking.time} • {upcomingBooking.duration} min
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      with {client.trainerName}
                    </p>
                  </div>
                  <GlassBadge variant="success">{upcomingBooking.status.replace(/_/g, ' ')}</GlassBadge>
                </div>
                <div className="mt-4 space-y-2">
                  <GlassButton 
                    variant="primary" 
                    fullWidth 
                    onClick={() => window.open('facetime:8184042932', '_blank')}
                  >
                    Join
                  </GlassButton>
                  <div className="flex gap-2">
                    <GlassButton 
                      variant="secondary" 
                      fullWidth 
                      onClick={() => setShowRescheduleModal({ bookingId: upcomingBooking.id })}
                      disabled={within24h}
                    >
                      {within24h ? 'Reschedule' : 'Reschedule'}
                    </GlassButton>
                    <GlassButton
                      fullWidth
                      variant="secondary"
                      onClick={() => !within24h && (updateBookingStatus(upcomingBooking.id, 'cancelled'), setRefreshKey((k) => k + 1))}
                      disabled={within24h}
                    >
                      {within24h ? 'Cancel' : 'Cancel'}
                    </GlassButton>
                  </div>
                </div>
                {within24h && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">Sessions cannot be changed within 24 hours of the scheduled start time.</p>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center">
              <Calendar className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">No upcoming sessions</p>
              <GlassButton 
                variant="primary" 
                className="mt-4"
                onClick={onViewSchedule}
              >
                Book a Session
              </GlassButton>
            </GlassCard>
          )}
        </motion.div>

        {/* Stats Grid - metric drama: numbers authoritative, labels lowercase */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const isProgress = stat.label === 'Progress';
            return (
              <motion.div
                key={stat.label}
                className={cn(
                  'relative overflow-hidden rounded-[var(--radius-card)] p-6',
                  isProgress && 'animate-shimmer'
                )}
                style={{
                  background: 'linear-gradient(135deg, var(--theme-gradient-start) 0%, var(--theme-gradient-mid) 50%, var(--theme-gradient-end) 100%)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative z-10">
                  <stat.icon className="w-5 h-5 text-white/85 mb-2" />
                  <p className="text-[34px] font-bold leading-tight text-white metric-value tracking-tight">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="metric-label text-white/85 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress Streak */}
        <motion.div variants={itemVariants}>
          <h2 className="text-section-header text-[var(--foreground)] mb-3">Progress Streak</h2>
          <GlassCard>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 rounded-[var(--radius-chip)] bg-[var(--primary)]/10">
                <Flame className="w-6 h-6 text-[var(--primary)] mb-1" />
                <span className="text-2xl font-bold text-[var(--foreground)] metric-value">{streak.workouts}</span>
                <span className="metric-label text-[var(--muted-foreground)]">Workouts</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-[var(--radius-chip)] bg-[var(--primary)]/10">
                <Apple className="w-6 h-6 text-[var(--primary)] mb-1" />
                <span className="text-2xl font-bold text-[var(--foreground)] metric-value">{streak.nutrition}</span>
                <span className="metric-label text-[var(--muted-foreground)]">Nutrition log</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-[var(--radius-chip)] bg-[var(--primary)]/10">
                <Scale className="w-6 h-6 text-[var(--primary)] mb-1" />
                <span className="text-2xl font-bold text-[var(--foreground)] metric-value">{streak.weighIns}</span>
                <span className="metric-label text-[var(--muted-foreground)]">Weigh-ins</span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-3 text-center">Log workouts, nutrition, and weigh-ins in Progress to build your streak</p>
          </GlassCard>
        </motion.div>

        {/* Shared Program from Bella */}
        {sharedPrograms.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-section-header text-[var(--foreground)] mb-3">Program from {client.trainerName}</h2>
            {sharedPrograms.map((program) => {
              const today = new Date().toISOString().slice(0, 10);
              const completion = getProgramCompletion(program.id, clientId, today);
              return (
                <GlassCard key={program.id} variant="strong">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ClipboardList className="w-8 h-8 text-[var(--primary)]" />
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{program.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Shared by {program.trainerName}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {program.exercises.map((ex) => {
                        const videoUrl = ex.videoUrl || getExerciseVideo(ex.name);
                        const explanation = ex.explanation || getExerciseExplanation(ex.name);
                        const hasDetail = videoUrl || explanation;
                        const repDisplay = ex.reps || ex.duration || '—';
                        return (
                          <li key={ex.id}>
                            <button
                              type="button"
                              onClick={() => setShowExerciseDetail({ name: ex.name, videoUrl, explanation, sets: ex.sets, reps: ex.reps, duration: ex.duration, weight: ex.weight })}
                              className={cn(
                                'w-full flex items-center justify-between text-sm p-2 rounded-lg -mx-2 hover:bg-white/30 cursor-pointer'
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {hasDetail && <Video className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />}
                                {ex.name}
                              </span>
                              <span className="text-[var(--muted-foreground)]">{ex.sets != null ? `${ex.sets}×` : ''}{repDisplay}{ex.weight ? ` • ${ex.weight}` : ''}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex gap-2">
                      <GlassButton
                        variant={completion?.completed ? 'secondary' : 'primary'}
                        fullWidth
                        onClick={() => {
                          setProgramWorkoutCompletion(program.id, clientId, today, !completion?.completed);
                          setRefreshKey((k) => k + 1);
                        }}
                      >
                        {completion?.completed ? '✓ Completed today' : 'Mark completed today'}
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        onClick={() => setShowProgramRating({ programId: program.id, date: today })}
                      >
                        Rate
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        )}

        {/* Rewards - Stars & Gifts */}
        <motion.div variants={itemVariants}>
          <h2 className="text-section-header text-[var(--foreground)] mb-3">Rewards</h2>
          <GlassCard className="overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
                <Star className="w-7 h-7 text-[var(--primary)] fill-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--foreground)]">Your stars</p>
                <p className="text-2xl font-bold text-[var(--primary)]">{starCount}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Keep being consistent!</p>
              </div>
            </div>
            {gifts.length > 0 && (
              <div className="border-t border-white/20 p-4 space-y-2">
                <p className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[var(--primary)]" /> Gifts from {client.trainerName}
                </p>
                {gifts.map((g) => (
                  <div key={g.id} className="p-3 rounded-xl bg-[var(--primary)]/10">
                    <p className="text-sm text-[var(--foreground)]">{g.message}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {new Date(g.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* How did you feel / How can Bella support you */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <GlassCard hover className="cursor-pointer" onClick={() => setShowFeelModal('feel')}>
            <div className="p-4 flex flex-col items-center text-center">
              <MessageCircle className="w-8 h-8 text-[var(--primary)] mb-2" />
              <p className="font-medium text-[var(--foreground)] text-sm">How did you feel today?</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Share with {client.trainerName}</p>
            </div>
          </GlassCard>
          <GlassCard hover className="cursor-pointer" onClick={() => setShowFeelModal('help')}>
            <div className="p-4 flex flex-col items-center text-center">
              <MessageCircle className="w-8 h-8 text-[var(--primary)] mb-2" />
              <p className="font-medium text-[var(--foreground)] text-sm">How can Bella support you?</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Let {client.trainerName} know</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Goals */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">My Goals</h2>
            <button
              onClick={() => setShowEditGoals(true)}
              className="text-sm text-[var(--primary)] font-medium hover:underline"
            >
              Edit
            </button>
          </div>
          
          <GlassCard>
            <div className="p-4 space-y-3">
              {client.goals?.map((goal, index) => {
                const GoalIcon = getGoalIcon(goal);
                return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <GoalIcon className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--foreground)]">{goal}</span>
                </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Identity sheet */}
        {onViewIdentitySheet && (
          <motion.div variants={itemVariants}>
            <GlassCard hover className="cursor-pointer" onClick={onViewIdentitySheet}>
              <div className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--foreground)]">{identitySheetLabel}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {identityStatus === 'not_started' ? 'Begin your identity rewrite workshop' : identityStatus === 'completed' ? 'Review your declaration and answers' : 'Pick up where you left off'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Recent Progress */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Progress</h2>
            <button 
              onClick={onViewProgress}
              className="text-sm text-[var(--primary)] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <GlassCard hover className="cursor-pointer" onClick={onViewProgress}>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-300 flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--foreground)]">Assessment Completed</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {client.lastAssessment && new Date(client.lastAssessment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Body fat reduced by</span>
                  <span className="font-semibold text-green-600">2%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <GlassButton 
              variant="primary" 
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={onViewSchedule}
            >
              Request Session
            </GlassButton>
            <GlassButton 
              leftIcon={<TrendingUp className="w-4 h-4" />}
              onClick={onViewProgress}
            >
              View Progress
            </GlassButton>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showRescheduleModal && (
          <RescheduleModal
            bookingId={showRescheduleModal.bookingId}
            onClose={() => setShowRescheduleModal(null)}
            onSuccess={() => { setShowRescheduleModal(null); setRefreshKey((k) => k + 1); }}
          />
        )}
        {showNotifications && (
          <NotificationsToggleModal clientId={clientId} onClose={() => setShowNotifications(false)} />
        )}
        {showFeelModal && (
          <FeedbackToBellaModal
            type={showFeelModal}
            clientId={clientId}
            trainerName={client.trainerName}
            onClose={() => setShowFeelModal(null)}
          />
        )}
        {showEditGoals && (
          <EditGoalsModal
            currentGoals={client.goals ?? []}
            onClose={() => setShowEditGoals(false)}
            onSave={(goals) => { updateClientGoals(clientId, goals); setShowEditGoals(false); setRefreshKey((k) => k + 1); }}
          />
        )}
        {showProgramRating && (
          <ProgramRatingModal
            programId={showProgramRating.programId}
            date={showProgramRating.date}
            clientId={clientId}
            program={sharedPrograms.find((p) => p.id === showProgramRating?.programId)}
            onClose={() => setShowProgramRating(null)}
            onSave={() => { setShowProgramRating(null); setRefreshKey((k) => k + 1); }}
          />
        )}
        {showExerciseDetail && (
          <ExerciseDetailModal
            name={showExerciseDetail.name}
            videoUrl={showExerciseDetail.videoUrl}
            explanation={showExerciseDetail.explanation}
            sets={showExerciseDetail.sets}
            reps={showExerciseDetail.reps}
            duration={showExerciseDetail.duration}
            weight={showExerciseDetail.weight}
            onClose={() => setShowExerciseDetail(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExerciseDetailModal({
  name,
  videoUrl,
  explanation,
  sets,
  reps,
  duration,
  weight,
  onClose,
}: {
  name: string;
  videoUrl?: string;
  explanation?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  weight?: string;
  onClose: () => void;
}) {
  const repDisplay = reps || duration;
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  const isVimeo = videoUrl?.includes('vimeo.com');
  const embedUrl = isYouTube
    ? videoUrl?.replace(/youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1').replace(/.*v=([^&]+).*/, 'https://www.youtube.com/embed/$1')
    : isVimeo
      ? `https://player.vimeo.com/video/${videoUrl?.split('/').pop()?.split('?')[0] || ''}`
      : null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[10%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{name}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {(sets != null || repDisplay || weight) && (
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            {[sets != null && `${sets} sets`, repDisplay, weight].filter(Boolean).join(' • ')}
          </p>
        )}
        {videoUrl && (
          <div className="mb-4 rounded-xl overflow-hidden bg-black/20">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={name}
                className="w-full aspect-video"
                allowFullScreen
              />
            ) : (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-6 text-[var(--primary)]"
              >
                <Video className="w-8 h-8" />
                Watch video
              </a>
            )}
          </div>
        )}
        {explanation && (
          <div className="p-4 rounded-xl bg-white/30">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">How to perform</p>
            <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{explanation}</p>
          </div>
        )}
        {!videoUrl && !explanation && (
          <p className="text-sm text-[var(--muted-foreground)] italic">No video or explanation for this exercise yet.</p>
        )}
      </motion.div>
    </>
  );
}

function FeedbackToBellaModal({ type, clientId, trainerName, onClose }: { type: 'feel' | 'help'; clientId: string; trainerName: string; onClose: () => void }) {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim()) {
      addClientFeedback({ clientId, type: type === 'feel' ? 'how_did_you_feel' : 'how_can_i_help', content: content.trim() });
      onClose();
    }
  };

  const title = type === 'feel' ? 'How did you feel you did today?' : 'How can I help?';
  const placeholder = type === 'feel' ? 'Share how you feel about your progress today...' : 'Let ' + trainerName + ' know how she can support you...';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">This will be sent to {trainerName}</p>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder} rows={4} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 resize-none" />
        <GlassButton variant="primary" fullWidth className="mt-4" onClick={handleSend} disabled={!content.trim()}>Send</GlassButton>
      </motion.div>
    </>
  );
}

function NotificationsToggleModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const level = getClientNotificationLevel(clientId);
  const [value, setValue] = useState(level);
  const notifications = getClientNotifications(clientId);

  const handleOpen = () => {
    markClientNotificationsRead(clientId);
  };

  const handleSelect = (next: 'all' | 'session-only' | 'off') => {
    setValue(next);
    setClientNotificationLevel(clientId, next);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onAnimationStart={handleOpen} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Notifications</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No new notifications</p>
        ) : (
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {notifications.map((n) => (
              n.type === 'star_received' ? (
                <li key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/30 border border-white/40">
                  <Star className="w-5 h-5 fill-[var(--primary)] text-[var(--primary)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{n.trainerName} sent you a star!</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ) : null
            ))}
          </ul>
        )}
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">Push notifications</p>
        <div className="space-y-2">
          {[
            { id: 'all' as const, label: 'All (notes, programs, session reminders)' },
            { id: 'session-only' as const, label: 'Session reminders only' },
            { id: 'off' as const, label: 'All off (including session reminders)' },
          ].map((opt) => (
            <button key={opt.id} type="button" onClick={() => handleSelect(opt.id)} className={cn('w-full py-3 px-4 rounded-xl text-left text-sm transition-colors', value === opt.id ? 'bg-[var(--primary)] text-white' : 'bg-white/50 hover:bg-white/70')}>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

function RescheduleModal({ bookingId, onClose, onSuccess }: { bookingId: string; onClose: () => void; onSuccess: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleRequest = () => {
    if (date && time) {
      requestClientReschedule(bookingId, date, time);
      onSuccess();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Request reschedule</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Pick a new date and time. Your trainer will confirm.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button key={t} onClick={() => setTime(t)} className={cn('px-4 py-2 rounded-xl text-sm', time === t ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>{t}</button>
              ))}
            </div>
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleRequest} disabled={!date || !time}>Request reschedule</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function EditGoalsModal({ currentGoals, onClose, onSave }: { currentGoals: string[]; onClose: () => void; onSave: (goals: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentGoals));
  const [custom, setCustom] = useState('');

  const toggle = (g: string) => {
    const next = new Set(selected);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    setSelected(next);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed) {
      setSelected((s) => new Set([...s, trimmed]));
      setCustom('');
    }
  };

  const handleSave = () => {
    onSave([...selected]);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Edit goals</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">Select or add your goals</p>
          <div className="flex flex-wrap gap-2">
            {PREBUILT_GOALS.map((g) => (
              <button
                key={g}
                onClick={() => toggle(g)}
                className={cn('px-4 py-2 rounded-xl text-sm', selected.has(g) ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              placeholder="Add custom goal..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60"
            />
            <GlassButton onClick={addCustom} disabled={!custom.trim()}>Add</GlassButton>
          </div>
          {selected.size > 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">Selected: {[...selected].join(', ')}</p>
          )}
          <GlassButton variant="primary" fullWidth onClick={handleSave}>Save goals</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function ProgramRatingModal({
  programId,
  date,
  clientId,
  program,
  onClose,
  onSave,
}: {
  programId: string;
  date: string;
  clientId: string;
  program?: { name: string; exercises: { id: string; name: string }[] };
  onClose: () => void;
  onSave: () => void;
}) {
  const completion = getProgramCompletion(programId, clientId, date);
  const [overallRating, setOverallRating] = useState(completion?.overallRating ?? 0);
  const [exerciseRatings, setExerciseRatings] = useState<Record<string, number>>(completion?.exerciseRatings ?? {});

  const handleSave = () => {
    setProgramWorkoutCompletion(programId, clientId, date, completion?.completed ?? false, overallRating, exerciseRatings);
    onSave();
  };

  if (!program) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Rate workout</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">{program.name}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Overall workout</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setOverallRating(r)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-sm font-medium',
                    overallRating === r ? 'bg-[var(--primary)] text-white' : 'bg-white/50'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rate each exercise</label>
            <div className="space-y-2">
              {program.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between">
                  <span className="text-sm">{ex.name}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setExerciseRatings((prev) => ({ ...prev, [ex.id]: r }))}
                        className={cn(
                          'w-8 h-8 rounded-lg text-xs',
                          exerciseRatings[ex.id] === r ? 'bg-[var(--primary)] text-white' : 'bg-white/50'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <GlassButton variant="primary" fullWidth onClick={handleSave}>Save ratings</GlassButton>
        </div>
      </motion.div>
    </>
  );
}
