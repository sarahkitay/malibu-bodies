import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { getExerciseVideo, getExerciseExplanation } from '@/data/mockData';

export interface ExerciseWithDetails {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  weight?: string;
  notes?: string;
  videoUrl?: string;
  explanation?: string;
}

interface ExerciseDetailsModalProps {
  exerciseName: string;
  onClose: () => void;
  onSave: (details: ExerciseWithDetails) => void;
}

export function ExerciseDetailsModal({
  exerciseName,
  onClose,
  onSave,
}: ExerciseDetailsModalProps) {
  const [sets, setSets] = useState<number | ''>('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    setVideoUrl(getExerciseVideo(exerciseName) ?? '');
    setExplanation(getExerciseExplanation(exerciseName) ?? '');
  }, [exerciseName]);

  const handleSave = () => {
    onSave({
      name: exerciseName,
      sets: sets === '' ? undefined : Number(sets),
      reps: reps.trim() || undefined,
      duration: duration.trim() || undefined,
      weight: weight.trim() || undefined,
      notes: notes.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      explanation: explanation.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-[60] glass-strong rounded-3xl p-6 max-w-lg mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{exerciseName}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Sets</label>
              <GlassInput
                type="number"
                min={1}
                placeholder="e.g., 3"
                value={sets === '' ? '' : sets}
                onChange={(e) => setSets(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-white/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Reps</label>
              <GlassInput
                placeholder="e.g., 10-12 or AMRAP"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="bg-white/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Duration (optional)</label>
            <GlassInput
              placeholder="e.g., 30 sec, 1 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Weight (optional)</label>
            <GlassInput
              placeholder="e.g., 25 lbs, bodyweight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Video URL (optional)</label>
            <GlassInput
              placeholder="YouTube, Vimeo, or direct link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Explanation / cues</label>
            <GlassTextArea
              placeholder="Form cues, how to perform, modifications..."
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Notes</label>
            <GlassTextArea
              placeholder="Form cues, modifications, etc."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton fullWidth onClick={onClose}>Cancel</GlassButton>
            <GlassButton variant="primary" fullWidth onClick={handleSave}>Add to Program</GlassButton>
          </div>
        </div>
      </motion.div>
    </>
  );
}
