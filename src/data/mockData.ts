import type { Client, Trainer, Assessment, ProgressNote, Booking, Affirmation, User, NutritionEntry, WeighIn, ProgressPhoto, ExerciseLibraryItem, IntakeForm, BlockedDay, TrainerTodo, BroadcastNotice, TrainerProgram, TrainerPersonalProgram, AssessmentSection, IntakeFormField, PastMembership, IdentityWorksheetEntry, ClientStar, ClientGift, ClientFeedback, ClientNotification, InspirationImage, ClientSelfAffirmation, MeasurementLog, SharedWorkoutProgram, ProgramWorkoutCompletion, StaffNutritionPlan, SavedClientProgram, ClientSpecificPackage } from '@/types';

export const exerciseLibrary: ExerciseLibraryItem[] = [];

export function addExerciseToLibrary(item: Omit<ExerciseLibraryItem, 'id'>): ExerciseLibraryItem {
  const id = `ex${Date.now()}`;
  const newItem: ExerciseLibraryItem = { ...item, id, isCustom: true };
  exerciseLibrary.push(newItem);
  return newItem;
}

export function getExerciseLibrary(): ExerciseLibraryItem[] {
  return [...exerciseLibrary];
}

/** Maps exercise name -> video URL (YouTube, Vimeo, or blob URL from file) */
export const exerciseVideos: Record<string, string> = {};

export function setExerciseVideo(exerciseName: string, url: string) {
  exerciseVideos[exerciseName] = url;
}

export function getExerciseVideo(exerciseName: string): string | undefined {
  return exerciseLibrary.find((e) => e.name === exerciseName)?.videoUrl || exerciseVideos[exerciseName];
}

/** Maps exercise name -> explanation / form cues */
export const exerciseExplanations: Record<string, string> = {};

export function setExerciseExplanation(exerciseName: string, explanation: string) {
  exerciseExplanations[exerciseName] = explanation;
}

export function getExerciseExplanation(exerciseName: string): string | undefined {
  return exerciseLibrary.find((e) => e.name === exerciseName)?.cues || exerciseExplanations[exerciseName];
}

export function updateLibraryExerciseVideo(exerciseId: string, url: string) {
  const ex = exerciseLibrary.find((e) => e.id === exerciseId);
  if (ex) ex.videoUrl = url;
}

export function updateLibraryExerciseExplanation(exerciseId: string, explanation: string) {
  const ex = exerciseLibrary.find((e) => e.id === exerciseId);
  if (ex) ex.cues = explanation;
}

export const currentUser: User = {
  id: 't1',
  name: 'Bella Malibu',
  email: 'info@malibubodies.com',
  role: 'trainer',
};

export const trainers: Trainer[] = [
  {
    id: 't1',
    name: 'Bella Malibu',
    email: 'info@malibubodies.com',
    bio: 'Certified personal trainer with 5+ years of experience specializing in strength training and nutrition coaching.',
    specialties: ['Strength Training', 'Nutrition', 'pilates', 'Weight Loss'],
    clients: ['c1', 'c2', 'c3'],
  },
];

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Sarah Kitay',
    age: 25,
    email: 'client.sarah@email.com',
    phone: '(310) 555-0123',
    trainerId: 't1',
    trainerName: 'Bella Malibu',
    sessionsRemaining: 5,
    totalSessions: 20,
    lastAssessment: '2026-02-07',
    lastProgram: '2026-02-07',
    notes: 'Making great progress on strength goals. Focus on form during squats.',
    goals: ['Build muscle', 'Improve posture', 'Increase energy'],
    joinedAt: '2025-11-15',
    status: 'active',
    accessCode: 'A1B2C',
    gender: 'woman',
  },
  {
    id: 'c2',
    name: 'Emma Thompson',
    age: 28,
    email: 'emma@email.com',
    phone: '(310) 555-0124',
    trainerId: 't1',
    trainerName: 'Bella Malibu',
    sessionsRemaining: 12,
    totalSessions: 15,
    lastAssessment: '2026-01-20',
    lastProgram: '2026-01-22',
    notes: 'New client, very motivated. Working on core strength.',
    goals: ['Core strength', 'Flexibility', 'Stress relief'],
    joinedAt: '2026-01-10',
    status: 'active',
    accessCode: 'B2C3D',
  },
  {
    id: 'c3',
    name: 'Sasha Williams',
    age: 25,
    email: 'sasha@email.com',
    phone: '(310) 555-0125',
    trainerId: 't2',
    trainerName: 'Brian',
    sessionsRemaining: 11,
    totalSessions: 24,
    lastAssessment: '2026-01-15',
    lastProgram: '2026-01-18',
    notes: 'Athletic background, responds well to challenging workouts.',
    goals: ['Athletic performance', 'Endurance', 'Power'],
    joinedAt: '2025-09-20',
    status: 'active',
    accessCode: 'C3D4E',
  },
  {
    id: 'c4',
    name: 'Michael Chen',
    age: 32,
    email: 'michael@email.com',
    phone: '(310) 555-0126',
    trainerId: 't2',
    trainerName: 'Brian',
    sessionsRemaining: 3,
    totalSessions: 10,
    lastAssessment: '2026-02-01',
    lastProgram: '2026-02-03',
    notes: 'Busy schedule, needs efficient workouts.',
    goals: ['Time-efficient workouts', 'Maintain fitness', 'Stress management'],
    joinedAt: '2025-12-01',
    status: 'active',
    accessCode: 'D4E5F',
  },
  {
    id: 'c5',
    name: 'Jessica Park',
    age: 29,
    email: 'jessica@email.com',
    trainerId: 't1',
    trainerName: 'Bella Malibu',
    sessionsRemaining: 0,
    totalSessions: 8,
    lastAssessment: '2026-01-10',
    goals: ['Weight loss', 'Toning'],
    joinedAt: '2025-10-15',
    status: 'lead',
    accessCode: 'E5F6A',
  },
];

