import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Bell, CalendarX, ListTodo, Settings, ChevronRight, Dumbbell, CreditCard, Edit, Users, UserPlus, Plus } from 'lucide-react';
import { GlassInput } from '@/components/glass/GlassInput';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { ThemePicker } from '@/components/ThemePicker';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { addBroadcastNotice, getTrainerTodos, addTrainerTodo, toggleTrainerTodo, getTrainerPersonalProgram, setTrainerPersonalProgram, assessmentSections, intakeFormFields, addAssessmentSection, addIntakeFormField, getPastMemberships, addPastMembership, currentUser, updateTrainerAvatar, addLeadToList } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { LoginScreen } from '@/sections/LoginScreen';
import { TrainerDashboard } from '@/sections/trainer/TrainerDashboard';
import { ClientRoster } from '@/sections/trainer/ClientRoster';
import { ClientProfile as TrainerClientProfile } from '@/sections/trainer/ClientProfile';
import { Schedule as TrainerSchedule } from '@/sections/trainer/Schedule';
import { ProgressNotesTab } from '@/sections/trainer/ProgressNotesTab';
import { TrainerPersonalProgramPage } from '@/sections/trainer/TrainerPersonalProgramPage';
import { TrainerTodoListPage } from '@/sections/trainer/TrainerTodoListPage';
import { ExercisesTab } from '@/sections/trainer/ExercisesTab';
import { AddExerciseModal } from '@/sections/trainer/AddExerciseModal';
import type { ExerciseWithDetails } from '@/sections/trainer/ExerciseDetailsModal';
import type { PersonalProgramExercise, TrainerPersonalProgram } from '@/types';
import { ClientDashboard } from '@/sections/client/ClientDashboard';
import { ClientBookings } from '@/sections/client/ClientBookings';
import { ClientProgress } from '@/sections/client/ClientProgress';
import { ClientProfile } from '@/sections/client/ClientProfile';
import { ClientMemberships } from '@/sections/client/ClientMemberships';
import { InspirationBoard } from '@/sections/client/InspirationBoard';
import { IntakePublicPage } from '@/sections/IntakePublicPage';
import { Toaster, toast } from 'sonner';
import { generateSquarePaymentLink } from '@/lib/squarePayments';
import './App.css';

function isIntakePublicRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('intake') === '1' || params.get('intake') === 'true';
}

function getIntakeGateInfo(): { shouldForceIntake: boolean; completionKey: string | null } {
  if (typeof window === 'undefined') return { shouldForceIntake: false, completionKey: null };
  const params = new URLSearchParams(window.location.search);
  const intakeOnly = params.get('intakeOnly') === '1' || params.get('intakeOnly') === 'true';
  const newClient = params.get('newClient') === '1' || params.get('newClient') === 'true';
  const intake = params.get('intake') === '1' || params.get('intake') === 'true';
  if (!intake || (!intakeOnly && !newClient)) return { shouldForceIntake: false, completionKey: null };
  const token = params.get('invite') || params.get('trainerId') || 'default';
  const completionKey = `malibu-intake-complete:${token}`;
  const complete = localStorage.getItem(completionKey) === 'true';
  return { shouldForceIntake: !complete, completionKey };
}

