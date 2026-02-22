import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, X, Dumbbell, VideoOff } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { Header } from '@/components/Header';
import { getExerciseLibrary, addExerciseToLibrary, getExerciseVideo, setExerciseVideo, getExerciseExplanation, setExerciseExplanation, updateLibraryExerciseVideo, updateLibraryExerciseExplanation } from '@/data/mockData';
import { DEFAULT_EXERCISES } from '@/data/exercises';

interface ExercisesTabProps {
  onBack: () => void;
}

export function ExercisesTab({ onBack }: ExercisesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState<string | null>(null);
  const [, setRefresh] = useState(0);
  const customExercises = getExerciseLibrary();

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Exercise Library"
        subtitle="Add custom exercises, cues & reference videos"
        showBack
        onBack={onBack}
        rightAction={
          <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Exercise
          </GlassButton>
        }
      />
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <GlassCard>
          <div className="p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Default exercises</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Tap an exercise to add a reference video (URL or from device).
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {DEFAULT_EXERCISES.map((name) => {
                const hasVideo = !!getExerciseVideo(name);
                return (
                  <button
                    key={name}
                    onClick={() => setShowVideoModal(name)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/40 hover:bg-white/60 text-left transition-colors"
                  >
                    {hasVideo ? <Video className="w-4 h-4 text-green-600 flex-shrink-0" /> : <VideoOff className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />}
                    <span className="font-medium text-[var(--foreground)] truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-3">Custom exercises with cues & videos</h3>
          {customExercises.length > 0 ? (
            <div className="space-y-3">
              {customExercises.map((ex) => (
                <GlassCard key={ex.id} hover>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{ex.name}</p>
                        {ex.cues && (
                          <p className="text-sm text-[var(--muted-foreground)] mt-1">{ex.cues}</p>
                        )}
                        {ex.videoUrl ? (
                          <a
                            href={ex.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[var(--primary)] mt-2"
                          >
                            <Video className="w-4 h-4" />
                            Watch reference video
                          </a>
                        ) : null}
                      </div>
                      <button
                        onClick={() => setShowVideoModal(ex.name)}
                        className="text-sm text-[var(--primary)] flex-shrink-0"
                      >
                        {ex.videoUrl ? 'Change video' : 'Add video'}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <Dumbbell className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">No custom exercises yet</p>
              <GlassButton size="sm" className="mt-3" onClick={() => setShowAddModal(true)}>
                Add your first custom exercise
              </GlassButton>
            </GlassCard>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddCustomExerciseModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setRefresh((r) => r + 1);
            setShowAddModal(false);
          }}
        />
      )}
      {showVideoModal && (
        <AddVideoModal
          exerciseName={showVideoModal}
          isCustom={!!customExercises.find((e) => e.name === showVideoModal)}
          exerciseId={customExercises.find((e) => e.name === showVideoModal)?.id}
          onClose={() => setShowVideoModal(null)}
          onSave={() => {
            setRefresh((r) => r + 1);
            setShowVideoModal(null);
          }}
        />
      )}
    </div>
  );
}

function AddVideoModal({
  exerciseName,
  isCustom,
  exerciseId,
  onClose,
  onSave,
}: {
  exerciseName: string;
  isCustom: boolean;
  exerciseId?: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState(getExerciseVideo(exerciseName) ?? '');
  const [explanation, setExplanation] = useState(getExerciseExplanation(exerciseName) ?? '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() && !explanation.trim()) return;
    if (isCustom && exerciseId) {
      if (videoUrl.trim()) updateLibraryExerciseVideo(exerciseId, videoUrl.trim());
      if (explanation.trim()) updateLibraryExerciseExplanation(exerciseId, explanation.trim());
    } else {
      if (videoUrl.trim()) setExerciseVideo(exerciseName, videoUrl.trim());
      if (explanation.trim()) setExerciseExplanation(exerciseName, explanation.trim());
    }
    onSave();
  };


  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Add video for {exerciseName}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Explanation / form cues</label>
            <GlassTextArea
              placeholder="Form cues, how to perform, modifications..."
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">From device / file</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/50 border border-dashed border-[var(--border)] hover:bg-white/70"
            >
              <Video className="w-5 h-5" />
              Choose video from device
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs text-[var(--muted-foreground)]">
              <span className="bg-[var(--background)] px-2">or paste URL</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <GlassInput
              placeholder="https://youtube.com/... or https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-white/30"
            />
            <GlassButton type="submit" variant="primary" fullWidth disabled={!videoUrl.trim() && !explanation.trim()}>
              Save video & explanation
            </GlassButton>
          </form>
        </div>
      </motion.div>
    </>
  );
}

function AddCustomExerciseModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [cues, setCues] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const url = videoFile || videoUrl.trim() || undefined;
    addExerciseToLibrary({ name: name.trim(), cues: cues.trim() || undefined, videoUrl: url });
    onSave();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Add Custom Exercise</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Exercise name *</label>
            <GlassInput
              placeholder="e.g., Banded Clam Shell"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/30"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Cues / form notes</label>
            <GlassTextArea
              placeholder="Key form cues to remember..."
              rows={2}
              value={cues}
              onChange={(e) => setCues(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Reference video</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/50 border border-dashed border-[var(--border)] hover:bg-white/70 mb-2"
            >
              <Video className="w-5 h-5" />
              {videoFile ? 'Video selected' : 'Choose from device'}
            </button>
            <GlassInput
              placeholder="Or paste YouTube/Vimeo URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-white/30"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="button" fullWidth onClick={onClose}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" fullWidth disabled={!name.trim()}>Add Exercise</GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
