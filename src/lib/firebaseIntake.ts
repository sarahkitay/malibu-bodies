import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const INTAKE_COLLECTION = 'intakeSubmissions';
const INTAKE_ATTACHMENTS = 'intake-attachments';

/** Cache getIntakeSubmissions for 90s to avoid burning Firestore reads (free tier: 50K reads/day). */
let intakeCache: { key: string; data: { id: string; data: IntakeSubmissionData }[]; at: number } = { key: '', data: [], at: 0 };
const INTAKE_CACHE_MS = 90_000;

function clearIntakeCache(): void {
  intakeCache = { key: '', data: [], at: 0 };
}

export interface IntakeSubmissionData {
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  height?: string;
  currentWeight?: number;
  goalWeight?: number;
  program: string;
  inPersonOption?: '1:1' | 'duet';
  primaryGoal: string;
  whyImportant: string;
  commitmentLevel: number;
  biggestObstacle: string[];
  typicalWeekday: string;
  workoutTime: string;
  daysPerWeek: string;
  sleepHours?: string;
  stressLevel?: number;
  activityLevel: string;
  trainingTypes: string[];
  equipment: string[];
  equipmentCombo?: string;
  injuries?: string;
  mealsPerDay?: string;
  eatingPattern?: string;
  allergies?: string;
  nutritionHabits: string[];
  progressTracking: string[];
  workedWithCoach?: string;
  notWillingToTolerate?: string;
  whatTriedAndWhy?: string;
  lifeDifferentIfWorks?: string;
  anticipateResistance?: string;
  preparedToInvest2500?: boolean;
  agreementMedical: boolean;
  agreementResponsibility: boolean;
  agreementPersonalUse: boolean;
  agreementConsistency: boolean;
  agreementNoRefunds: boolean;
  agreementNoGuarantee: boolean;
  signature: string;
  submittedAt: string;
  inviteId?: string;
  newClient?: boolean;
  trainerId?: string;
}

export async function saveIntakeToFirebase(data: IntakeSubmissionData): Promise<string> {
  const docRef = await addDoc(collection(db, INTAKE_COLLECTION), data);
  clearIntakeCache();
  return docRef.id;
}

export async function getIntakeSubmissions(trainerId?: string): Promise<{ id: string; data: IntakeSubmissionData }[]> {
  const key = trainerId ?? '__all__';
  const now = Date.now();
  if (intakeCache.key === key && now - intakeCache.at < INTAKE_CACHE_MS) {
    return intakeCache.data;
  }
  const q = query(collection(db, INTAKE_COLLECTION));
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map((d) => ({ id: d.id, data: d.data() as IntakeSubmissionData }));
  if (trainerId) {
    results = results.filter((r) => r.data.trainerId === trainerId);
  }
  results.sort((a, b) => (b.data.submittedAt || '').localeCompare(a.data.submittedAt || ''));
  intakeCache.key = key;
  intakeCache.data = results;
  intakeCache.at = now;
  return results;
}

export async function uploadIntakeAttachment(file: File): Promise<string> {
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `${INTAKE_ATTACHMENTS}/${name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
