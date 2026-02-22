import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const INTAKE_COLLECTION = 'intakeSubmissions';
const INTAKE_ATTACHMENTS = 'intake-attachments';

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
  return docRef.id;
}

export async function getIntakeSubmissions(trainerId?: string): Promise<{ id: string; data: IntakeSubmissionData }[]> {
  const q = query(collection(db, INTAKE_COLLECTION));
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map((d) => ({ id: d.id, data: d.data() as IntakeSubmissionData }));
  if (trainerId) {
    results = results.filter((r) => r.data.trainerId === trainerId);
  }
  results.sort((a, b) => (b.data.submittedAt || '').localeCompare(a.data.submittedAt || ''));
  return results;
}

export async function uploadIntakeAttachment(file: File): Promise<string> {
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `${INTAKE_ATTACHMENTS}/${name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