export const assessments: Assessment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    date: '2026-02-07',
    weight: 135,
    height: 65,
    bodyFat: 22,
    measurements: {
      chest: 34,
      waist: 28,
      hips: 36,
      arms: 11,
      thighs: 22,
    },
    fitnessLevel: 'intermediate',
    injuries: 'None',
    medicalNotes: 'No restrictions',
    goals: 'Build lean muscle, improve overall fitness',
  },
  {
    id: 'a2',
    clientId: 'c2',
    date: '2026-01-20',
    weight: 128,
    height: 64,
    bodyFat: 24,
    fitnessLevel: 'beginner',
    injuries: 'Minor lower back tightness',
    goals: 'Strengthen core, improve flexibility',
  },
];

export const progressNotes: ProgressNote[] = [
  {
    id: 'p1',
    clientId: 'c1',
    trainerId: 't1',
    date: '2026-02-10',
    content: 'Sarah crushed her deadlift PR today! Form has improved significantly. She\'s been consistent with her nutrition tracking too.',
    type: 'praise',
  },
  {
    id: 'p2',
    clientId: 'c1',
    trainerId: 't1',
    date: '2026-02-07',
    content: 'Assessment completed. Body composition improved by 2% since last month. Keep up the great work!',
    type: 'milestone',
  },
  {
    id: 'p3',
    clientId: 'c2',
    trainerId: 't1',
    date: '2026-02-08',
    content: 'Emma mentioned feeling some discomfort during planks. Modified the exercise and provided alternatives.',
    type: 'concern',
  },
  {
    id: 'p4',
    clientId: 'c1',
    trainerId: 't1',
    date: '2026-02-05',
    content: 'Regular session - focused on upper body strength. Sarah is progressing well with push-ups.',
    type: 'general',
  },
];

export const bookings: Booking[] = [
  {
    id: 'b1',
    clientId: 'c1',
    trainerId: 't1',
    date: '2026-02-17',
    time: '09:00',
    duration: 60,
    type: 'in-person',
    status: 'confirmed',
    notes: 'Leg day focus',
  },
  {
    id: 'b2',
    clientId: 'c2',
    trainerId: 't1',
    date: '2026-02-17',
    time: '11:00',
    duration: 45,
    type: 'in-person',
    status: 'confirmed',
  },
  {
    id: 'b3',
    clientId: 'c1',
    trainerId: 't1',
    date: '2026-02-19',
    time: '10:00',
    duration: 60,
    type: 'in-person',
    status: 'pending',
  },
  {
    id: 'b4',
    clientId: 'c3',
    trainerId: 't2',
    date: '2026-02-18',
    time: '14:00',
    duration: 60,
    type: 'virtual',
    status: 'confirmed',
  },
];

export const nutritionEntries: NutritionEntry[] = [
  { id: 'ne1', clientId: 'c1', date: '2026-02-14', breakfast: 'Oatmeal' },
  { id: 'ne2', clientId: 'c1', date: '2026-02-13', breakfast: 'Eggs' },
  { id: 'ne3', clientId: 'c1', date: '2026-02-12', lunch: 'Salad' },
];
export const staffNutritionPlans: StaffNutritionPlan[] = [];
export const weighIns: WeighIn[] = [
  { id: 'wi1', clientId: 'c1', date: '2026-02-14', weight: 135, notes: '' },
  { id: 'wi2', clientId: 'c1', date: '2026-02-07', weight: 136, notes: '' },
];
export const clientSelfAffirmations: ClientSelfAffirmation[] = [];
export const measurementLogs: MeasurementLog[] = [];
export const progressPhotos: ProgressPhoto[] = [];
export const clientIntakeForms: IntakeForm[] = [];
export const blockedDays: BlockedDay[] = [];
export const trainerTodos: TrainerTodo[] = [];
export const broadcastNotices: BroadcastNotice[] = [];
export const trainerPrograms: TrainerProgram[] = [];

const DEFAULT_PERSONAL_SCHEDULE: TrainerPersonalProgram['schedule'] = [
  { day: 'Mon', exercises: [] },
  { day: 'Tue', exercises: [] },
  { day: 'Wed', exercises: [] },
  { day: 'Thu', exercises: [] },
  { day: 'Fri', exercises: [] },
  { day: 'Sat', exercises: [] },
  { day: 'Sun', exercises: [] },
];