function TrainerProfilePage({ onLogout, onNavigate, onNavigateToClients }: { onLogout: () => void; onNavigate: (tab: NavTab) => void; onNavigateToClients?: (filter?: 'warm-leads' | 'cold-leads') => void }) {
  const { openThemePicker } = useTheme();
  const { auth } = useAuth();
  const [avatarRefresh, setAvatarRefresh] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showPersonalProgramModal, setShowPersonalProgramModal] = useState(false);
  const [showAssessmentSettingsModal, setShowAssessmentSettingsModal] = useState(false);
  const [showRepurchaseOptionsModal, setShowRepurchaseOptionsModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState<'warm' | 'cold' | null>(null);

  const handleTrainerAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateTrainerAvatar(url);
      setAvatarRefresh((r) => r + 1);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-8 max-w-lg mx-auto space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Trainer Profile</h2>
        <p className="text-[var(--muted-foreground)] mb-6">Manage your profile and settings</p>

        <GlassCard>
          <div className="p-6 text-center">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTrainerAvatarChange}
            />
            <motion.div className="relative inline-block" whileHover={{ scale: 1.05 }}>
              <div className="w-32 h-24 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl mx-auto">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" key={avatarRefresh} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-semibold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--primary)]/90 transition-colors"
                title="Change profile picture"
              >
                <Edit className="w-4 h-4" />
              </button>
            </motion.div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4">{currentUser.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{currentUser.email}</p>
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => onNavigateToClients?.('warm-leads')}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Warm leads</p>
              <p className="text-sm text-[var(--muted-foreground)]">Archived clients who had bookings</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => onNavigateToClients?.('cold-leads')}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Cold leads</p>
              <p className="text-sm text-[var(--muted-foreground)]">Archived clients who never booked</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowAddLeadModal('cold')}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Add to cold leads</p>
              <p className="text-sm text-[var(--muted-foreground)]">Name, email, phone</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowAddLeadModal('warm')}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Add to warm leads</p>
              <p className="text-sm text-[var(--muted-foreground)]">Name, email, phone</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={openThemePicker}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Customize Theme</p>
              <p className="text-sm text-[var(--muted-foreground)]">Change colors and appearance</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowNoticeModal(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Send notice to all clients</p>
              <p className="text-sm text-[var(--muted-foreground)]">Trip, day off, schedule change</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowPersonalProgramModal(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Personal program</p>
              <p className="text-sm text-[var(--muted-foreground)]">Your own workout plan</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => onNavigate('schedule')}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <CalendarX className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Block days off</p>
              <p className="text-sm text-[var(--muted-foreground)]">Block dates on calendar</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowTodoModal(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Personal to-do list</p>
              <p className="text-sm text-[var(--muted-foreground)]">Your tasks and reminders</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowRepurchaseOptionsModal(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Manage repurchase options</p>
              <p className="text-sm text-[var(--muted-foreground)]">Past memberships clients can repurchase</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassCard hover className="cursor-pointer" onClick={() => setShowAssessmentSettingsModal(true)}>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Assessment & intake settings</p>
              <p className="text-sm text-[var(--muted-foreground)]">Add sections, customize forms</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </GlassCard>

        <GlassButton variant="primary" fullWidth onClick={onLogout} className="mt-4">
          Log Out
        </GlassButton>
      </div>

      {showNoticeModal && (
        <SendNoticeToAllModal onClose={() => setShowNoticeModal(false)} />
      )}
      {showTodoModal && (
        <TodoListModal onClose={() => setShowTodoModal(false)} />
      )}
      {showPersonalProgramModal && (
        <PersonalProgramModal onClose={() => setShowPersonalProgramModal(false)} />
      )}
      {showAssessmentSettingsModal && (
        <AssessmentIntakeSettingsModal onClose={() => setShowAssessmentSettingsModal(false)} />
      )}
      {showRepurchaseOptionsModal && (
        <RepurchaseOptionsModal trainerId={auth.status === 'trainer' ? auth.userId : 't1'} onClose={() => setShowRepurchaseOptionsModal(false)} />
      )}
      {showAddLeadModal && (
        <AddLeadModal
          leadType={showAddLeadModal}
          trainerId={auth.status === 'trainer' ? auth.userId : 't1'}
          onClose={() => setShowAddLeadModal(null)}
          onSuccess={() => {
            setShowAddLeadModal(null);
            onNavigateToClients?.(showAddLeadModal === 'cold' ? 'cold-leads' : 'warm-leads');
          }}
        />
      )}
    </div>
  );
}

function AddLeadModal({ leadType, trainerId, onClose, onSuccess }: { leadType: 'warm' | 'cold'; trainerId: string; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (name.trim() && email.trim()) {
      addLeadToList(trainerId, currentUser.name, { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined }, leadType);
      onSuccess();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Add to {leadType} leads</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="space-y-4">
          <GlassInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <GlassInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
          <GlassInput label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <GlassButton variant="primary" fullWidth className="mt-4" onClick={handleSave} disabled={!name.trim() || !email.trim()}>
          Add to {leadType} leads
        </GlassButton>
      </motion.div>
    </>
  );
}

function SendNoticeToAllModal({ onClose }: { onClose: () => void }) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      addBroadcastNotice({ trainerId, message: message.trim(), createdAt: new Date().toISOString() });
      onClose();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Notice to all clients</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <textarea
          placeholder="e.g., Taking Feb 20-22 off. No sessions those days."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 resize-none"
        />
        <GlassButton variant="primary" fullWidth className="mt-4" onClick={handleSend} disabled={!message.trim()}>
          Send to all clients
        </GlassButton>
      </motion.div>
    </>
  );
}

