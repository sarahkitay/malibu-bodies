import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Plus, ClipboardList, ListTodo, Dumbbell, Flame } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { WelcomeHeader } from '@/components/Header';
import { AddClientModal } from '@/sections/trainer/AddClientModal';
import { AddProgramModal } from '@/sections/trainer/AddProgramModal';
import { LogSessionModal } from '@/sections/trainer/LogSessionModal';
import { NotificationsPanel } from '@/sections/trainer/NotificationsPanel';
import { currentUser, getTrainerClients, bookings, getNotificationsForTrainer, getTrainerPrograms, getTrainerProgram } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getActivityGreeting } from '@/lib/greeting';

interface TrainerDashboardProps {
  onViewClients: () => void;
  onViewClient: (clientId: string) => void;
  onViewSchedule: () => void;
  onViewPersonalProgram?: () => void;
  onViewTodoList?: () => void;
}

export function TrainerDashboard({ onViewClients, onViewClient, onViewSchedule, onViewPersonalProgram, onViewTodoList }: TrainerDashboardProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const clients = getTrainerClients(trainerId);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showLogSession, setShowLogSession] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const activeClients = clients.filter(c => c.status === 'active');
  const clientIds = new Set(clients.map(c => c.id));
  const todaysBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    return clientIds.has(b.clientId) && bookingDate.toDateString() === today.toDateString();
  });
  
  const totalSessions = activeClients.reduce((acc, c) => acc + c.totalSessions, 0);
  const remainingSessions = activeClients.reduce((acc, c) => acc + c.sessionsRemaining, 0);
  const usedSessions = totalSessions - remainingSessions;
  const completedSessionsToday = todaysBookings.filter((b) => b.status === 'completed').length;
  const hasWorkoutToday = todaysBookings.length > 0;

  const stats = [
    { label: 'Active Clients', value: activeClients.length, icon: ClipboardList, onClick: onViewClients },
    { label: "Today's Sessions", value: todaysBookings.length, icon: Dumbbell, onClick: onViewSchedule },
    { label: 'Sessions Used', value: usedSessions, icon: Flame },
  ];

  return (
    <div className="min-h-screen pb-24">
      <WelcomeHeader 
        name={currentUser.name}
        role="Personal Trainer"
        avatar={currentUser.avatar}
        notificationCount={getNotificationsForTrainer(trainerId).length}
        onNotificationClick={() => setShowNotifications(true)}
        activityMessage={getActivityGreeting(hasWorkoutToday, completedSessionsToday > 0)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="px-4 space-y-6 max-w-lg mx-auto"
      >
        {/* Stats Grid - unified theme gradient */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <motion.button
              key={stat.label}
              onClick={stat.onClick}
              className="relative overflow-hidden rounded-2xl p-6 text-left"
              style={{ background: 'linear-gradient(135deg, var(--theme-gradient-start) 0%, var(--theme-gradient-mid) 50%, var(--theme-gradient-end) 100%)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <stat.icon className="w-5 h-5 text-white/85 mb-2" />
                <p className="text-[32px] font-bold leading-tight text-white">{stat.value}</p>
                <p className="text-[11px] font-medium text-white/85 uppercase tracking-[0.04em] mt-1">{stat.label}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Quick Actions</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <GlassButton 
              variant="primary" 
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap"
              onClick={() => setShowAddClient(true)}
            >
              Add Client
            </GlassButton>
            <GlassButton 
              leftIcon={<Calendar className="w-4 h-4" />}
              className="whitespace-nowrap"
              onClick={onViewSchedule}
            >
              Book Session
            </GlassButton>
            <GlassButton 
              leftIcon={<Clock className="w-4 h-4" />}
              className="whitespace-nowrap"
              onClick={() => setShowLogSession(true)}
            >
              Log Session
            </GlassButton>
          </div>
        </motion.div>

        {/* My Program & To-Do List */}
        {(onViewPersonalProgram || onViewTodoList) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="grid grid-cols-2 gap-3">
            {onViewPersonalProgram && (
              <GlassCard hover className="cursor-pointer" onClick={onViewPersonalProgram}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">My Program</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Personal workout plan</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                </div>
              </GlassCard>
            )}
            {onViewTodoList && (
              <GlassCard hover className="cursor-pointer" onClick={onViewTodoList}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                    <ListTodo className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">To-Do List</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Your tasks</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* Programs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Programs</h2>
            <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingProgramId(null); setShowAddProgram(true); }}>
              Add Program
            </GlassButton>
          </div>
          <div className="space-y-3">
            {getTrainerPrograms().length > 0 ? (
              getTrainerPrograms().map((prog) => (
                <GlassCard key={prog.id} hover className="cursor-pointer" onClick={() => setEditingProgramId(prog.id)}>
                  <div className="p-4">
                    <p className="font-medium text-[var(--foreground)]">{prog.name}</p>
                    {prog.description && <p className="text-sm text-[var(--muted-foreground)]">{prog.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prog.paymentLink && (
                        <a href={prog.paymentLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] hover:underline" onClick={(e) => e.stopPropagation()}>
                          Payment link
                        </a>
                      )}
                      {prog.paidCash && <span className="text-xs text-green-600">Paid cash</span>}
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-6 text-center">
                <ClipboardList className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
                <p className="text-sm text-[var(--muted-foreground)]">No programs yet</p>
                <GlassButton size="sm" className="mt-3" onClick={() => setShowAddProgram(true)}>Add Program</GlassButton>
              </GlassCard>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Today&apos;s Schedule</h2>
            <button 
              onClick={onViewSchedule}
              className="text-sm text-[var(--primary)] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {todaysBookings.length > 0 ? (
              todaysBookings.map((booking) => {
                const client = clients.find(c => c.id === booking.clientId);
                return (
                  <GlassCard key={booking.id} hover className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
                        {booking.time}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-[var(--foreground)]">{client?.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {booking.duration} min • {booking.type}
                        </p>
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium',
                        booking.status === 'confirmed' 
                          ? 'bg-green-500/15 text-green-600' 
                          : 'bg-amber-500/15 text-amber-600'
                      )}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted-foreground)]">No sessions scheduled for today</p>
                <GlassButton 
                  variant="primary" 
                  className="mt-4"
                  onClick={onViewSchedule}
                >
                  Schedule Session
                </GlassButton>
              </GlassCard>
            )}
          </div>
        </motion.div>

        {/* Recent Clients */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Clients</h2>
            <button 
              onClick={onViewClients}
              className="text-sm text-[var(--primary)] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {activeClients.slice(0, 3).map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <GlassCard 
                  hover 
                  className="overflow-hidden cursor-pointer"
                  onClick={() => onViewClient(client.id)}
                >
                  <div className="flex items-center p-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/50">
                        {client.avatar ? (
                          <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg font-semibold">
                            {client.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {client.sessionsRemaining <= 3 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                          !
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-[var(--foreground)]">{client.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {client.sessionsRemaining} sessions remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium',
                        client.sessionsRemaining > 5 
                          ? 'bg-green-500/15 text-green-600' 
                          : client.sessionsRemaining > 0 
                            ? 'bg-amber-500/15 text-amber-600' 
                            : 'bg-red-500/15 text-red-600'
                      )}>
                        {client.sessionsRemaining > 0 ? 'Active' : 'No sessions'}
                      </span>
                      {client.lastAssessment && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Last: {new Date(client.lastAssessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
        {showAddClient && (
          <AddClientModal
            onClose={() => setShowAddClient(false)}
            onSuccess={() => setShowAddClient(false)}
            trainerId={trainerId}
            trainerName={currentUser.name}
          />
        )}
        {showLogSession && (
          <LogSessionModal
            onClose={() => setShowLogSession(false)}
            onSuccess={() => setShowLogSession(false)}
            trainerId={trainerId}
          />
        )}
        {(showAddProgram || editingProgramId) && (
          <AddProgramModal
            program={editingProgramId ? getTrainerProgram(editingProgramId) ?? undefined : undefined}
            onClose={() => { setShowAddProgram(false); setEditingProgramId(null); }}
            onSave={() => { setShowAddProgram(false); setEditingProgramId(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
