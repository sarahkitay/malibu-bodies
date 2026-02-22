import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, Ruler, Image, ChevronRight, Calendar, Award, UtensilsCrossed, Plus, Heart } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { Header } from '@/components/Header';
import { getClientById, getNotesVisibleToClient, getClientNutritionEntries, getClientWeighIns, addNutritionEntry, addWeighIn, getClientProgressPhotos, addProgressPhoto, getClientSelfAffirmations, addClientSelfAffirmation, addClientStar, getClientMeasurementLogs, addMeasurementLog } from '@/data/mockData';
import { IdentityWorksheet } from '@/sections/client/IdentityWorksheet';
import type { NutritionEntry, WeighIn, MeasurementLog } from '@/types';
import { cn } from '@/lib/utils';

interface ClientProgressProps {
  clientId: string;
  onBack: () => void;
  initialTab?: 'identity';
}

export function ClientProgress({ clientId, onBack, initialTab }: ClientProgressProps) {
  const client = getClientById(clientId);
  if (!client) return null;
  const notes = getNotesVisibleToClient(client.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'photos' | 'notes' | 'nutrition' | 'identity'>(initialTab === 'identity' ? 'identity' : 'overview');

  useEffect(() => {
    if (initialTab === 'identity') setActiveTab('identity');
  }, [initialTab]);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>(() => getClientNutritionEntries(client.id));
  const [weighIns, setWeighIns] = useState<WeighIn[]>(() => getClientWeighIns(client.id));
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>(() => getClientMeasurementLogs(client.id));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'notes', label: 'Notes', icon: TrendingUp },
    { id: 'identity', label: 'Identity', icon: Heart },
  ];

  return (
    <div className="min-h-screen pb-above-nav">
      <Header
        title="My Progress"
        subtitle="Track your journey"
        showBack
        onBack={onBack}
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-3">
              <GlassCard>
                <div className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-3">
                    <Scale className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">135</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Current Weight (lbs)</p>
                  <p className="text-xs text-green-600 mt-1">-3 lbs from start</p>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">22%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Body Fat</p>
                  <p className="text-xs text-green-600 mt-1">-2% from start</p>
                </div>
              </GlassCard>
            </div>

            {/* Sessions Progress */}
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Session Progress</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {client.sessionsRemaining} sessions remaining
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((client.totalSessions - client.sessionsRemaining) / client.totalSessions) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-[var(--primary)]"
                  />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-2 text-center">
                  {client.totalSessions - client.sessionsRemaining} of {client.totalSessions} sessions completed
                </p>
              </div>
            </GlassCard>

            {/* Recent Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Recent Milestones</h3>
              <div className="space-y-3">
                {[
                  { title: 'Completed 15 sessions', date: 'Feb 10, 2026', icon: Award },
                  { title: 'Lost 3 lbs', date: 'Feb 7, 2026', icon: Scale },
                  { title: 'Reduced body fat by 2%', date: 'Feb 7, 2026', icon: TrendingUp },
                ].map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard hover className="overflow-hidden">
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                          <milestone.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--foreground)]">{milestone.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{milestone.date}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'measurements' && (
          <MeasurementsTab clientId={client.id} logs={measurementLogs} onAddLog={(l) => setMeasurementLogs((prev) => [l, ...prev])} />
        )}

        {activeTab === 'photos' && (
          <ClientPhotosTab clientId={client.id} />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            clientId={client.id}
            entries={nutritionEntries}
            weighIns={weighIns}
            onAddEntry={(e) => setNutritionEntries(prev => [e, ...prev])}
            onAddWeighIn={(w) => setWeighIns(prev => [w, ...prev])}
          />
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Trainer Notes</h3>
            </div>
            
            <div className="space-y-3">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            note.type === 'praise' 
                              ? 'bg-green-500/15 text-green-600' 
                              : note.type === 'concern' 
                                ? 'bg-amber-500/15 text-amber-600' 
                                : 'bg-white/60'
                          )}>
                            {note.type}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[var(--foreground)]">{note.content}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : (
                <GlassCard className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--muted-foreground)]">No notes yet</p>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <IdentityWorksheet clientId={client.id} />
        )}
      </div>
    </div>
  );
}

function ClientPhotosTab({ clientId }: { clientId: string }) {
  const [, setRefresh] = useState(0);
  const photos = getClientProgressPhotos(clientId);
  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const views: { id: 'front' | 'side' | 'back'; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'side', label: 'Side' },
    { id: 'back', label: 'Back' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'front' | 'side' | 'back' | 'other') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addProgressPhoto({ clientId, date: new Date().toISOString().split('T')[0], url, category });
      setRefresh((r) => r + 1);
    }
    e.target.value = '';
  };

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
                onClick={() => ref?.current?.click()}
              >
                {photo ? (
                  <img src={photo.url} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-2">
                      <Image className="w-5 h-5 text-[var(--muted-foreground)]" />
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
        <GlassCard className="p-8 text-center">
          <Image className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
          <p className="text-[var(--muted-foreground)]">Tap a slot above to add a progress photo from your device.</p>
        </GlassCard>
      )}
    </div>
  );
}

function MeasurementsTab({ clientId, logs, onAddLog }: { clientId: string; logs: MeasurementLog[]; onAddLog: (l: MeasurementLog) => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    const log: Omit<MeasurementLog, 'id'> = {
      clientId,
      date,
      weight: weight ? Number(weight) : undefined,
      chest: chest ? Number(chest) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined,
      arms: arms ? Number(arms) : undefined,
      thighs: thighs ? Number(thighs) : undefined,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      notes: notes.trim() || undefined,
    };
    if (weight || chest || waist || hips || arms || thighs || bodyFat) {
      const added = addMeasurementLog(log);
      onAddLog(added);
      setWeight('');
      setChest('');
      setWaist('');
      setHips('');
      setArms('');
      setThighs('');
      setBodyFat('');
      setNotes('');
    }
  };

  const latestLog = logs[0];
  const displayMeasurements = latestLog
    ? [
        { label: 'Chest', value: latestLog.chest, unit: '"' },
        { label: 'Waist', value: latestLog.waist, unit: '"' },
        { label: 'Hips', value: latestLog.hips, unit: '"' },
        { label: 'Arms', value: latestLog.arms, unit: '"' },
        { label: 'Thighs', value: latestLog.thighs, unit: '"' },
      ].filter((m) => m.value != null)
    : [];

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">Add Measurement Log</h3>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Date</label>
            <GlassInput type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Weight (lbs)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Body fat %</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Chest (&quot;)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={chest} onChange={(e) => setChest(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Waist (&quot;)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={waist} onChange={(e) => setWaist(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Hips (&quot;)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={hips} onChange={(e) => setHips(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Arms (&quot;)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={arms} onChange={(e) => setArms(e.target.value)} className="bg-white/30" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Thighs (&quot;)</label>
              <GlassInput type="number" step={0.1} placeholder="0" value={thighs} onChange={(e) => setThighs(e.target.value)} className="bg-white/30" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)]">Notes (optional)</label>
            <GlassTextArea placeholder="Any notes..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-white/30" />
          </div>
          <GlassButton variant="primary" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd} disabled={!weight && !chest && !waist && !hips && !arms && !thighs && !bodyFat}>
            Log Measurements
          </GlassButton>
        </div>
      </GlassCard>

      {displayMeasurements.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Latest Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              {displayMeasurements.map((m, i) => (
                <div key={i} className="bg-white/50 rounded-2xl p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">{m.label}</p>
                  <p className="text-xl font-bold text-[var(--foreground)]">{m.value}{m.unit}</p>
                </div>
              ))}
              {latestLog?.weight != null && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Weight</p>
                  <p className="text-xl font-bold text-[var(--foreground)]">{latestLog.weight} lbs</p>
                </div>
              )}
              {latestLog?.bodyFat != null && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Body fat</p>
                  <p className="text-xl font-bold text-[var(--foreground)]">{latestLog.bodyFat}%</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      <div>
        <h3 className="font-semibold text-[var(--foreground)] mb-3">Measurement History</h3>
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <GlassCard key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-[var(--foreground)]">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
                    {log.weight != null && <span>{log.weight} lbs</span>}
                    {log.bodyFat != null && <span>{log.bodyFat}%</span>}
                    {log.chest != null && <span>C:{log.chest}&quot;</span>}
                    {log.waist != null && <span>W:{log.waist}&quot;</span>}
                    {log.hips != null && <span>H:{log.hips}&quot;</span>}
                  </div>
                </div>
                {log.notes && <p className="text-sm text-[var(--muted-foreground)] mt-2">{log.notes}</p>}
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <Ruler className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">No measurement logs yet</p>
            <p className="text-sm text-[var(--muted-foreground)]/70 mt-1">Add your first log above</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function NutritionTab({
  clientId,
  entries,
  weighIns,
  onAddEntry,
  onAddWeighIn,
}: {
  clientId: string;
  entries: NutritionEntry[];
  weighIns: WeighIn[];
  onAddEntry: (e: NutritionEntry) => void;
  onAddWeighIn: (w: WeighIn) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [entryDate, setEntryDate] = useState(today);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [weighInDate, setWeighInDate] = useState(today);
  const [weight, setWeight] = useState(0);
  const [weighInTimeOfDay, setWeighInTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [weighInNotes, setWeighInNotes] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [feelingMode, setFeelingMode] = useState<'proud' | 'down' | null>(null);
  const [selfAffirmation, setSelfAffirmation] = useState('');
  const [starRequested, setStarRequested] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showPastAffirmations, setShowPastAffirmations] = useState(false);
  const pastSelfAffirmations = getClientSelfAffirmations(clientId);

  const handleAddEntry = () => {
    const entry: NutritionEntry = {
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
    addNutritionEntry(entry);
    onAddEntry(entry);
    setBreakfast('');
    setLunch('');
    setDinner('');
    setSnacks('');
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setCalories(0);
  };

  const handleAddWeighIn = () => {
    const weighInId = `w${Date.now()}`;
    const weighIn: WeighIn = {
      id: weighInId,
      clientId,
      date: weighInDate,
      weight,
      timeOfDay: weighInTimeOfDay,
      notes: weighInNotes || undefined,
      confidenceLevel: confidenceLevel ?? undefined,
      selfAffirmation: feelingMode === 'proud' && selfAffirmation ? selfAffirmation : undefined,
      reflection: feelingMode === 'down' && reflection ? reflection : undefined,
      starRequested: feelingMode === 'proud' && starRequested,
    };
    addWeighIn(weighIn);
    onAddWeighIn(weighIn);
    if (feelingMode === 'proud' && selfAffirmation.trim()) {
      addClientSelfAffirmation({ clientId, content: selfAffirmation.trim(), createdAt: new Date().toISOString(), weighInId });
    }
    if (feelingMode === 'proud' && starRequested) {
      const client = getClientById(clientId);
      if (client?.trainerId) addClientStar(clientId, client.trainerId);
    }
    setWeight(0);
    setWeighInNotes('');
    setConfidenceLevel(null);
    setFeelingMode(null);
    setSelfAffirmation('');
    setStarRequested(false);
    setReflection('');
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        Log your meals or macros for each day. Admin can view your entries.
      </p>

      {/* Add Entry for Today */}
      <GlassCard>
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">Add Entry for Today</h3>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Date</label>
            <GlassInput type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Breakfast</label>
            <GlassTextArea placeholder="What did you eat for breakfast?" rows={2} value={breakfast} onChange={(e) => setBreakfast(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Lunch</label>
            <GlassTextArea placeholder="What did you eat for lunch?" rows={2} value={lunch} onChange={(e) => setLunch(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Dinner</label>
            <GlassTextArea placeholder="What did you eat for dinner?" rows={2} value={dinner} onChange={(e) => setDinner(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Snacks or additional meals</label>
            <GlassTextArea placeholder="Any snacks or additional meals?" rows={2} value={snacks} onChange={(e) => setSnacks(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Macros (optional)</label>
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
          <GlassButton variant="primary" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddEntry} disabled={!breakfast && !lunch && !dinner && !snacks}>
            Add Entry
          </GlassButton>
        </div>
      </GlassCard>

      {/* Weekly Weigh-In */}
      <GlassCard>
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">Weekly Weigh-In</h3>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Date</label>
            <GlassInput type="date" value={weighInDate} onChange={(e) => setWeighInDate(e.target.value)} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Time of day</label>
            <div className="flex gap-2">
              {(['morning', 'afternoon', 'evening'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setWeighInTimeOfDay(t)} className={cn('flex-1 px-3 py-2 rounded-xl text-sm capitalize transition-colors', weighInTimeOfDay === t ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Weight (lbs)</label>
            <GlassInput type="number" min={0} step={0.1} value={weight || ''} onChange={(e) => setWeight(Number(e.target.value) || 0)} className="bg-white/30" placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Notes on how this weigh-in made you feel</label>
            <GlassTextArea placeholder="How do you feel about this weigh-in?..." value={weighInNotes} onChange={(e) => setWeighInNotes(e.target.value)} rows={2} className="bg-white/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">Confidence level (1-5)</label>
            <p className="text-xs text-[var(--muted-foreground)] mb-2">How confident do you feel about your progress right now?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => { setConfidenceLevel(n); if (n <= 2 && pastSelfAffirmations.length > 0) setShowPastAffirmations(true); }} className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-colors', confidenceLevel === n ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>{n}</button>
              ))}
            </div>
          </div>
          {confidenceLevel != null && (
            <div className="space-y-3 pt-2 border-t border-white/20">
              <p className="text-sm font-medium text-[var(--foreground)]">How are you feeling?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFeelingMode('proud')} className={cn('flex-1 px-3 py-2 rounded-xl text-sm', feelingMode === 'proud' ? 'bg-green-500/20 text-green-700' : 'bg-white/50')}>Proud of myself</button>
                <button type="button" onClick={() => setFeelingMode('down')} className={cn('flex-1 px-3 py-2 rounded-xl text-sm', feelingMode === 'down' ? 'bg-amber-500/20 text-amber-700' : 'bg-white/50')}>Feeling down</button>
              </div>
              {feelingMode === 'proud' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium block">Write a positive affirmation for yourself (saved for less positive days)</label>
                  <GlassTextArea placeholder="e.g., I am making progress and I am proud of my consistency..." value={selfAffirmation} onChange={(e) => setSelfAffirmation(e.target.value)} rows={2} className="bg-white/30" />
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={starRequested} onChange={(e) => setStarRequested(e.target.checked)} className="rounded" />
                    Request a star for this achievement
                  </label>
                </div>
              )}
              {feelingMode === 'down' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium block">Reflect: What went wrong? Why is this just a bump in the road, not a failure? Tomorrow is a new day.</label>
                  <GlassTextArea placeholder="e.g., I had a busy week but I stayed consistent with workouts. This number doesn't define me..." value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} className="bg-white/30" />
                </div>
              )}
            </div>
          )}
          {showPastAffirmations && pastSelfAffirmations.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--primary)]/10 space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">Your past affirmations to yourself</p>
              {pastSelfAffirmations.slice(0, 3).map((a) => (
                <p key={a.id} className="text-sm italic text-[var(--foreground)]">&ldquo;{a.content}&rdquo;</p>
              ))}
              <button type="button" onClick={() => setShowPastAffirmations(false)} className="text-xs text-[var(--primary)]">Dismiss</button>
            </div>
          )}
          <GlassButton variant="primary" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddWeighIn}>
            Log Weigh-In
          </GlassButton>
        </div>
      </GlassCard>

      {weighIns.length === 0 && (
        <GlassCard className="p-6 text-center">
          <Scale className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
          <p className="text-[var(--muted-foreground)]">No weigh-ins yet.</p>
        </GlassCard>
      )}

      {/* Recent Nutrition Entries */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Recent Nutrition Entries</h3>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <GlassCard key={entry.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {(entry.protein || entry.carbs || entry.fat || entry.calories) && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        P:{entry.protein || 0} C:{entry.carbs || 0} F:{entry.fat || 0} | {entry.calories || 0} cal
                      </span>
                    )}
                  </div>
                  <div className="text-[var(--foreground)] text-sm space-y-1">
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
            <UtensilsCrossed className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">No nutrition entries yet</p>
            <p className="text-sm text-[var(--muted-foreground)]/70 mt-1">Add your first entry above</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