let _trainerPersonalProgram: TrainerPersonalProgram | null = null;
export function getTrainerPersonalProgram(trainerId: string): TrainerPersonalProgram | null {
  const p = _trainerPersonalProgram;
  if (!p) return null;
  const schedule = p.schedule && p.schedule.length > 0
    ? p.schedule
    : DEFAULT_PERSONAL_SCHEDULE;
  return { trainerId, name: p.name, notes: p.notes, schedule };
}
export function setTrainerPersonalProgram(program: TrainerPersonalProgram): void {
  _trainerPersonalProgram = program;
}

export const assessmentSections: AssessmentSection[] = [];
export const intakeFormFields: IntakeFormField[] = [];
export const pastMemberships: PastMembership[] = [
  { id: 'pm1', name: 'Virtual Coaching (Application Only)', description: '8-Week Virtual 1:1 Coaching Program', price: 2500, squarePaymentUrl: 'https://checkout.square.site/merchant/ML9WBQJ90S78C/checkout/4ZSBL7P6U5IIVVEB2HVCZOVC', trainerId: 't1' },
  { id: 'pm2', name: 'Pre-Made 6-Week Training Program (PDF) - Gym Edition', description: 'Digital Program', price: 179, squarePaymentUrl: 'https://square.link/u/fqZ95WXu', trainerId: 't1' },
  { id: 'pm3', name: 'Pre-Made 6-Week Training Program (PDF) - At-Home Edition', description: 'Digital Program', price: 179, squarePaymentUrl: 'https://square.link/u/fqZ95WXu', trainerId: 't1' },
  { id: 'pm4', name: 'Custom Digital Training Program (Self-Guided, 6 Weeks)', description: 'Digital Program', price: 399, squarePaymentUrl: 'https://checkout.square.site/merchant/ML9WBQJ90S78C/checkout/4ZSBL7P6U5IIVVEB2HVCZOVC', trainerId: 't1' },
];
export const clientSpecificPackages: ClientSpecificPackage[] = [];
export const identityWorksheetEntries: IdentityWorksheetEntry[] = [];
const clientNotificationPrefs: Record<string, boolean> = {};
const clientDataSharingPrefs: Record<string, { progress: boolean; nutrition: boolean; photos: boolean }> = {};
/** Trainer chooses what to share with each client; optional arrays = which specific items to share (when category is on) */
export type TrainerDataSharePrefs = {
  programs: boolean;
  intakes: boolean;
  assessments: boolean;
  notes: boolean;
  sharedProgramIds?: string[];
  sharedNoteIds?: string[];
  sharedAssessmentIds?: string[];
  sharedIntakeIds?: string[];
};
const trainerDataSharePrefs: Record<string, TrainerDataSharePrefs> = {};
export function addAssessmentSection(section: Omit<AssessmentSection, 'id'>): AssessmentSection {
  const id = `as${Date.now()}`;
  const s: AssessmentSection = { ...section, id };
  assessmentSections.push(s);
  return s;
}
export function addIntakeFormField(field: Omit<IntakeFormField, 'id'>): IntakeFormField {
  const id = `iff${Date.now()}`;
  const f: IntakeFormField = { ...field, id };
  intakeFormFields.push(f);
  return f;
}

export function addBlockedDay(day: Omit<BlockedDay, 'id'>): BlockedDay {
  const id = `bd${Date.now()}`;
  const newDay: BlockedDay = { ...day, id };
  blockedDays.push(newDay);
  return newDay;
}

export function getBlockedDays(trainerId: string): BlockedDay[] {
  return blockedDays.filter((b) => b.trainerId === trainerId);
}

export function addTrainerTodo(todo: Omit<TrainerTodo, 'id'>): TrainerTodo {
  const id = `todo${Date.now()}`;
  const newTodo: TrainerTodo = { ...todo, id };
  trainerTodos.push(newTodo);
  return newTodo;
}

export function getTrainerTodos(trainerId: string): TrainerTodo[] {
  return trainerTodos.filter((t) => t.trainerId === trainerId);
}

export function toggleTrainerTodo(id: string) {
  const t = trainerTodos.find((x) => x.id === id);
  if (t) t.done = !t.done;
}

export function addBroadcastNotice(notice: Omit<BroadcastNotice, 'id'>): BroadcastNotice {
  const id = `bn${Date.now()}`;
  const newNotice: BroadcastNotice = { ...notice, id };
  broadcastNotices.push(newNotice);
  return newNotice;
}

export function addTrainerProgram(program: Omit<TrainerProgram, 'id'>): TrainerProgram {
  const id = `prog${Date.now()}`;
  const newProgram: TrainerProgram = { ...program, id };
  trainerPrograms.push(newProgram);
  return newProgram;
}

export function getTrainerPrograms(): TrainerProgram[] {
  return [...trainerPrograms];
}

export function updateTrainerProgram(id: string, updates: Partial<Omit<TrainerProgram, 'id'>>): TrainerProgram | null {
  const prog = trainerPrograms.find((p) => p.id === id);
  if (!prog) return null;
  Object.assign(prog, updates);
  return prog;
}

