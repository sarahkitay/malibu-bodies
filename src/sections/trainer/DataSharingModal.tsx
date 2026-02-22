import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Calendar, MessageSquare, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  getClientNotes,
  getClientAssessments,
  getClientIntakeForms,
  getTrainerDataSharePrefs,
  setTrainerDataSharePrefs,
  getClientSharedProgramsAll,
} from '@/data/mockData';
import { cn } from '@/lib/utils';

interface DataSharingModalProps {
  onClose: () => void;
  clientId: string;
  clientName: string;
}

type CategoryId = 'programs' | 'notes' | 'assessments' | 'intakes';

export function DataSharingModal({
  onClose,
  clientId,
  clientName,
}: DataSharingModalProps) {
  const prefs = getTrainerDataSharePrefs(clientId);
  const programs = getClientSharedProgramsAll(clientId);
  const notes = getClientNotes(clientId);
  const assessments = getClientAssessments(clientId);
  const intakes = getClientIntakeForms(clientId);

  const programIds = useMemo(() => programs.map((p) => p.id), [programs]);
  const noteIds = useMemo(() => notes.map((n) => n.id), [notes]);
  const assessmentIds = useMemo(() => assessments.map((a) => a.id), [assessments]);
  const intakeIds = useMemo(() => intakes.map((f) => f.id), [intakes]);

  const [programsOn, setProgramsOn] = useState(prefs.programs);
  const [notesOn, setNotesOn] = useState(prefs.notes);
  const [assessmentsOn, setAssessmentsOn] = useState(prefs.assessments);
  const [intakesOn, setIntakesOn] = useState(prefs.intakes);

  const [selectedProgramIds, setSelectedProgramIds] = useState<Set<string>>(() =>
    prefs.programs && prefs.sharedProgramIds === undefined ? new Set(programIds) : new Set(prefs.sharedProgramIds ?? [])
  );
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(() =>
    prefs.notes && prefs.sharedNoteIds === undefined ? new Set(noteIds) : new Set(prefs.sharedNoteIds ?? [])
  );
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<Set<string>>(() =>
    prefs.assessments && prefs.sharedAssessmentIds === undefined ? new Set(assessmentIds) : new Set(prefs.sharedAssessmentIds ?? [])
  );
  const [selectedIntakeIds, setSelectedIntakeIds] = useState<Set<string>>(() =>
    prefs.intakes && prefs.sharedIntakeIds === undefined ? new Set(intakeIds) : new Set(prefs.sharedIntakeIds ?? [])
  );

  const [expandedPrograms, setExpandedPrograms] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState(true);
  const [expandedAssessments, setExpandedAssessments] = useState(true);
  const [expandedIntakes, setExpandedIntakes] = useState(true);

  const toggleProgram = (id: string) => {
    setSelectedProgramIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleNote = (id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAssessment = (id: string) => {
    setSelectedAssessmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleIntake = (id: string) => {
    setSelectedIntakeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPrograms = () => setSelectedProgramIds(new Set(programIds));
  const selectNonePrograms = () => setSelectedProgramIds(new Set());
  const selectAllNotes = () => setSelectedNoteIds(new Set(noteIds));
  const selectNoneNotes = () => setSelectedNoteIds(new Set());
  const selectAllAssessments = () => setSelectedAssessmentIds(new Set(assessmentIds));
  const selectNoneAssessments = () => setSelectedAssessmentIds(new Set());
  const selectAllIntakes = () => setSelectedIntakeIds(new Set(intakeIds));
  const selectNoneIntakes = () => setSelectedIntakeIds(new Set());

  const handleSave = () => {
    setTrainerDataSharePrefs(clientId, {
      programs: programsOn,
      intakes: intakesOn,
      assessments: assessmentsOn,
      notes: notesOn,
      sharedProgramIds: programsOn ? (selectedProgramIds.size === programIds.length ? undefined : Array.from(selectedProgramIds)) : undefined,
      sharedNoteIds: notesOn ? (selectedNoteIds.size === noteIds.length ? undefined : Array.from(selectedNoteIds)) : undefined,
      sharedAssessmentIds: assessmentsOn ? (selectedAssessmentIds.size === assessmentIds.length ? undefined : Array.from(selectedAssessmentIds)) : undefined,
      sharedIntakeIds: intakesOn ? (selectedIntakeIds.size === intakeIds.length ? undefined : Array.from(selectedIntakeIds)) : undefined,
    });
    onClose();
  };

  const renderSection = (
    _id: CategoryId,
    title: string,
    Icon: React.ElementType,
    enabled: boolean,
    setEnabled: (v: boolean) => void,
    items: { id: string; label: string; sub?: string }[],
    selectedIds: Set<string>,
    toggle: (id: string) => void,
    selectAll: () => void,
    selectNone: () => void,
    expanded: boolean,
    setExpanded: (v: boolean) => void
  ) => (
    <div className="rounded-2xl bg-white/20 overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between p-3 cursor-pointer transition-colors',
          enabled ? 'bg-[var(--primary)]/10' : 'bg-white/10'
        )}
        onClick={() => setEnabled(!enabled)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[var(--foreground)]" />
          <span className="font-medium text-[var(--foreground)]">{title}</span>
          <span className="text-sm text-[var(--muted-foreground)]">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <label className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded" />
        </label>
      </div>
      {enabled && items.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-white/10"
          >
            <span>Choose which to share</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="px-3 pb-3 space-y-1 max-h-48 overflow-y-auto">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={selectAll} className="text-xs text-[var(--primary)] hover:underline">
                  Select all
                </button>
                <span className="text-[var(--muted-foreground)]">|</span>
                <button type="button" onClick={selectNone} className="text-xs text-[var(--primary)] hover:underline">
                  Deselect all
                </button>
              </div>
              {items.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors',
                    selectedIds.has(item.id) ? 'bg-[var(--primary)]/10' : 'hover:bg-white/10'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{item.label}</p>
                    {item.sub && <p className="text-xs text-[var(--muted-foreground)] truncate">{item.sub}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

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
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Data Sharing - {clientName}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Turn each category on to share with the client, then pick which specific items they can see.
          </p>

          {renderSection(
            'programs',
            'Programs',
            Calendar,
            programsOn,
            setProgramsOn,
            programs.map((p) => ({ id: p.id, label: p.name, sub: p.sharedAt ? `Shared ${new Date(p.sharedAt).toLocaleDateString()}` : undefined })),
            selectedProgramIds,
            toggleProgram,
            selectAllPrograms,
            selectNonePrograms,
            expandedPrograms,
            setExpandedPrograms
          )}

          {renderSection(
            'notes',
            'Progress Notes',
            MessageSquare,
            notesOn,
            setNotesOn,
            notes.map((n) => ({ id: n.id, label: n.content.slice(0, 50) + (n.content.length > 50 ? '…' : ''), sub: `${n.type} • ${new Date(n.date).toLocaleDateString()}` })),
            selectedNoteIds,
            toggleNote,
            selectAllNotes,
            selectNoneNotes,
            expandedNotes,
            setExpandedNotes
          )}

          {renderSection(
            'assessments',
            'Assessments',
            FileText,
            assessmentsOn,
            setAssessmentsOn,
            assessments.map((a) => ({ id: a.id, label: `Assessment ${new Date(a.date).toLocaleDateString()}`, sub: a.goals?.slice(0, 40) })),
            selectedAssessmentIds,
            toggleAssessment,
            selectAllAssessments,
            selectNoneAssessments,
            expandedAssessments,
            setExpandedAssessments
          )}

          {renderSection(
            'intakes',
            'Intakes',
            ClipboardList,
            intakesOn,
            setIntakesOn,
            intakes.map((f) => ({ id: f.id, label: `Intake ${new Date(f.date).toLocaleDateString()}`, sub: f.submittedAt ? `Submitted ${new Date(f.submittedAt).toLocaleDateString()}` : undefined })),
            selectedIntakeIds,
            toggleIntake,
            selectAllIntakes,
            selectNoneIntakes,
            expandedIntakes,
            setExpandedIntakes
          )}

          <div className="flex gap-3 pt-4">
            <GlassButton fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" fullWidth onClick={handleSave}>
              Save & Share
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </>
  );
}