function TodoListModal({ onClose }: { onClose: () => void }) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const todos = getTrainerTodos(trainerId);
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTrainerTodo({ trainerId, text: newTodo.trim(), done: false });
      setNewTodo('');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">To-do list</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60"
          />
          <GlassButton onClick={handleAdd} disabled={!newTodo.trim()}>Add</GlassButton>
        </div>
        <div className="space-y-2">
          {todos.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/30">
              <input type="checkbox" checked={t.done} onChange={() => toggleTrainerTodo(t.id)} />
              <span className={t.done ? 'line-through text-[var(--muted-foreground)]' : ''}>{t.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

const PERSONAL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_PERSONAL_SCHEDULE: TrainerPersonalProgram['schedule'] = PERSONAL_DAYS.map((day) => ({ day, exercises: [] }));

function PersonalProgramModal({ onClose }: { onClose: () => void }) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const existing = getTrainerPersonalProgram(trainerId);
  const [name, setName] = useState(existing?.name ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [schedule, setSchedule] = useState<TrainerPersonalProgram['schedule']>(
    existing?.schedule?.length ? existing.schedule : DEFAULT_PERSONAL_SCHEDULE
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const exercises = schedule[selectedDay]?.exercises ?? [];

  const handleAddExercise = (exercise: ExerciseWithDetails) => {
    const ex: PersonalProgramExercise = {
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      duration: exercise.duration,
      weight: exercise.weight,
      notes: exercise.notes,
      videoUrl: exercise.videoUrl,
      explanation: exercise.explanation,
    };
    setSchedule((prev) =>
      prev.map((d, i) => (i === selectedDay ? { ...d, exercises: [...d.exercises, ex] } : d))
    );
  };

  const removeExercise = (index: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === selectedDay ? { ...d, exercises: d.exercises.filter((_, j) => j !== index) } : d))
    );
  };

  const handleSave = () => {
    setTrainerPersonalProgram({ trainerId, name: name.trim(), notes: notes.trim() || undefined, schedule });
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col max-w-lg mx-auto"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Personal program</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">×</button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Program name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning routine" className="w-full px-4 py-3 rounded-2xl glass-input text-[var(--foreground)]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Overall plan, goals, reminders..." rows={2} className="w-full px-4 py-3 rounded-2xl glass-input resize-none text-[var(--foreground)]" />
              </div>
            </div>
          </GlassCard>

          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Program builder</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Assign exercises to each day.</p>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PERSONAL_DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    'w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all flex-shrink-0',
                    selectedDay === index ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-white/50 hover:bg-white/70'
                  )}
                >
                  <span className="text-xs opacity-70">{day}</span>
                </button>
              ))}
            </div>

            <GlassCard>
              <div className="p-4">
                <h4 className="font-medium text-[var(--foreground)] mb-2">{PERSONAL_DAYS[selectedDay]}</h4>
                {exercises.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/30 gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-[var(--foreground)]">{ex.name}</span>
                          {(ex.sets || ex.reps || ex.duration || ex.weight || ex.notes) && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                              {[ex.sets != null && `${ex.sets} sets`, ex.reps, ex.duration, ex.weight].filter(Boolean).join(' • ')}
                              {ex.notes && ` • ${ex.notes}`}
                            </p>
                          )}
                        </div>
                        <button type="button" onClick={() => removeExercise(i)} className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center flex-shrink-0" aria-label="Remove"><span className="text-lg">×</span></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--muted-foreground)] text-center py-6 text-sm">No exercises for {PERSONAL_DAYS[selectedDay]} yet.</p>
                )}
                <GlassButton variant="primary" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddExercise(true)}>Add Exercise</GlassButton>
              </div>
            </GlassCard>

            <GlassButton variant="primary" fullWidth onClick={handleSave}>Save Program</GlassButton>
          </div>
        </div>
      </motion.div>

      {showAddExercise && (
        <AddExerciseModal
          onClose={() => setShowAddExercise(false)}
          onAdd={(details) => {
            handleAddExercise(details);
            setShowAddExercise(false);
          }}
          dayLabel={PERSONAL_DAYS[selectedDay]}
        />
      )}
    </>
  );
}

