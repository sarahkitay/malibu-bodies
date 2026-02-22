import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, FileText, Image, MessageSquare, Heart, 
  Clock, Edit, Share2, UserX, Plus, CheckCircle, UtensilsCrossed, ClipboardList, X, Star, Paperclip, Mail, Phone, Smile, Sparkles 
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { AddExerciseModal } from '@/sections/trainer/AddExerciseModal';
import { ScheduleSessionModal } from '@/sections/trainer/ScheduleSessionModal';
import { IntakeFormEmbed } from '@/sections/trainer/IntakeFormEmbed';
import type { ExerciseWithDetails } from '@/sections/trainer/ExerciseDetailsModal';
import { DataSharingModal } from '@/sections/trainer/DataSharingModal';
import { AddAffirmationModal } from '@/sections/trainer/AddAffirmationModal';
import { AddProgressNoteModal } from '@/sections/trainer/AddProgressNoteModal';
import { toast } from 'sonner';
import { getClientById, getClientNotes, getClientBookings, getClientAffirmations, getClientNutritionEntries, getClientWeighIns, updateClientAccessCode, generateAccessCode, getClientProgressPhotos, addProgressPhoto, getClientAssessments, addAssessment, getClientIntakeForms, addClientIntakeForm, addClientStar, getClientStarCount, getClientGifts, getClientFeedbackForTrainer, addClientGift, setClientStatus, updateClientInfo, useClientSession, addSharedWorkoutProgram, getExerciseVideo, getExerciseExplanation, addNutritionEntry, addStaffNutritionPlan, getClientStaffNutritionPlans, getSavedClientPrograms, saveClientProgram, getClientSpecificPackages, addClientSpecificPackage } from '@/data/mockData';
import { getIntakeSubmissions, uploadIntakeAttachment, type IntakeSubmissionData } from '@/lib/firebaseIntake';
import { cn } from '@/lib/utils';
import { formatDateForInput } from '@/lib/dateUtils';
import type { Client } from '@/types';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
}

