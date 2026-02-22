import { useState, useMemo } from 'react';
import { ClipboardList, Plus, X } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Header } from '@/components/Header';
import { AddExerciseModal } from '@/sections/trainer/AddExerciseModal';
import type { ExerciseWithDetails } from '@/sections/trainer/ExerciseDetailsModal';
import { getTrainerPersonalProgram, setTrainerPersonalProgram } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import type { PersonalProgramExercise, TrainerPersonalProgram } from '@/types';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultSchedule: TrainerPersonalProgram['schedule'] = DAYS.map((day) => ({ day, exercises: [] }));

interface TrainerPersonalProgramPageProps {
  onBack: () => void;
}

export function TrainerPersonalProgramPage({ onBack }: TrainerPersonalProgramPageProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const existing = getTrainerPersonalProgram(trainerId);

  const [name, setName] = useState(existing?.name ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [schedule, setSchedule] = useState<TrainerPersonalProgram['schedule']>(
    existing?.schedule?.length ? existing.schedule : defaultSchedule
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const exercises = useMemo(() => schedule[selectedDay]?.exercises ?? [], [schedule, selectedDay]);

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
    setSchedule((prev) => {
      const next = prev.map((d, i) =>
        i === selectedDay
          ? { ...d, exercises: [...d.exercises, ex] }
          : d
      );
      return next;
    });
  };

  const removeExercise = (index: number) => {
    setSchedule((prev) => {
      const next = prev.map((d, i) =>
        i === selectedDay
          ? { ...d, exercises: d.exercises.filter((_, j) => j !== index) }
          : d
      );
      return next;
    });
  };

  const handleSave = () => {
    setTrainerPersonalProgram({ trainerId, name: name.trim(), notes: notes.trim() || undefined, schedule });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Program" subtitle="Your personal workout plan" showBack onBack={onBack} />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Program name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning routine"
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-2">General notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Overall plan, goals, reminders..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 resize-none text-[var(--foreground)]"
              />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Program builder</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Assign exercises to each day with sets, reps, and time.</p>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(index)}
                className={cn(
                  'w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all flex-shrink-0',
                  selectedDay === index
                    ? 'bg-[var(--primary)] text-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              >
                <span className="text-xs opacity-70">{day}</span>
              </button>
            ))}
          </div>

          <GlassCard>
            <div className="p-4">
              <h4 className="font-medium text-[var(--foreground)] mb-2">{DAYS[selectedDay]}</h4>
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
                      <button
                        type="button"
                        onClick={() => removeExercise(i)}
                        className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center flex-shrink-0"
                        aria-label="Remove exercise"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)] text-center py-6 text-sm">
                  No exercises added for {DAYS[selectedDay]} yet.
                </p>
              )}
              <GlassButton
                variant="primary"
                fullWidth
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddExercise(true)}
              >
                Add Exercise
              </GlassButton>
            </div>
          </GlassCard>

          <GlassButton variant="primary" fullWidth onClick={handleSave}>
            Save Program
          </GlassButton>
        </div>

        {!existing && !name.trim() && schedule.every((d) => d.exercises.length === 0) && (
          <GlassCard className="p-6 text-center">
            <ClipboardList className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
            <p className="text-sm text-[var(--muted-foreground)]">Add a name, pick a day, and add exercises with sets, reps, and duration.</p>
          </GlassCard>
        )}
      </div>

      {showAddExercise && (
        <AddExerciseModal
          onClose={() => setShowAddExercise(false)}
          onAdd={(details) => {
            handleAddExercise(details);
            setShowAddExercise(false);
          }}
          dayLabel={DAYS[selectedDay]}
        />
      )}
    </div>
  );
}
