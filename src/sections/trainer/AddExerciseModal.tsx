import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { GlassInput } from '@/components/glass/GlassInput';
import { DEFAULT_EXERCISES } from '@/data/exercises';
import { getExerciseLibrary } from '@/data/mockData';
import { ExerciseDetailsModal, type ExerciseWithDetails } from '@/sections/trainer/ExerciseDetailsModal';
import { cn } from '@/lib/utils';

interface AddExerciseModalProps {
  onClose: () => void;
  onAdd: (exercise: ExerciseWithDetails) => void;
  dayLabel: string;
}

export function AddExerciseModal({
  onClose,
  onAdd,
  dayLabel,
}: AddExerciseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const allExerciseNames = useMemo(() => {
    const custom = getExerciseLibrary().map((e) => e.name);
    return Array.from(new Set([...DEFAULT_EXERCISES, ...custom])).sort();
  }, []);

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return allExerciseNames;
    const q = searchQuery.toLowerCase();
    return allExerciseNames.filter((ex) => ex.toLowerCase().includes(q));
  }, [allExerciseNames, searchQuery]);

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
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-hidden max-w-lg mx-auto flex flex-col"
      >
        <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Add Exercise - {dayLabel}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-[var(--border)]">
          <GlassInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-white/30"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise}
                onClick={() => setSelectedExercise(exercise)}
                className={cn(
                  'w-full p-3 rounded-xl text-left transition-colors hover:bg-white/50'
                )}
              >
                <p className="font-medium text-[var(--foreground)]">{exercise}</p>
              </button>
            ))}
          </div>
          {filteredExercises.length === 0 && (
            <p className="text-center text-[var(--muted-foreground)] py-8">
              No exercises found
            </p>
          )}
        </div>
        {selectedExercise && (
          <ExerciseDetailsModal
            exerciseName={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onSave={(details) => {
              onAdd(details);
              setSelectedExercise(null);
              onClose();
            }}
          />
        )}
      </motion.div>
    </>
  );
}