function AssessmentIntakeSettingsModal({ onClose }: { onClose: () => void }) {
  const [assessmentLabel, setAssessmentLabel] = useState('');
  const [intakeLabel, setIntakeLabel] = useState('');
  const [intakeType, setIntakeType] = useState<'text' | 'number' | 'textarea' | 'select'>('text');

  const handleAddAssessment = () => {
    if (assessmentLabel.trim()) {
      addAssessmentSection({ label: assessmentLabel.trim(), type: 'text' });
      setAssessmentLabel('');
    }
  };

  const handleAddIntake = () => {
    if (intakeLabel.trim()) {
      addIntakeFormField({ label: intakeLabel.trim(), type: intakeType });
      setIntakeLabel('');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Assessment & intake settings</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Add assessment section</h3>
            <div className="flex gap-2">
              <input value={assessmentLabel} onChange={(e) => setAssessmentLabel(e.target.value)} placeholder="Section name" className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
              <GlassButton onClick={handleAddAssessment} disabled={!assessmentLabel.trim()}>Add</GlassButton>
            </div>
            {assessmentSections.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                {assessmentSections.map((s) => (
                  <li key={s.id}>{s.label}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Add intake form field</h3>
            <div className="flex gap-2 mb-2">
              <input value={intakeLabel} onChange={(e) => setIntakeLabel(e.target.value)} placeholder="Field label" className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
              <select value={intakeType} onChange={(e) => setIntakeType(e.target.value as typeof intakeType)} className="px-4 py-3 rounded-2xl bg-white/50 border border-white/60">
                <option value="text">Text</option>
                <option value="textarea">Text area</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
              </select>
              <GlassButton onClick={handleAddIntake} disabled={!intakeLabel.trim()}>Add</GlassButton>
            </div>
            {intakeFormFields.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                {intakeFormFields.map((f) => (
                  <li key={f.id}>{f.label} ({f.type})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function RepurchaseOptionsModal({ trainerId, onClose }: { trainerId: string; onClose: () => void }) {
  const pastMemberships = getPastMemberships(trainerId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [squareUrl, setSquareUrl] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const handleAdd = () => {
    if (name.trim() && price && squareUrl.trim()) {
      addPastMembership({
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        squarePaymentUrl: squareUrl.trim(),
        trainerId,
      });
      setName('');
      setDescription('');
      setPrice('');
      setSquareUrl('');
    }
  };

  const handleGenerateSquareLink = async () => {
    const amount = Number(price);
    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter package name and valid price first');
      return;
    }

    setGeneratingLink(true);
    try {
      const url = await generateSquarePaymentLink(name.trim(), amount);
      setSquareUrl(url);
      toast.success('Square payment link generated');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to generate Square link');
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Repurchase options</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Add past memberships clients can repurchase via Square</p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 20 Sessions Pack" className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. In-person training" className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1200" className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Square payment URL</label>
            <input value={squareUrl} onChange={(e) => setSquareUrl(e.target.value)} placeholder="https://checkout.square.site/..." className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
            <GlassButton
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={handleGenerateSquareLink}
              disabled={generatingLink || !name.trim() || !price}
            >
              {generatingLink ? 'Generating...' : 'Generate with Square'}
            </GlassButton>
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleAdd} disabled={!name.trim() || !price || !squareUrl.trim()}>Add option</GlassButton>
        </div>
        <div>
          <h3 className="font-medium mb-2">Current options</h3>
          {pastMemberships.length > 0 ? (
            <ul className="space-y-2">
              {pastMemberships.map((m) => (
                <li key={m.id} className="p-3 rounded-xl bg-white/30 text-sm">{m.name} • ${m.price}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No options yet</p>
          )}
        </div>
      </motion.div>
    </>
  );
}

type ViewState = 
  | { type: 'dashboard' }
  | { type: 'clients'; initialFilter?: 'warm-leads' | 'cold-leads' }
  | { type: 'client-profile'; clientId: string }
  | { type: 'schedule' }
  | { type: 'exercises' }
  | { type: 'messages' }
  | { type: 'profile' }
  | { type: 'trainer-program' }
  | { type: 'trainer-todos' }
  | { type: 'bookings' }
  | { type: 'progress'; initialTab?: 'identity' }
  | { type: 'memberships' }
  | { type: 'inspiration' };

function App() {
  const { auth, logout, getClient } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [viewStack, setViewStack] = useState<ViewState[]>([{ type: 'dashboard' }]);
  const prevAuthRef = useRef(auth.status);

  useEffect(() => {
    if (auth.status !== 'unauthenticated' && prevAuthRef.current === 'unauthenticated') {
      setActiveTab('dashboard');
      setViewStack([{ type: 'dashboard' }]);
    }
    prevAuthRef.current = auth.status;
  }, [auth.status]);

  const role = auth.status === 'trainer' ? 'trainer' : 'client';
  const client = getClient();
  const rawIntakeGate = getIntakeGateInfo();
  const intakeGate = auth.status === 'trainer'
    ? { shouldForceIntake: false, completionKey: null as string | null }
    : rawIntakeGate;

  const currentView = viewStack[viewStack.length - 1];

  const pushView = (view: ViewState) => {
    setViewStack(prev => [...prev, view]);
  };

  /** Back button goes to home (dashboard) from any section */
  const goToHome = () => {
    setActiveTab('dashboard');
    setViewStack([{ type: 'dashboard' }]);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'dashboard':
        setViewStack([{ type: 'dashboard' }]);
        break;
      case 'clients':
        setViewStack([{ type: 'clients' }]);
        break;
      case 'schedule':
        setViewStack([{ type: role === 'client' ? 'bookings' : 'schedule' }]);
        break;
      case 'exercises':
        if (role === 'trainer') setViewStack([{ type: 'exercises' }]);
        break;
      case 'memberships':
        if (role === 'client') setViewStack([{ type: 'memberships' }]);
        break;
      case 'inspiration':
        if (role === 'client') setViewStack([{ type: 'inspiration' }]);
        break;
      case 'messages':
        if (role === 'trainer') {
          setViewStack([{ type: 'messages' }]);
        } else {
          setViewStack([{ type: 'progress' }]);
        }
        break;
      case 'profile':
        setViewStack([{ type: 'profile' }]);
        break;
    }
  };

  if (auth.status === 'unauthenticated') {
    if (intakeGate.shouldForceIntake) {
      return (
        <IntakePublicPage
          onSubmitted={() => {
            if (intakeGate.completionKey) localStorage.setItem(intakeGate.completionKey, 'true');
            const params = new URLSearchParams(window.location.search);
            ['intake', 'newClient', 'intakeOnly', 'invite', 'trainerId'].forEach((k) => params.delete(k));
            const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', next);
          }}
        />
      );
    }
    if (isIntakePublicRoute()) {
      return <IntakePublicPage />;
    }
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[var(--background)]">
          <LoginScreen />
        </div>
      </ThemeProvider>
    );
  }

  if (intakeGate.shouldForceIntake) {
    return (
      <IntakePublicPage
        onSubmitted={() => {
          if (intakeGate.completionKey) localStorage.setItem(intakeGate.completionKey, 'true');
          const params = new URLSearchParams(window.location.search);
          ['intake', 'newClient', 'intakeOnly', 'invite', 'trainerId'].forEach((k) => params.delete(k));
          const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
          window.history.replaceState({}, '', next);
          setActiveTab('dashboard');
          setViewStack([{ type: 'dashboard' }]);
        }}
      />
    );
  }

  return (
    <ThemeProvider>
      <Toaster position="top-center" richColors closeButton />
      <div className="min-h-screen bg-[var(--background)]">
        {/* Mobile Container */}
        <div className="max-w-lg mx-auto min-h-screen relative">
          <AnimatePresence mode="wait">
            {/* Trainer Views */}
            {role === 'trainer' && (
              <motion.div
                key={`trainer-${currentView.type}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentView.type === 'dashboard' && (
                  <TrainerDashboard
                    onViewClients={() => pushView({ type: 'clients' })}
                    onViewClient={(clientId) => pushView({ type: 'client-profile', clientId })}
                    onViewSchedule={() => pushView({ type: 'schedule' })}
                    onViewPersonalProgram={() => pushView({ type: 'trainer-program' })}
                    onViewTodoList={() => pushView({ type: 'trainer-todos' })}
                  />
                )}
                {currentView.type === 'clients' && (
                  <ClientRoster
                    onViewClient={(clientId) => pushView({ type: 'client-profile', clientId })}
                    onBack={goToHome}
                    initialFilter={currentView.initialFilter}
                  />
                )}
                {currentView.type === 'client-profile' && (
                  <TrainerClientProfile
                    clientId={currentView.clientId}
                    onBack={goToHome}
                  />
                )}
                {currentView.type === 'schedule' && (
                  <TrainerSchedule onBack={goToHome} />
                )}
                {currentView.type === 'exercises' && (
                  <ExercisesTab onBack={goToHome} />
                )}
                {currentView.type === 'messages' && (
                  <ProgressNotesTab onBack={goToHome} />
                )}
                {currentView.type === 'trainer-program' && (
                  <TrainerPersonalProgramPage onBack={goToHome} />
                )}
                {currentView.type === 'trainer-todos' && (
                  <TrainerTodoListPage onBack={goToHome} />
                )}
                {currentView.type === 'profile' && (
                  <TrainerProfilePage
                    onLogout={logout}
                    onNavigate={(tab) => handleTabChange(tab)}
                    onNavigateToClients={(filter) => {
                      setActiveTab('clients');
                      setViewStack([{ type: 'clients', initialFilter: filter }]);
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Client Views - clients only see their own data */}
            {role === 'client' && (
              <motion.div
                key={`client-${currentView.type}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentView.type === 'dashboard' && client && (
                  <ClientDashboard
                    clientId={client.id}
                    onViewSchedule={() => pushView({ type: 'bookings' })}
                    onViewProgress={() => pushView({ type: 'progress' })}
                    onViewIdentitySheet={() => pushView({ type: 'progress', initialTab: 'identity' })}
                    onViewProfile={() => handleTabChange('profile')}
                  />
                )}
                {currentView.type === 'bookings' && client && (
                  <ClientBookings clientId={client.id} onBack={goToHome} />
                )}
                {currentView.type === 'progress' && client && (
                  <ClientProgress clientId={client.id} onBack={goToHome} initialTab={currentView.initialTab} />
                )}
                {currentView.type === 'memberships' && client && (
                  <ClientMemberships clientId={client.id} onBack={goToHome} />
                )}
                {currentView.type === 'inspiration' && client && (
                  <InspirationBoard clientId={client.id} onBack={goToHome} />
                )}
                {currentView.type === 'profile' && client && (
                  <ClientProfile 
                    clientId={client.id}
                    onBack={goToHome}
                    onLogout={logout}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Navigation */}
          {(currentView.type === 'dashboard' || 
            currentView.type === 'clients' || 
            currentView.type === 'schedule' || 
            currentView.type === 'exercises' ||
            currentView.type === 'messages' || 
            currentView.type === 'profile' ||
            currentView.type === 'trainer-program' ||
            currentView.type === 'trainer-todos' ||
            currentView.type === 'bookings' ||
            currentView.type === 'progress' ||
            currentView.type === 'memberships' ||
            currentView.type === 'inspiration') && (
            <BottomNav 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              role={role}
            />
          )}

          {/* Theme Picker */}
          <ThemePicker />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