type TabType = 'assessment' | 'intake' | 'program' | 'nutrition' | 'photos' | 'notes' | 'affirmations' | 'booking' | 'feedback';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'assessment', label: 'Assessment', icon: FileText },
  { id: 'intake', label: 'Intake', icon: ClipboardList },
  { id: 'program', label: 'Program', icon: Calendar },
  { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'affirmations', label: 'Affirmations', icon: Heart },
  { id: 'booking', label: 'Booking', icon: Clock },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export function ClientProfile({ clientId, onBack }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('assessment');
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [, setRefresh] = useState(0);
  const [showDataSharing, setShowDataSharing] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [, setStarRefresh] = useState(0);
  const [, setStatusRefresh] = useState(0);
  const client = getClientById(clientId);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-[var(--muted-foreground)]">Client not found</p>
          <GlassButton onClick={onBack} className="mt-4">Go Back</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header - compact */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong"
      >
        <div className="px-4 py-2 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <motion.button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/70 flex-shrink-0" whileTap={{ scale: 0.9 }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/40">
              {client.avatar ? (
                <img src={client.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold">
                  {client.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-[var(--foreground)] truncate">{client.name}</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Age {client.age} · {client.sessionsRemaining} sessions left</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <motion.button className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/70 text-[var(--primary)]" whileTap={{ scale: 0.9 }} onClick={() => { addClientStar(clientId, client.trainerId); setStarRefresh((r) => r + 1); toast.success(`Star sent to ${client.name}!`, { description: 'They\'ll see a notice in their app.' }); }} title="Send star"><Star className="w-3.5 h-3.5 fill-[var(--primary)]" /></motion.button>
              <motion.button className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/70" whileTap={{ scale: 0.9 }} onClick={() => setShowDataSharing(true)} title="Data sharing"><Share2 className="w-3.5 h-3.5" /></motion.button>
              <motion.button className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/70 text-[var(--primary)]" whileTap={{ scale: 0.9 }} onClick={() => { setClientStatus(clientId, client.status === 'inactive' ? 'active' : 'inactive'); setStatusRefresh((r) => r + 1); }} title="Toggle status"><UserX className="w-3.5 h-3.5" /></motion.button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-[var(--border)]">
          <div className="flex overflow-x-auto scrollbar-hide px-4 max-w-lg mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative',
                    isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeProfileTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Content - pt accounts for sticky header when scrolled */}
      <div className="px-4 pt-4 pb-6 max-w-lg mx-auto">
        {/* Client Info - compact bar */}
        <GlassCard className="mb-4 overflow-hidden">
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <GlassBadge variant={client.status === 'active' ? 'success' : client.leadType === 'warm' ? 'success' : 'warning'} size="sm">
                {client.status === 'inactive' && client.leadType ? `${client.status} (${client.leadType})` : client.status}
              </GlassBadge>
              <span className="text-sm text-[var(--muted-foreground)] truncate">{client.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">Access Code:</span>
              {editingCode ? (
                <div className="flex gap-2">
                  <GlassInput
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                        placeholder="4-6 chars"
                        className="w-24 h-8 text-sm"
                      />
                      <GlassButton size="sm" onClick={() => { updateClientAccessCode(clientId, newCode); setEditingCode(false); setNewCode(''); }}>Save</GlassButton>
                      <GlassButton size="sm" variant="secondary" onClick={() => setEditingCode(false)}>Cancel</GlassButton>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-semibold">{client.accessCode}</span>
                      <GlassButton size="sm" variant="secondary" onClick={() => { setNewCode(client.accessCode); setEditingCode(true); }}>Change</GlassButton>
                      <GlassButton size="sm" variant="secondary" onClick={() => { updateClientAccessCode(clientId, generateAccessCode()); setRefresh((r) => r + 1); }}>Regenerate</GlassButton>
                    </>
                  )}
                </div>
            <div className="flex gap-2 flex-wrap pt-2 border-t border-[var(--border)]">
              <GlassButton variant="primary" size="sm" leftIcon={<Edit className="w-4 h-4" />} onClick={() => setShowEditClient(true)}>
                Edit Info
              </GlassButton>
              <GlassButton size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => setShowDataSharing(true)}>
                Data Sharing
              </GlassButton>
              {client.sessionsRemaining > 0 && (
                <GlassButton 
                  size="sm" 
                  variant="primary"
                  className="bg-green-500 hover:bg-green-600 ml-auto"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => {
                    if (useClientSession(clientId)) setRefresh((r) => r + 1);
                  }}
                >
                  Use Session
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Tab Content - scroll-margin prevents sticky header overlap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="scroll-mt-28"
            style={{ scrollMarginTop: '7rem' }}
          >
            {activeTab === 'assessment' && <AssessmentTab clientId={clientId} />}
            {activeTab === 'intake' && <IntakeTab clientId={clientId} />}
            {activeTab === 'program' && <ProgramTab clientId={clientId} />}
            {activeTab === 'nutrition' && <TrainerNutritionTab clientId={clientId} />}
            {activeTab === 'photos' && <PhotosTab clientId={clientId} />}
            {activeTab === 'notes' && <NotesTab clientId={clientId} />}
            {activeTab === 'affirmations' && <AffirmationsTab clientId={clientId} />}
            {activeTab === 'booking' && <BookingTab clientId={clientId} trainerId={client.trainerId} />}
            {activeTab === 'feedback' && <FeedbackTab clientId={clientId} trainerId={client.trainerId} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {showDataSharing && client && (
        <DataSharingModal
          onClose={() => setShowDataSharing(false)}
          clientId={clientId}
          clientName={client.name}
        />
      )}
      {showEditClient && client && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditClient(false)}
          onSave={() => { setShowEditClient(false); setRefresh((r) => r + 1); }}
        />
      )}
    </div>
  );
}

function EditClientModal({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || '');
  const [age, setAge] = useState(client.age.toString());
  const [notes, setNotes] = useState(client.notes || '');
  const [gender, setGender] = useState<Client['gender']>(client.gender ?? undefined);

  const handleSave = () => {
    const ageNum = parseInt(age, 10);
    if (name.trim() && !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120 && email.trim()) {
      updateClientInfo(client.id, { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, age: ageNum, notes: notes.trim() || undefined, gender: gender || undefined });
      onSave();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[10%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Edit Client Info</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors">×</button>
        </div>
        <div className="space-y-4">
          <GlassInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} leftIcon={<Edit className="w-4 h-4" />} />
          <GlassInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail className="w-4 h-4" />} />
          <GlassInput label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} leftIcon={<Phone className="w-4 h-4" />} />
          <GlassInput label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} leftIcon={<Calendar className="w-4 h-4" />} />
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Pronouns (for Identity Worksheet)</label>
            <select
              value={gender ?? ''}
              onChange={(e) => setGender((e.target.value || undefined) as Client['gender'] | undefined)}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 text-[var(--foreground)]"
            >
              <option value="">Not set</option>
              <option value="woman">She / Her</option>
              <option value="man">He / Him</option>
              <option value="non-binary">They / Them</option>
            </select>
          </div>
          <GlassTextArea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="bg-white/30" />
          <GlassButton variant="primary" fullWidth onClick={handleSave}>Save Changes</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function AssessmentTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const savedAssessments = getClientAssessments(clientId);
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [overheadKnee, setOverheadKnee] = useState('');
  const [overheadHip, setOverheadHip] = useState('');
  const [overheadScore, setOverheadScore] = useState('');
  const [overheadNotes, setOverheadNotes] = useState('');
  const [shoulderRight, setShoulderRight] = useState('');
  const [shoulderLeft, setShoulderLeft] = useState('');
  const [shoulderNotes, setShoulderNotes] = useState('');
  const [hamstringScore, setHamstringScore] = useState('');
  const [hamstringNotes, setHamstringNotes] = useState('');
  const [pushupScore, setPushupScore] = useState('');
  const [pushupNotes, setPushupNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [goals, setGoals] = useState('');

  const handleSave = () => {
    addAssessment({
      clientId,
      date,
      weight: weight ? Number(weight) : undefined,
      overheadSquat: { kneeIssues: overheadKnee, hipShift: overheadHip, overallScore: overheadScore, notes: overheadNotes },
      shoulderMobility: { rightScore: shoulderRight ? Number(shoulderRight) : undefined, leftScore: shoulderLeft ? Number(shoulderLeft) : undefined, notes: shoulderNotes },
      hamstringMobility: { score: hamstringScore ? Number(hamstringScore) : undefined, notes: hamstringNotes },
      pushUpAssessment: { score: pushupScore ? Number(pushupScore) : undefined, notes: pushupNotes },
      goals: goals || undefined,
    });
    setRefresh((r) => r + 1);
    setDate(formatDateForInput(new Date()));
    setOverheadKnee(''); setOverheadHip(''); setOverheadScore(''); setOverheadNotes('');
    setShoulderRight(''); setShoulderLeft(''); setShoulderNotes('');
    setHamstringScore(''); setHamstringNotes('');
    setPushupScore(''); setPushupNotes('');
    setWeight(''); setGoals('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Assessments</h3>
      </div>

      {savedAssessments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Saved assessments</h4>
          {savedAssessments.map((a) => (
            <GlassCard key={a.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{new Date(a.date).toLocaleDateString('en-US')}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {a.weight && `${a.weight} lbs`}
                    {a.overheadSquat?.overallScore && ` • Squat: ${a.overheadSquat.overallScore}`}
                    {a.goals && ` • ${a.goals}`}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard>
        <div className="p-4 space-y-6">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Assessment Date</label>
            <GlassInput type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Weight (lbs)</label>
            <GlassInput type="number" placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-white/30" />
          </div>
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h4 className="font-medium text-[var(--foreground)]">Overhead Squat</h4>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput placeholder="Knee issues" value={overheadKnee} onChange={(e) => setOverheadKnee(e.target.value)} className="bg-white/30" />
              <GlassInput placeholder="Hip shift" value={overheadHip} onChange={(e) => setOverheadHip(e.target.value)} className="bg-white/30" />
            </div>
            <GlassInput placeholder="Overall score 1-10" value={overheadScore} onChange={(e) => setOverheadScore(e.target.value)} className="bg-white/30" />
            <GlassTextArea placeholder="Notes" rows={2} value={overheadNotes} onChange={(e) => setOverheadNotes(e.target.value)} className="bg-white/30" />
          </div>
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h4 className="font-medium text-[var(--foreground)]">Shoulder Mobility</h4>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput placeholder="Right 1-3" value={shoulderRight} onChange={(e) => setShoulderRight(e.target.value)} className="bg-white/30" />
              <GlassInput placeholder="Left 1-3" value={shoulderLeft} onChange={(e) => setShoulderLeft(e.target.value)} className="bg-white/30" />
            </div>
            <GlassTextArea placeholder="Notes" rows={2} value={shoulderNotes} onChange={(e) => setShoulderNotes(e.target.value)} className="bg-white/30" />
          </div>
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h4 className="font-medium text-[var(--foreground)]">Hamstring Mobility</h4>
            <GlassInput placeholder="Score" value={hamstringScore} onChange={(e) => setHamstringScore(e.target.value)} className="bg-white/30" />
            <GlassTextArea placeholder="Notes" rows={2} value={hamstringNotes} onChange={(e) => setHamstringNotes(e.target.value)} className="bg-white/30" />
          </div>
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h4 className="font-medium text-[var(--foreground)]">Push-up Assessment</h4>
            <GlassInput placeholder="Score" value={pushupScore} onChange={(e) => setPushupScore(e.target.value)} className="bg-white/30" />
            <GlassTextArea placeholder="Notes" rows={2} value={pushupNotes} onChange={(e) => setPushupNotes(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Goals</label>
            <GlassTextArea placeholder="Client goals" rows={2} value={goals} onChange={(e) => setGoals(e.target.value)} className="bg-white/30" />
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleSave}>Save Assessment</GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

function IntakeTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [firebaseIntakes, setFirebaseIntakes] = useState<{ id: string; data: IntakeSubmissionData }[]>([]);
  const [loadingFirebaseIntakes, setLoadingFirebaseIntakes] = useState(false);
  const client = getClientById(clientId);
  const baseUrl = `${window.location.origin}${window.location.pathname || '/'}`.replace(/\/$/, '');
  const trainerId = client?.trainerId ?? 't1';
  const intakeUrl = `${baseUrl}?intake=1&trainerId=${trainerId}`;
  const intakeUrlNewClient = `${baseUrl}?intake=1&newClient=1&intakeOnly=1&trainerId=${trainerId}`;
  const shareTitle = 'Malibu Bodies Application & Intake Form';
  const shareText = 'You are invited to Malibu Bodies. Download/open the app and complete your intake to unlock your full client portal.';
  const savedIntakes = getClientIntakeForms(clientId);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoadingFirebaseIntakes(true);
      try {
        const submissions = await getIntakeSubmissions(trainerId);
        if (!active) return;
        setFirebaseIntakes(submissions);
      } finally {
        if (active) setLoadingFirebaseIntakes(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [trainerId, showLogModal, showInviteModal]);

  const handleShare = async (asNewClient: boolean) => {
    const url = asNewClient ? intakeUrlNewClient : intakeUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyAndFallback(url);
      }
    } else {
      copyAndFallback(url);
    }
  };

  const copyAndFallback = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Link copied! Paste in email or text to share.');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Malibu Bodies Application & Intake Form</h3>
      <p className="text-sm text-[var(--muted-foreground)]">
        Share this form with new or interested clients. Submissions save to Firebase.
      </p>

      {/* Intake form (embedded under tab) */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <IntakeFormEmbed trainerId={client?.trainerId} preview />
        </div>
      </GlassCard>

      {/* Invite / Email link */}
      <GlassCard>
        <div className="p-4 space-y-4">
          <h4 className="font-medium text-[var(--foreground)]">Invite to complete intake</h4>
          <div className="flex flex-col gap-2">
            <GlassButton
              variant="secondary"
              fullWidth
              onClick={() => window.open(intakeUrlNewClient, '_blank')}
            >
              Open New-Client Intake Link
            </GlassButton>
            <GlassButton variant="primary" fullWidth leftIcon={<Mail className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>
              Email intake link
            </GlassButton>
            <p className="text-xs text-[var(--muted-foreground)]">
              Choose &quot;New client&quot; when inviting. They&apos;ll see a popup to complete the form.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Saved intakes */}
      {savedIntakes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Logged intakes for this client</h4>
          {savedIntakes.map((f) => (
            <GlassCard key={f.id} className="p-4">
              <p className="font-medium">{new Date(f.date).toLocaleDateString('en-US')}</p>
              {f.submittedAt && (
                <p className="text-xs text-[var(--muted-foreground)]">Submitted {new Date(f.submittedAt).toLocaleDateString()}</p>
              )}
              {f.attachmentName && (
                <p className="text-xs text-[var(--primary)] mt-1 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> {f.attachmentName}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Recent submitted intakes (Firebase)</h4>
        {loadingFirebaseIntakes ? (
          <GlassCard className="p-4 text-sm text-[var(--muted-foreground)]">Loading submissions...</GlassCard>
        ) : firebaseIntakes.length > 0 ? (
          firebaseIntakes.slice(0, 8).map((entry) => (
            <GlassCard key={entry.id} className="p-4">
              <p className="font-medium">{entry.data.fullName || 'Unnamed submission'}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{entry.data.email}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Submitted {entry.data.submittedAt ? new Date(entry.data.submittedAt).toLocaleString() : 'Unknown'}
              </p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-4 text-sm text-[var(--muted-foreground)]">No Firebase intake submissions yet.</GlassCard>
        )}
      </div>

      <GlassButton
        size="sm"
        variant="secondary"
        leftIcon={<ClipboardList className="w-4 h-4" />}
        onClick={() => setShowLogModal(true)}
      >
        Log intake received
      </GlassButton>

      {showLogModal && (
        <LogIntakeModal
          clientId={clientId}
          onClose={() => setShowLogModal(false)}
          onSuccess={() => { setShowLogModal(false); setRefresh((r) => r + 1); }}
        />
      )}

      {showInviteModal && (
        <InviteIntakeModal
          intakeUrl={intakeUrl}
          intakeUrlNewClient={intakeUrlNewClient}
          onClose={() => setShowInviteModal(false)}
          onShare={handleShare}
          copyAndFallback={copyAndFallback}
        />
      )}
    </div>
  );
}

function LogIntakeModal({ clientId, onClose, onSuccess }: { clientId: string; onClose: () => void; onSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadIntakeAttachment(file);
      setAttachmentUrl(url);
      setAttachmentName(file.name);
    } catch {
      const url = URL.createObjectURL(file);
      setAttachmentUrl(url);
      setAttachmentName(file.name);
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleLog = () => {
    addClientIntakeForm({
      clientId,
      date: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
    });
    onSuccess();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Log intake received</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Optionally attach a photo or file</p>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
        <GlassButton
          size="sm"
          variant="secondary"
          leftIcon={<Paperclip className="w-4 h-4" />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mb-4"
        >
          {uploading ? 'Uploading...' : attachmentName ? `Attached: ${attachmentName}` : 'Upload photo or file'}
        </GlassButton>
        <div className="flex gap-2">
          <GlassButton variant="secondary" className="flex-1" onClick={onClose}>Cancel</GlassButton>
          <GlassButton variant="primary" className="flex-1" onClick={handleLog}>Log intake</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function InviteIntakeModal({
  intakeUrl,
  intakeUrlNewClient,
  onClose,
  onShare,
  copyAndFallback,
}: {
  intakeUrl: string;
  intakeUrlNewClient: string;
  onClose: () => void;
  onShare: (asNewClient: boolean) => void;
  copyAndFallback: (url: string) => void;
}) {
  const buildMailTo = (url: string) => {
    const subject = encodeURIComponent('Malibu Bodies Intake + App Invite');
    const body = encodeURIComponent(
      `You are invited to Malibu Bodies.\n\nDownload/open the app and complete your intake form to unlock your full client portal:\n${url}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  const buildSms = (url: string) => {
    const text = encodeURIComponent(`Malibu Bodies invite: download/open the app and complete your intake to unlock your portal: ${url}`);
    const sep = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
    return `sms:${sep}body=${text}`;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Invite to intake form</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">New client</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-2">Intake-only mode until submitted; after submit, full app unlocks.</p>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="sm" leftIcon={<Mail className="w-4 h-4" />} onClick={() => onShare(true)}>Share</GlassButton>
              <GlassButton size="sm" onClick={() => copyAndFallback(intakeUrlNewClient)}>Copy link</GlassButton>
            </div>
            <div className="flex gap-2 mt-2">
              <GlassButton size="sm" variant="secondary" onClick={() => window.open(buildMailTo(intakeUrlNewClient), '_blank')}>Email Invite</GlassButton>
              <GlassButton size="sm" variant="secondary" onClick={() => window.open(buildSms(intakeUrlNewClient), '_blank')}>Text Invite</GlassButton>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Interested client</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-2">Standard intake link</p>
            <div className="flex gap-2">
              <GlassButton variant="secondary" size="sm" leftIcon={<Mail className="w-4 h-4" />} onClick={() => onShare(false)}>Share</GlassButton>
              <GlassButton size="sm" onClick={() => copyAndFallback(intakeUrl)}>Copy link</GlassButton>
            </div>
            <div className="flex gap-2 mt-2">
              <GlassButton size="sm" variant="secondary" onClick={() => window.open(buildMailTo(intakeUrl), '_blank')}>Email Invite</GlassButton>
              <GlassButton size="sm" variant="secondary" onClick={() => window.open(buildSms(intakeUrl), '_blank')}>Text Invite</GlassButton>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function TrainerNutritionTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const entries = getClientNutritionEntries(clientId);
  const nutritionPlans = getClientStaffNutritionPlans(clientId);
  const clientWeighIns = getClientWeighIns(clientId);
  const client = getClientById(clientId);
  const today = new Date().toISOString().split('T')[0];
  const [entryDate, setEntryDate] = useState(today);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [notes, setNotes] = useState('');

  const uniqueMealOptions = (key: 'breakfast' | 'lunch' | 'dinner' | 'snacks') =>
    Array.from(
      new Set(
        [...entries.map((entry) => entry[key]), ...nutritionPlans.map((plan) => plan[key])]
          .map((value) => value?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

  const breakfastOptions = uniqueMealOptions('breakfast');
  const lunchOptions = uniqueMealOptions('lunch');
  const dinnerOptions = uniqueMealOptions('dinner');
  const snacksOptions = uniqueMealOptions('snacks');

  const applyPlan = (planId: string) => {
    const selected = nutritionPlans.find((plan) => plan.id === planId);
    if (!selected) return;
    setEntryDate(selected.date || today);
    setBreakfast(selected.breakfast || '');
    setLunch(selected.lunch || '');
    setDinner(selected.dinner || '');
    setSnacks(selected.snacks || '');
    setProtein(selected.protein || 0);
    setCarbs(selected.carbs || 0);
    setFat(selected.fat || 0);
    setCalories(selected.calories || 0);
    setNotes(selected.notes || '');
  };

  const handleSaveAssignedPlan = () => {
    const nutritionEntry = {
      id: `n${Date.now()}`,
      clientId,
      date: entryDate,
      breakfast: breakfast || undefined,
      lunch: lunch || undefined,
      dinner: dinner || undefined,
      snacks: snacks || undefined,
      protein: protein || undefined,
      carbs: carbs || undefined,
      fat: fat || undefined,
      calories: calories || undefined,
    };
    addNutritionEntry(nutritionEntry);
    addStaffNutritionPlan({
      clientId,
      trainerId: client?.trainerId ?? 't1',
      date: entryDate,
      breakfast: breakfast || undefined,
      lunch: lunch || undefined,
      dinner: dinner || undefined,
      snacks: snacks || undefined,
      protein: protein || undefined,
      carbs: carbs || undefined,
      fat: fat || undefined,
      calories: calories || undefined,
      notes: notes || undefined,
    });
    setRefresh((r) => r + 1);
    setBreakfast('');
    setLunch('');
    setDinner('');
    setSnacks('');
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setCalories(0);
    setNotes('');
    toast.success('Nutrition plan assigned');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Client Nutrition Log</h3>
      <p className="text-sm text-[var(--muted-foreground)]">Assign macros/calories and example meals. Reuse old meals and saved plans anytime.</p>

      <GlassCard>
        <div className="p-4 space-y-4">
          <h4 className="font-medium text-[var(--foreground)]">Assign nutrition targets + example meals</h4>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Date</label>
            <GlassInput type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="bg-white/30" />
          </div>
          <MealInput
            label="Breakfast"
            value={breakfast}
            options={breakfastOptions}
            onPick={setBreakfast}
            placeholder="Assign an example breakfast"
          />
          <MealInput
            label="Lunch"
            value={lunch}
            options={lunchOptions}
            onPick={setLunch}
            placeholder="Assign an example lunch"
          />
          <MealInput
            label="Dinner"
            value={dinner}
            options={dinnerOptions}
            onPick={setDinner}
            placeholder="Assign an example dinner"
          />
          <MealInput
            label="Snacks"
            value={snacks}
            options={snacksOptions}
            onPick={setSnacks}
            placeholder="Assign example snacks"
          />
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Assigned macros</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)]">Protein (g)</label>
                <GlassInput type="number" min={0} value={protein || ''} onChange={(e) => setProtein(Number(e.target.value) || 0)} className="bg-white/30" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)]">Carbs (g)</label>
                <GlassInput type="number" min={0} value={carbs || ''} onChange={(e) => setCarbs(Number(e.target.value) || 0)} className="bg-white/30" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)]">Fat (g)</label>
                <GlassInput type="number" min={0} value={fat || ''} onChange={(e) => setFat(Number(e.target.value) || 0)} className="bg-white/30" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)]">Calories</label>
                <GlassInput type="number" min={0} value={calories || ''} onChange={(e) => setCalories(Number(e.target.value) || 0)} className="bg-white/30" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Coach note (optional)</label>
            <GlassTextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="bg-white/30" placeholder="Any context for this meal plan..." />
          </div>
          <GlassButton
            variant="primary"
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleSaveAssignedPlan}
            disabled={!breakfast && !lunch && !dinner && !snacks && !protein && !carbs && !fat && !calories}
          >
            Save Assigned Plan
          </GlassButton>
        </div>
      </GlassCard>

      {nutritionPlans.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--foreground)]">Saved nutrition plans</h4>
          {nutritionPlans.map((plan) => (
            <GlassCard key={plan.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    P:{plan.protein || 0} C:{plan.carbs || 0} F:{plan.fat || 0} | {plan.calories || 0} cal
                  </p>
                </div>
                <GlassButton size="sm" variant="secondary" onClick={() => applyPlan(plan.id)}>
                  Reuse
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {entries.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--foreground)]">Recent Nutrition Entries</h4>
          {entries.map((entry) => (
            <GlassCard key={entry.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString('en-US')}</span>
                  {(entry.protein || entry.calories) && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      P:{entry.protein || 0} C:{entry.carbs || 0} F:{entry.fat || 0} | {entry.calories || 0} cal
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--foreground)] space-y-1">
                  {(entry.breakfast || entry.lunch || entry.dinner || entry.snacks) ? (
                    <>
                      {entry.breakfast && <p><span className="font-medium text-[var(--muted-foreground)]">Breakfast:</span> {entry.breakfast}</p>}
                      {entry.lunch && <p><span className="font-medium text-[var(--muted-foreground)]">Lunch:</span> {entry.lunch}</p>}
                      {entry.dinner && <p><span className="font-medium text-[var(--muted-foreground)]">Dinner:</span> {entry.dinner}</p>}
                      {entry.snacks && <p><span className="font-medium text-[var(--muted-foreground)]">Snacks:</span> {entry.snacks}</p>}
                    </>
                  ) : (
                    <p>{entry.meals}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-[var(--muted-foreground)]">No nutrition entries from client yet.</p>
        </GlassCard>
      )}

      {clientWeighIns.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--foreground)]">Weigh-Ins</h4>
          {clientWeighIns.map((w) => (
            <GlassCard key={w.id} className="p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm">{new Date(w.date).toLocaleDateString('en-US')}</span>
                <span className="font-semibold">{w.weight} lbs</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                {w.timeOfDay && <span className="capitalize">{w.timeOfDay}</span>}
                {w.notes && <p>Notes: {w.notes}</p>}
                {w.selfAffirmation && <p className="italic text-[var(--foreground)]">Affirmation: {w.selfAffirmation}</p>}
                {w.reflection && <p>Reflection: {w.reflection}</p>}
                {w.starRequested && <span className="text-[var(--primary)]">★ Star requested</span>}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <p className="text-[var(--muted-foreground)]">No weigh-ins yet.</p>
        </GlassCard>
      )}
    </div>
  );
}

function MealInput({
  label,
  value,
  options,
  onPick,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onPick: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">{label}</label>
        {options.length > 0 && (
          <select
            value=""
            onChange={(e) => onPick(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg bg-white/50 border border-white/60 text-[var(--foreground)]"
          >
            <option value="">Reuse saved</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option.length > 50 ? `${option.slice(0, 50)}...` : option}
              </option>
            ))}
          </select>
        )}
      </div>
      <GlassTextArea value={value} onChange={(e) => onPick(e.target.value)} rows={2} className="bg-white/30" placeholder={placeholder} />
    </div>
  );
}

function ProgramTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [dayExercises, setDayExercises] = useState<Record<number, ExerciseWithDetails[]>>({});
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [programName, setProgramName] = useState(`Program ${new Date().toLocaleDateString('en-US', { month: 'short' })}`);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const exercises = dayExercises[selectedDay] || [];
  const client = getClientById(clientId);
  const savedPrograms = getSavedClientPrograms(clientId);

  const handleAddExercise = (exercise: ExerciseWithDetails) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), exercise],
    }));
  };

  const removeExercise = (index: number) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter((_, i) => i !== index),
    }));
  };

  const totalExercises = Object.values(dayExercises).flat().length;

  const makeSchedule = () =>
    days.map((day, dayIndex) => ({
      day,
      exercises: (dayExercises[dayIndex] || []).map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        weight: ex.weight,
        notes: ex.notes,
        videoUrl: ex.videoUrl || getExerciseVideo(ex.name),
        explanation: ex.explanation || getExerciseExplanation(ex.name),
      })),
    }));

  const handleSaveProgram = () => {
    if (!client || totalExercises === 0) return;
    saveClientProgram({
      clientId,
      trainerId: client.trainerId,
      trainerName: client.trainerName,
      name: programName.trim() || `Program ${new Date().toLocaleDateString('en-US', { month: 'short' })}`,
      schedule: makeSchedule(),
    });
    setRefresh((r) => r + 1);
    toast.success('Program saved for reuse');
  };

  const handleLoadSavedProgram = (programId: string) => {
    const program = savedPrograms.find((item) => item.id === programId);
    if (!program) return;
    setProgramName(program.name);
    const mapped: Record<number, ExerciseWithDetails[]> = {};
    program.schedule.forEach((dayBlock) => {
      const index = days.indexOf(dayBlock.day);
      if (index === -1) return;
      mapped[index] = dayBlock.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        weight: ex.weight,
        notes: ex.notes,
        videoUrl: ex.videoUrl,
        explanation: ex.explanation,
      }));
    });
    setDayExercises(mapped);
    setSelectedDay(0);
    toast.success('Loaded saved program');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Program Builder</h3>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">Build a custom program for this client. Assign exercises to each day.</p>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Program name</label>
            <GlassInput value={programName} onChange={(e) => setProgramName(e.target.value)} className="bg-white/30" />
          </div>
          <GlassButton
            variant="secondary"
            fullWidth
            onClick={handleSaveProgram}
            disabled={!client || totalExercises === 0}
          >
            Save Program to History
          </GlassButton>
          {savedPrograms.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Reuse old programs</label>
              <select
                value=""
                onChange={(e) => handleLoadSavedProgram(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 text-[var(--foreground)]"
              >
                <option value="">Select saved program</option>
                {savedPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {new Date(program.createdAt).toLocaleDateString('en-US')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day, index) => (
          <button
            key={day}
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
          <h4 className="font-medium text-[var(--foreground)] mb-2">{days[selectedDay]}</h4>
          {exercises.length > 0 ? (
            <div className="space-y-2 mb-4">
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/30 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--foreground)]">{ex.name}</span>
                    {(ex.sets || ex.reps || ex.duration || ex.weight || ex.notes) && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {[ex.sets && `${ex.sets} sets`, ex.reps, ex.duration, ex.weight].filter(Boolean).join(' • ')}
                        {ex.notes && ` • ${ex.notes}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExercise(i)}
                    className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--muted-foreground)] text-center py-6 text-sm">
              No exercises added for {days[selectedDay]} yet.
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
          {Object.values(dayExercises).flat().length > 0 && client && (
            <GlassButton
              variant="secondary"
              fullWidth
              className="mt-3"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => {
                const allExercises = Object.values(dayExercises).flat();
                if (allExercises.length === 0) return;
                saveClientProgram({
                  clientId,
                  trainerId: client.trainerId,
                  trainerName: client.trainerName,
                  name: programName.trim() || `Program ${new Date().toLocaleDateString('en-US', { month: 'short' })}`,
                  schedule: makeSchedule(),
                });
                addSharedWorkoutProgram({
                  clientId,
                  trainerId: client.trainerId,
                  trainerName: client.trainerName,
                  name: programName.trim() || `Program ${new Date().toLocaleDateString('en-US', { month: 'short' })}`,
                  exercises: allExercises.map((ex, i) => ({
                    id: `e${Date.now()}-${i}`,
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    duration: ex.duration,
                    weight: ex.weight,
                    notes: ex.notes,
                    videoUrl: ex.videoUrl || getExerciseVideo(ex.name),
                    explanation: ex.explanation || getExerciseExplanation(ex.name),
                  })),
                });
                setRefresh((r) => r + 1);
                toast.success('Program shared and saved to history');
              }}
            >
              Share with client
            </GlassButton>
          )}
        </div>
      </GlassCard>

      {showAddExercise && (
        <AddExerciseModal
          onClose={() => setShowAddExercise(false)}
          onAdd={handleAddExercise}
          dayLabel={days[selectedDay]}
        />
      )}
    </div>
  );
}

function PhotosTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const photos = getClientProgressPhotos(clientId);
  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleAddPhoto = (ref: { current: HTMLInputElement | null }) => ref?.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'front' | 'side' | 'back' | 'other') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addProgressPhoto({ clientId, date: new Date().toISOString().split('T')[0], url, category });
      setRefresh((r) => r + 1);
    }
    e.target.value = '';
  };

  const views: { id: 'front' | 'side' | 'back'; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'side', label: 'Side' },
    { id: 'back', label: 'Back' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Progress Photos</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {views.map(({ id, label }) => {
          const ref = id === 'front' ? frontRef : id === 'side' ? sideRef : backRef;
          const photo = photos.find((p) => p.category === id);
          return (
            <div key={id}>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, id)}
              />
              <GlassCard
                hover
                className="aspect-[3/4] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => handleAddPhoto(ref)}
              >
                {photo ? (
                  <img src={photo.url} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                  </>
                )}
              </GlassCard>
            </div>
          );
        })}
      </div>

      {photos.length === 0 && (
        <GlassCard>
          <div className="p-4 text-center">
            <p className="text-[var(--muted-foreground)]">Tap a slot above to add a progress photo from your device.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function NotesTab({ clientId }: { clientId: string }) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setRefresh] = useState(0);
  const notes = getClientNotes(clientId).filter(
    (n) =>
      !searchQuery.trim() ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Progress Notes</h3>
        <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddNote(true)}>
          Add Note
        </GlassButton>
      </div>

      <GlassInput
        placeholder="Search past notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-white/50"
      />

      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <GlassBadge
                      variant={note.type === 'praise' ? 'success' : note.type === 'concern' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {note.type}
                    </GlassBadge>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[var(--foreground)]">{note.content}</p>
                  {note.attachmentUrl && (
                    <a
                      href={note.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--primary)] mt-2 inline-flex items-center gap-1"
                    >
                      {note.attachmentName || 'View attachment'}
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <GlassCard className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">
              {searchQuery.trim() ? 'No matching notes' : 'No notes yet'}
            </p>
            {!searchQuery.trim() && (
              <GlassButton size="sm" className="mt-3" onClick={() => setShowAddNote(true)}>
                Add Note
              </GlassButton>
            )}
          </GlassCard>
        )}
      </div>

      {showAddNote && (
        <AddProgressNoteModal
          onClose={() => setShowAddNote(false)}
          onSuccess={() => setRefresh((r) => r + 1)}
          defaultClientId={clientId}
        />
      )}
    </div>
  );
}

function AffirmationsTab({ clientId }: { clientId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [, setRefresh] = useState(0);
  const affirmations = getClientAffirmations(clientId);
  const client = getClientById(clientId);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Affirmations</h3>
        <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          Add Affirmation
        </GlassButton>
      </div>

      <div className="space-y-3">
        {affirmations.length > 0 ? (
          affirmations.map((affirmation, index) => (
            <motion.div
              key={affirmation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                      style={{
                        background: (affirmation.color === '#F6A5C0' || !affirmation.color) ? 'linear-gradient(180deg, #F6A5C0 0%, #E890AB 100%)' : (affirmation.color || '#f472b6'),
                      }}
                    >
                      {affirmation.graphic === 'smiley' && <Smile className="w-5 h-5" />}
                      {affirmation.graphic === 'heart' && <Heart className="w-5 h-5" />}
                      {affirmation.graphic === 'star' && <Star className="w-5 h-5" />}
                      {affirmation.graphic === 'sparkle' && <Sparkles className="w-5 h-5" />}
                      {(!affirmation.graphic || affirmation.graphic === 'none') && <Heart className="w-5 h-5" />}
                    </div>
                    <div>
                      <p
                        className="text-[var(--foreground)] italic"
                        style={{
                          color: affirmation.textColor || undefined,
                          fontFamily: affirmation.fontFamily || undefined,
                        }}
                      >
                        &ldquo;{affirmation.content}&rdquo;
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        Added {new Date(affirmation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <GlassCard className="p-8 text-center">
            <Heart className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">No affirmations yet</p>
            <GlassButton size="sm" className="mt-3" onClick={() => setShowModal(true)}>
              Add Affirmation
            </GlassButton>
          </GlassCard>
        )}
      </div>

      {showModal && client && (
        <AddAffirmationModal
          onClose={() => setShowModal(false)}
          clientId={clientId}
          clientName={client.name}
          onSent={() => setRefresh((r) => r + 1)}
        />
      )}
    </div>
  );
}

function BookingTab({ clientId, trainerId }: { clientId: string; trainerId: string }) {
  const [, setRefresh] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const bookings = getClientBookings(clientId);
  const clientPackages = getClientSpecificPackages(clientId);
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageLink, setPackageLink] = useState('');

  const addPackage = () => {
    const price = Number(packagePrice);
    if (!packageName.trim() || !Number.isFinite(price) || price <= 0) return;
    addClientSpecificPackage({
      clientId,
      trainerId,
      name: packageName.trim(),
      description: packageDescription.trim() || undefined,
      price,
      paymentLink: packageLink.trim() || undefined,
    });
    setPackageName('');
    setPackageDescription('');
    setPackagePrice('');
    setPackageLink('');
    setRefresh((r) => r + 1);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Bookings</h3>
        <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowScheduleModal(true)}>
          New Booking
        </GlassButton>
      </div>

      <div className="space-y-3">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
                        {booking.time}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {booking.duration} min • {booking.type}
                        </p>
                      </div>
                    </div>
                    <GlassBadge 
                      variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'default'}
                    >
                      {String(booking.status).replace(/_/g, ' ')}
                    </GlassBadge>
                  </div>
                  {booking.notes && (
                    <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                      Note: {booking.notes}
                    </p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <GlassCard className="p-8 text-center">
            <Clock className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">No bookings yet</p>
            <GlassButton variant="primary" className="mt-4" onClick={() => setShowScheduleModal(true)}>
              Schedule Session
            </GlassButton>
          </GlassCard>
        )}
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <h4 className="font-medium text-[var(--foreground)]">Client-specific in-person pricing</h4>
          <p className="text-xs text-[var(--muted-foreground)]">These package amounts are only for this client.</p>
          <GlassInput
            label="Package name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="e.g. 12 Session Private Training Pack"
          />
          <GlassInput
            label="Description (optional)"
            value={packageDescription}
            onChange={(e) => setPackageDescription(e.target.value)}
            placeholder="e.g. In-person 1:1 training"
          />
          <GlassInput
            label="Price ($)"
            type="number"
            min={0}
            step={1}
            value={packagePrice}
            onChange={(e) => setPackagePrice(e.target.value)}
          />
          <GlassInput
            label="Square payment link (optional)"
            value={packageLink}
            onChange={(e) => setPackageLink(e.target.value)}
            placeholder="https://square.link/..."
          />
          <GlassButton variant="primary" fullWidth onClick={addPackage} disabled={!packageName.trim() || !packagePrice}>
            Save Client Package
          </GlassButton>
          {clientPackages.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              {clientPackages.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-white/40">
                  <p className="font-medium text-sm">{p.name} - ${p.price}</p>
                  {p.description && <p className="text-xs text-[var(--muted-foreground)]">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
      {showScheduleModal && (
        <ScheduleSessionModal
          trainerId={trainerId}
          preselectedClientId={clientId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => setRefresh((r) => r + 1)}
        />
      )}
    </div>
  );
}

function FeedbackTab({ clientId, trainerId }: { clientId: string; trainerId: string }) {
  const [, setRefresh] = useState(0);
  const feedback = getClientFeedbackForTrainer(trainerId).filter((f) => f.clientId === clientId);
  const starCount = getClientStarCount(clientId);
  const gifts = getClientGifts(clientId);

  const handleSendGift = () => {
    addClientGift(clientId, trainerId, 'You earned a special gift for your consistency!');
    setRefresh((r) => r + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-[var(--primary)] fill-[var(--primary)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Client has {starCount} stars</p>
            <p className="text-xs text-[var(--muted-foreground)]">Send a star for consistency (header button)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <GlassButton size="sm" variant="secondary" onClick={handleSendGift}>Notify gift received</GlassButton>
          <GlassButton size="sm" variant="primary" leftIcon={<Star className="w-4 h-4" />} onClick={() => { addClientStar(clientId, trainerId); setRefresh((r) => r + 1); const clientName = getClientById(clientId)?.name ?? 'Client'; toast.success(`Star sent to ${clientName}!`, { description: 'They\'ll see a notice in their app.' }); }}>Send star</GlassButton>
        </div>
      </div>
      {gifts.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">Gifts received</p>
          {gifts.map((g) => (
            <GlassCard key={g.id} className="p-3 mb-2">
              <p className="text-sm">{g.message}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{new Date(g.receivedAt).toLocaleDateString('en-US')}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[var(--foreground)]">Messages from client</h3>
      {feedback.length > 0 ? (
        <div className="space-y-3">
          {feedback.map((f) => (
            <GlassCard key={f.id} className="p-4">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">
                {f.type === 'how_did_you_feel' ? 'How did you feel you did today?' : f.type === 'how_can_i_help' ? 'How can I help?' : 'Contact note'} • {new Date(f.createdAt).toLocaleDateString('en-US')}
              </p>
              <p className="text-[var(--foreground)]">{f.content}</p>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
          <p className="text-[var(--muted-foreground)]">No messages from client yet</p>
        </GlassCard>
      )}
    </div>
  );
}