export function getTrainerProgram(id: string): TrainerProgram | undefined {
  return trainerPrograms.find((p) => p.id === id);
}

export function getPastMemberships(trainerId: string): PastMembership[] {
  return pastMemberships.filter((p) => p.trainerId === trainerId);
}
export function addPastMembership(m: Omit<PastMembership, 'id'>): PastMembership {
  const id = `pm${Date.now()}`;
  const newM: PastMembership = { ...m, id };
  pastMemberships.push(newM);
  return newM;
}

export function getClientSpecificPackages(clientId: string): ClientSpecificPackage[] {
  return clientSpecificPackages
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => a.price - b.price);
}

export function addClientSpecificPackage(p: Omit<ClientSpecificPackage, 'id'>): ClientSpecificPackage {
  const id = `csp${Date.now()}`;
  const item: ClientSpecificPackage = { ...p, id };
  clientSpecificPackages.push(item);
  return item;
}

export function getIdentityWorksheetEntries(clientId: string): IdentityWorksheetEntry[] {
  return identityWorksheetEntries.filter((e) => e.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
export function addIdentityWorksheetEntry(e: Omit<IdentityWorksheetEntry, 'id'>): IdentityWorksheetEntry {
  const id = `iw${Date.now()}`;
  const newE: IdentityWorksheetEntry = { ...e, id };
  identityWorksheetEntries.unshift(newE);
  return newE;
}

export function getClientNotificationEnabled(clientId: string): boolean {
  return clientNotificationPrefs[clientId] ?? true;
}
export function setClientNotificationEnabled(clientId: string, enabled: boolean): void {
  clientNotificationPrefs[clientId] = enabled;
}

export function getClientDataSharingPrefs(clientId: string) {
  return clientDataSharingPrefs[clientId] ?? { progress: true, nutrition: true, photos: true };
}
export function setClientDataSharingPrefs(clientId: string, prefs: { progress: boolean; nutrition: boolean; photos: boolean }): void {
  clientDataSharingPrefs[clientId] = prefs;
}
export function getTrainerDataSharePrefs(clientId: string): TrainerDataSharePrefs {
  return trainerDataSharePrefs[clientId] ?? { programs: true, intakes: true, assessments: true, notes: true };
}
export function setTrainerDataSharePrefs(clientId: string, prefs: TrainerDataSharePrefs): void {
  trainerDataSharePrefs[clientId] = prefs;
}

const STARS_FOR_GIFT = 10;
export const clientStars: ClientStar[] = [];
export const clientGifts: ClientGift[] = [];
export const clientFeedback: ClientFeedback[] = [];
export const clientNotifications: ClientNotification[] = [];
export const inspirationImages: InspirationImage[] = [];

export function addClientStar(clientId: string, trainerId: string): ClientStar {
  const id = `cs${Date.now()}`;
  const star: ClientStar = { id, clientId, trainerId, createdAt: new Date().toISOString() };
  clientStars.push(star);
  const trainer = trainers.find((t) => t.id === trainerId);
  const trainerName = trainer?.name ?? 'Your trainer';
  const notifId = `cn${Date.now()}`;
  clientNotifications.push({
    id: notifId,
    clientId,
    type: 'star_received',
    trainerName,
    createdAt: star.createdAt,
    read: false,
  });
  const count = clientStars.filter((s) => s.clientId === clientId).length;
  if (count >= STARS_FOR_GIFT) {
    let removed = 0;
    for (let i = clientStars.length - 1; i >= 0 && removed < STARS_FOR_GIFT; i--) {
      if (clientStars[i].clientId === clientId) {
        clientStars.splice(i, 1);
        removed++;
      }
    }
    addClientGift(clientId, trainerId, 'You earned a special gift for your consistency!');
  }
  return star;
}

export function getClientNotifications(clientId: string): ClientNotification[] {
  return clientNotifications
    .filter((n) => n.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadClientNotificationCount(clientId: string): number {
  return clientNotifications.filter((n) => n.clientId === clientId && !n.read).length;
}

export function markClientNotificationsRead(clientId: string): void {
  clientNotifications.forEach((n) => {
    if (n.clientId === clientId) n.read = true;
  });
}

export function getClientStarCount(clientId: string): number {
  return clientStars.filter((s) => s.clientId === clientId).length;
}

export function getClientGifts(clientId: string): ClientGift[] {
  return clientGifts.filter((g) => g.clientId === clientId).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function addClientGift(clientId: string, trainerId: string, message: string): ClientGift {
  const id = `cg${Date.now()}`;
  const gift: ClientGift = { id, clientId, trainerId, message, receivedAt: new Date().toISOString() };
  clientGifts.push(gift);
  return gift;
}

export function addClientFeedback(feedback: Omit<ClientFeedback, 'id' | 'createdAt'>): ClientFeedback {
  const id = `cf${Date.now()}`;
  const f: ClientFeedback = { ...feedback, id, createdAt: new Date().toISOString() };
  clientFeedback.push(f);
  return f;
}

export function getClientFeedbackForTrainer(trainerId: string): ClientFeedback[] {
  const clientIds = getTrainerClients(trainerId).map((c) => c.id);
  return clientFeedback.filter((f) => clientIds.includes(f.clientId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addInspirationImage(clientId: string, url: string): InspirationImage {
  const id = `ii${Date.now()}`;
  const img: InspirationImage = { id, clientId, url, createdAt: new Date().toISOString() };
  inspirationImages.unshift(img);
  return img;
}

export function getInspirationImages(clientId: string): InspirationImage[] {
  return inspirationImages.filter((i) => i.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const sharedWorkoutPrograms: SharedWorkoutProgram[] = [
  {
    id: 'swp1',
    clientId: 'c1',
    trainerId: 't1',
    trainerName: 'Bella Malibu',
    name: 'Week 1 Strength',
    exercises: [
      { id: 'e1', name: 'Squats', sets: 3, reps: '10', weight: undefined, notes: undefined, videoUrl: undefined, explanation: undefined },
      { id: 'e2', name: 'Push-ups', sets: 3, reps: '12', weight: undefined, notes: undefined, videoUrl: undefined, explanation: undefined },
      { id: 'e3', name: 'Plank', sets: 3, reps: '30s', duration: '30s', weight: undefined, notes: undefined, videoUrl: undefined, explanation: undefined },
    ],
    sharedAt: '2026-02-10',
  },
];

export const programWorkoutCompletions: ProgramWorkoutCompletion[] = [];
export const savedClientPrograms: SavedClientProgram[] = [];

/** All shared programs for a client (no visibility filter); for trainer UI */
export function getClientSharedProgramsAll(clientId: string): SharedWorkoutProgram[] {
  return sharedWorkoutPrograms.filter((p) => p.clientId === clientId);
}

export function getSharedWorkoutPrograms(clientId: string): SharedWorkoutProgram[] {
  const all = sharedWorkoutPrograms.filter((p) => p.clientId === clientId);
  const prefs = getTrainerDataSharePrefs(clientId);
  if (!prefs.programs) return [];
  if (prefs.sharedProgramIds === undefined) return all;
  if (prefs.sharedProgramIds.length === 0) return [];
  return all.filter((p) => prefs.sharedProgramIds!.includes(p.id));
}

export function addSharedWorkoutProgram(program: Omit<SharedWorkoutProgram, 'id' | 'sharedAt'>): SharedWorkoutProgram {
  const today = new Date().toISOString().slice(0, 10);
  const newProgram: SharedWorkoutProgram = {
    ...program,
    id: `swp${Date.now()}`,
    sharedAt: today,
    exercises: program.exercises.map((ex, i) => ({
      ...ex,
      id: ex.id || `e${Date.now()}-${i}`,
    })),
  };
  sharedWorkoutPrograms.push(newProgram);
  return newProgram;
}

export function getSavedClientPrograms(clientId: string): SavedClientProgram[] {
  return savedClientPrograms
    .filter((program) => program.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveClientProgram(program: Omit<SavedClientProgram, 'id' | 'createdAt'>): SavedClientProgram {
  const newProgram: SavedClientProgram = {
    ...program,
    id: `scp${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  savedClientPrograms.unshift(newProgram);
  return newProgram;
}

export function setProgramWorkoutCompletion(programId: string, clientId: string, date: string, completed: boolean, overallRating?: number, exerciseRatings?: Record<string, number>) {
  const existing = programWorkoutCompletions.find((c) => c.programId === programId && c.clientId === clientId && c.date === date);
  if (existing) {
    existing.completed = completed;
    existing.overallRating = overallRating;
    existing.exerciseRatings = exerciseRatings;
  } else {
    programWorkoutCompletions.push({
      id: `pwc${Date.now()}`,
      programId,
      clientId,
      date,
      completed,
      overallRating,
      exerciseRatings,
    });
  }
}

export function getProgramCompletion(programId: string, clientId: string, date: string): ProgramWorkoutCompletion | undefined {
  return programWorkoutCompletions.find((c) => c.programId === programId && c.clientId === clientId && c.date === date);
}

export function getProgressStreak(clientId: string): { workouts: number; nutrition: number; weighIns: number } {
  const workoutDays = new Set<string>();
  const nutritionDays = new Set<string>();
  const weighInDays = new Set<string>();

  bookings.filter((b) => b.clientId === clientId && b.status === 'completed').forEach((b) => workoutDays.add(b.date));
  progressNotes.filter((n) => n.clientId === clientId).forEach((n) => workoutDays.add(n.date));
  getClientNutritionEntries(clientId).forEach((e) => nutritionDays.add(e.date));
  getClientWeighIns(clientId).forEach((w) => weighInDays.add(w.date));

  const calcStreak = (days: Set<string>) => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) count++;
      else if (count > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  };

  return {
    workouts: calcStreak(workoutDays),
    nutrition: calcStreak(nutritionDays),
    weighIns: calcStreak(weighInDays),
  };
}

export function getClientAssessments(clientId: string): Assessment[] {
  return assessments.filter((a) => a.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Assessments visible to the client (only those the trainer chose to share). */
export function getAssessmentsVisibleToClient(clientId: string): Assessment[] {
  const prefs = getTrainerDataSharePrefs(clientId);
  if (!prefs.assessments) return [];
  let list = assessments.filter((a) => a.clientId === clientId);
  if (prefs.sharedAssessmentIds !== undefined) {
    if (prefs.sharedAssessmentIds.length === 0) return [];
    list = list.filter((a) => prefs.sharedAssessmentIds!.includes(a.id));
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addAssessment(assessment: Omit<Assessment, 'id'>): Assessment {
  const id = `a${Date.now()}`;
  const newAssessment: Assessment = { ...assessment, id };
  assessments.unshift(newAssessment);
  return newAssessment;
}

export function getClientIntakeForms(clientId: string): IntakeForm[] {
  return clientIntakeForms.filter((f) => f.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Intakes visible to the client (only those the trainer chose to share). */
export function getIntakesVisibleToClient(clientId: string): IntakeForm[] {
  const prefs = getTrainerDataSharePrefs(clientId);
  if (!prefs.intakes) return [];
  let list = clientIntakeForms.filter((f) => f.clientId === clientId);
  if (prefs.sharedIntakeIds !== undefined) {
    if (prefs.sharedIntakeIds.length === 0) return [];
    list = list.filter((f) => prefs.sharedIntakeIds!.includes(f.id));
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addClientIntakeForm(form: Omit<IntakeForm, 'id'>): IntakeForm {
  const id = `intake${Date.now()}`;
  const newForm: IntakeForm = { ...form, id };
  clientIntakeForms.unshift(newForm);
  return newForm;
}

export const PRESET_AFFIRMATIONS = [
  "If you eat too much, you'll get fat.",
  "I guess you did okay today.",
  "Well, at least you showed up.",
  "Could be worse, I suppose.",
  "Not terrible, but not great either.",
  "You're trying, I'll give you that.",
  "Progress is progress, even if it's slow.",
  "Better than nothing, I guess.",
  "You didn't completely fail today.",
  "Meh. Could've been worse.",
  "At least you're consistent... consistently average.",
  "I've seen worse. Barely.",
  "You're here, that's something.",
  "Not your worst day, not your best.",
  "It's something. Not much, but something.",
];

export const affirmations: Affirmation[] = [
  {
    id: 'af1',
    clientId: 'c1',
    content: 'Every workout is a step closer to my strongest self.',
    createdAt: '2026-02-10',
    scheduledFor: '2026-02-17',
  },
  {
    id: 'af2',
    clientId: 'c1',
    content: 'I am capable of more than I imagine. Progress over perfection.',
    createdAt: '2026-02-08',
  },
  {
    id: 'af3',
    clientId: 'c2',
    content: 'My body is getting stronger every day.',
    createdAt: '2026-02-09',
  },
];

export type AffirmationOfTheDayData = {
  content: string;
  color: string;
  textColor?: string;
  fontFamily?: string;
  graphic?: 'none' | 'smiley' | 'heart' | 'star' | 'sparkle';
};

export const affirmationOfTheDay: Record<string, AffirmationOfTheDayData> = {};

export function setAffirmationOfTheDay(
  clientId: string,
  content: string,
  color: string,
  opts?: { textColor?: string; fontFamily?: string; graphic?: AffirmationOfTheDayData['graphic'] }
) {
  affirmationOfTheDay[clientId] = { content, color, ...opts };
}

export function getAffirmationOfTheDay(clientId: string) {
  return affirmationOfTheDay[clientId];
}

export function getClientById(id: string): Client | undefined {
  return clients.find(c => c.id === id);
}

export function getTrainerClients(trainerId: string): Client[] {
  return clients.filter(c => c.trainerId === trainerId);
}

export function getClientNotes(clientId: string): ProgressNote[] {
  return progressNotes.filter(n => n.clientId === clientId).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Notes visible to the client in their Progress tab (note-level share + trainer's chosen list). */
export function getNotesVisibleToClient(clientId: string): ProgressNote[] {
  const prefs = getTrainerDataSharePrefs(clientId);
  if (!prefs.notes) return [];
  let list = progressNotes.filter(n => n.clientId === clientId && n.sharedWithClient !== false);
  if (prefs.sharedNoteIds !== undefined) {
    if (prefs.sharedNoteIds.length === 0) return [];
    list = list.filter(n => prefs.sharedNoteIds!.includes(n.id));
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getClientBookings(clientId: string): Booking[] {
  return bookings.filter(b => b.clientId === clientId).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getClientAffirmations(clientId: string): Affirmation[] {
  return affirmations.filter(a => a.clientId === clientId);
}

export function getClientNutritionEntries(clientId: string): NutritionEntry[] {
  return nutritionEntries.filter(n => n.clientId === clientId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getClientStaffNutritionPlans(clientId: string): StaffNutritionPlan[] {
  return staffNutritionPlans
    .filter((plan) => plan.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getClientWeighIns(clientId: string): WeighIn[] {
  return weighIns.filter(w => w.clientId === clientId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addNutritionEntry(entry: NutritionEntry): void {
  nutritionEntries.unshift(entry);
}

export function addStaffNutritionPlan(plan: Omit<StaffNutritionPlan, 'id' | 'createdAt'>): StaffNutritionPlan {
  const newPlan: StaffNutritionPlan = {
    ...plan,
    id: `snp${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  staffNutritionPlans.unshift(newPlan);
  return newPlan;
}

export function addWeighIn(weighIn: WeighIn): void {
  weighIns.unshift(weighIn);
}

export function getClientSelfAffirmations(clientId: string): ClientSelfAffirmation[] {
  return clientSelfAffirmations
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addClientSelfAffirmation(affirmation: Omit<ClientSelfAffirmation, 'id'>): ClientSelfAffirmation {
  const id = `csa${Date.now()}`;
  const newA: ClientSelfAffirmation = { ...affirmation, id };
  clientSelfAffirmations.unshift(newA);
  return newA;
}

export function getClientMeasurementLogs(clientId: string): MeasurementLog[] {
  return measurementLogs
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addMeasurementLog(log: Omit<MeasurementLog, 'id'>): MeasurementLog {
  const id = `ml${Date.now()}`;
  const newLog: MeasurementLog = { ...log, id };
  measurementLogs.unshift(newLog);
  return newLog;
}

/** Generate 4-6 character alphanumeric access code */
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const len = 4 + Math.floor(Math.random() * 3);
  let code = '';
  for (let i = 0; i < len; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface NewClientInput {
  name: string;
  age: number;
  email: string;
  phone?: string;
  accessCode?: string;
  emergencyContact?: { name: string; phone: string; relationship: string };
  goals?: string[];
  medicalHistory?: string;
}

export function addLeadToList(trainerId: string, trainerName: string, info: { name: string; email: string; phone?: string }, leadType: 'cold' | 'warm'): Client {
  const trainer = trainers.find(t => t.id === trainerId);
  const id = `c${Date.now()}`;
  const accessCode = generateAccessCode().toUpperCase().slice(0, 6);
  const client: Client = {
    id,
    name: info.name.trim(),
    age: 0,
    email: info.email.trim(),
    phone: info.phone?.trim(),
    trainerId,
    trainerName,
    sessionsRemaining: 0,
    totalSessions: 0,
    joinedAt: new Date().toISOString().split('T')[0],
    status: 'inactive',
    leadType,
    accessCode,
  };
  clients.push(client);
  if (trainer && !trainer.clients.includes(id)) trainer.clients.push(id);
  return client;
}

export function addClient(input: NewClientInput, trainerId: string, trainerName: string): Client {
  const trainer = trainers.find(t => t.id === trainerId);
  const id = `c${Date.now()}`;
  const accessCode = (input.accessCode?.trim() || generateAccessCode()).toUpperCase().slice(0, 6);

  const client: Client = {
    id,
    name: input.name.trim(),
    age: input.age,
    email: input.email.trim(),
    phone: input.phone?.trim(),
    trainerId,
    trainerName,
    sessionsRemaining: 0,
    totalSessions: 0,
    joinedAt: new Date().toISOString().split('T')[0],
    status: 'lead',
    accessCode,
    emergencyContact: input.emergencyContact,
    medicalHistory: input.medicalHistory?.trim(),
    goals: input.goals,
  };

  clients.push(client);
  if (trainer && !trainer.clients.includes(id)) {
    trainer.clients.push(id);
  }
  return client;
}

export function getClientByFullNameAndCode(fullName: string, accessCode: string): Client | undefined {
  return clients.find(
    c => c.name.toLowerCase() === fullName.trim().toLowerCase() &&
         c.accessCode.toLowerCase() === accessCode.trim().toLowerCase()
  );
}

export function updateClientAccessCode(clientId: string, newCode?: string): void {
  const client = clients.find(c => c.id === clientId);
  if (client) {
    client.accessCode = (newCode || generateAccessCode()).toUpperCase().slice(0, 6);
  }
}

export function setClientStatus(clientId: string, status: 'active' | 'inactive' | 'lead'): void {
  const client = clients.find(c => c.id === clientId);
  if (!client) return;
  client.status = status;
  if (status === 'inactive') {
    const hasBookings = bookings.some(b => b.clientId === clientId);
    client.leadType = hasBookings ? 'warm' : 'cold';
  } else {
    client.leadType = undefined;
  }
}

export function updateClientAvatar(clientId: string, avatarUrl: string): void {
  const c = clients.find((x) => x.id === clientId);
  if (c) c.avatar = avatarUrl;
}

export function updateTrainerAvatar(avatarUrl: string): void {
  currentUser.avatar = avatarUrl;
}

export function updateClientGoals(clientId: string, goals: string[]): void {
  const client = clients.find(c => c.id === clientId);
  if (client) client.goals = goals;
}

export function updateClientInfo(clientId: string, updates: Partial<Pick<Client, 'name' | 'email' | 'phone' | 'age' | 'notes' | 'gender'>>): void {
  const c = clients.find((x) => x.id === clientId);
  if (c) Object.assign(c, updates);
}

export function addBooking(booking: Omit<Booking, 'id'>): Booking {
  const id = `b${Date.now()}`;
  const newBooking: Booking = { ...booking, id };
  bookings.push(newBooking);
  return newBooking;
}

export function updateBookingStatus(bookingId: string, status: Booking['status']) {
  const b = bookings.find((x) => x.id === bookingId);
  if (b) b.status = status;
}

export function suggestBookingAlternative(bookingId: string, suggestedDate: string, suggestedTime: string) {
  const b = bookings.find((x) => x.id === bookingId);
  if (b) {
    b.status = 'suggested';
    b.suggestedDate = suggestedDate;
    b.suggestedTime = suggestedTime;
  }
}

export function acceptBookingSuggestion(bookingId: string) {
  const b = bookings.find((x) => x.id === bookingId);
  if (b && b.suggestedDate && b.suggestedTime) {
    b.date = b.suggestedDate;
    b.time = b.suggestedTime;
    b.status = 'confirmed';
    b.suggestedDate = undefined;
    b.suggestedTime = undefined;
  }
}

/** Client requests reschedule - picks new date/time, sets status for trainer to review */
export function requestClientReschedule(bookingId: string, newDate: string, newTime: string) {
  const b = bookings.find((x) => x.id === bookingId);
  if (b) {
    b.status = 'reschedule_requested';
    b.suggestedDate = newDate;
    b.suggestedTime = newTime;
  }
}

/** Trainer confirms client's reschedule request */
export function acceptClientRescheduleRequest(bookingId: string) {
  const b = bookings.find((x) => x.id === bookingId);
  if (b && b.suggestedDate && b.suggestedTime) {
    b.date = b.suggestedDate;
    b.time = b.suggestedTime;
    b.status = 'confirmed';
    b.suggestedDate = undefined;
    b.suggestedTime = undefined;
  }
}

/** Check if booking is within 24 hours (cannot cancel) */
export function isBookingWithin24Hours(booking: { date: string; time: string }): boolean {
  const [h, m] = (booking.time || '00:00').split(':').map(Number);
  const bookingMs = new Date(booking.date).setHours(h, m, 0, 0);
  const now = Date.now();
  return bookingMs - now < 24 * 60 * 60 * 1000;
}

export function getClientProgressPhotos(clientId: string): ProgressPhoto[] {
  return progressPhotos.filter((p) => p.clientId === clientId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addProgressPhoto(photo: Omit<ProgressPhoto, 'id'>): ProgressPhoto {
  const id = `pp${Date.now()}`;
  const newPhoto: ProgressPhoto = { ...photo, id };
  progressPhotos.unshift(newPhoto);
  return newPhoto;
}

export function addProgressNote(note: Omit<ProgressNote, 'id'>): void {
  progressNotes.unshift({
    ...note,
    id: `p${Date.now()}`,
  });
}

export function addAffirmation(affirmation: Omit<Affirmation, 'id'>): Affirmation {
  const id = `af${Date.now()}`;
  const newAffirmation: Affirmation = { ...affirmation, id };
  affirmations.unshift(newAffirmation);
  return newAffirmation;
}

export function getNotificationsForTrainer(trainerId: string): { type: string; message: string; clientName: string; date: string }[] {
  const trainerClients = getTrainerClients(trainerId);
  const clientIds = new Set(trainerClients.map((c) => c.id));
  const clientMap = Object.fromEntries(trainerClients.map((c) => [c.id, c.name]));
  const items: { type: string; message: string; clientName: string; date: string }[] = [];
  bookings
    .filter((b) => b.status === 'pending' && clientIds.has(b.clientId))
    .forEach((b) => {
      items.push({
        type: 'session_request',
        message: 'Requested a session',
        clientName: clientMap[b.clientId] || 'Client',
        date: b.date,
      });
    });
  nutritionEntries.forEach((n) => {
    if (clientIds.has(n.clientId)) {
      items.push({
        type: 'nutrition',
        message: 'Added a nutrition entry',
        clientName: clientMap[n.clientId] || 'Client',
        date: n.date,
      });
    }
  });
  progressPhotos.forEach((p) => {
    if (clientIds.has(p.clientId)) {
      items.push({
        type: 'photo',
        message: 'Added a progress photo',
        clientName: clientMap[p.clientId] || 'Client',
        date: p.date,
      });
    }
  });
  clientFeedback
    .filter((f) => f.type === 'contact_trainer' && clientIds.has(f.clientId))
    .forEach((f) => {
      items.push({
        type: 'client_contact',
        message: f.content,
        clientName: clientMap[f.clientId] || 'Client',
        date: f.createdAt,
      });
    });
  clientStars
    .filter((s) => s.trainerId === trainerId && clientIds.has(s.clientId))
    .forEach((s) => {
      items.push({
        type: 'star_sent',
        message: 'Sent a star',
        clientName: clientMap[s.clientId] || 'Client',
        date: s.createdAt,
      });
    });
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
}

export function getAllNotes(trainerId?: string): ProgressNote[] {
  let list = [...progressNotes];
  if (trainerId) list = list.filter(n => n.trainerId === trainerId);
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function useClientSession(clientId: string): boolean {
  const client = clients.find(c => c.id === clientId);
  if (client && client.sessionsRemaining > 0) {
    client.sessionsRemaining -= 1;
    return true;
  }
  return false;
}
