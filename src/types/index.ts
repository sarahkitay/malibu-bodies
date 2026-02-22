export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Client {
  id: string;
  name: string;
  age: number;
  email: string;
  phone?: string;
  trainerId: string;
  trainerName: string;
  avatar?: string;
  sessionsRemaining: number;
  totalSessions: number;
  lastAssessment?: string;
  lastProgram?: string;
  notes?: string;
  goals?: string[];
  joinedAt: string;
  status: 'active' | 'inactive' | 'lead';
  /** When archived (inactive): warm = has booked, cold = never booked */
  leadType?: 'warm' | 'cold';
  /** 4-6 character code for client portal login */
  accessCode: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  /** For identity worksheet pronoun choice: woman (she/her), man (he/him), non-binary/other (they/them) */
  gender?: 'woman' | 'man' | 'non-binary';
  /** Virtual (custom), virtual (prebuilt), or in-person */
  clientType?: 'virtual-custom' | 'virtual-prebuilt' | 'in-person';
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  specialties: string[];
  clients: string[];
}

export interface Assessment {
  id: string;
  clientId: string;
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  injuries?: string;
  medicalNotes?: string;
  goals?: string;
  overheadSquat?: { kneeIssues: string; hipShift: string; overallScore?: string; notes?: string };
  shoulderMobility?: { rightScore?: number; leftScore?: number; notes?: string };
  hamstringMobility?: { score?: number; notes?: string };
  pushUpAssessment?: { score?: number; notes?: string };
}

export interface Program {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  exercises: Exercise[];
  schedule: {
    day: string;
    exercises: string[];
  }[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  notes?: string;
  videoUrl?: string;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  cues?: string;
  videoUrl?: string;
  isCustom?: boolean;
}

export interface ProgressNote {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;
  content: string;
  type: 'general' | 'milestone' | 'concern' | 'praise';
  attachmentUrl?: string;
  attachmentName?: string;
  /** When true, the client can see this note in their Progress tab. When false, trainer-only. */
  sharedWithClient?: boolean;
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  date: string;
  url: string;
  category: 'front' | 'side' | 'back' | 'other';
  notes?: string;
}

export interface NutritionEntry {
  id: string;
  clientId: string;
  date: string;
  /** @deprecated use breakfast, lunch, dinner, snacks instead */
  meals?: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
}

export interface StaffNutritionPlan {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  notes?: string;
  createdAt: string;
}

export type WeighInTimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface WeighIn {
  id: string;
  clientId: string;
  date: string;
  weight: number;
  timeOfDay?: WeighInTimeOfDay;
  notes?: string;
  /** 1-5 scale: how confident/good they feel about the weigh-in */
  confidenceLevel?: number;
  /** When feeling proud: positive affirmation they wrote for themselves */
  selfAffirmation?: string;
  /** When feeling down: reflection on what went wrong, why it's a bump not failure */
  reflection?: string;
  /** When proud, client requested a star */
  starRequested?: boolean;
}

export interface ClientSelfAffirmation {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  weighInId?: string;
}

export interface MeasurementLog {
  id: string;
  clientId: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  notes?: string;
}

export interface DetailedAssessment {
  id: string;
  clientId: string;
  assessmentDate: string;
  overheadSquat: {
    kneeIssues: string;
    hipShift: string;
    overallScore?: string;
    notes?: string;
  };
  shoulderMobility: {
    rightScore?: number;
    leftScore?: number;
    notes?: string;
  };
  hamstringMobility: {
    score?: number;
    notes?: string;
  };
  pushUpAssessment: {
    score?: number;
    notes?: string;
  };
}

export interface IntakeForm {
  id: string;
  clientId: string;
  date: string;
  submittedAt?: string;
  data?: Record<string, unknown>;
  attachmentUrl?: string;
  attachmentName?: string;
}

export type AffirmationGraphic = 'none' | 'smiley' | 'heart' | 'star' | 'sparkle';

export interface Affirmation {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  scheduledFor?: string;
  color?: string;
  /** Bubble background color */
  textColor?: string;
  fontFamily?: string;
  graphic?: AffirmationGraphic;
}

export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;
  time: string;
  duration: number;
  type: 'in-person' | 'virtual';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'suggested' | 'reschedule_requested';
  notes?: string;
  suggestedDate?: string;
  suggestedTime?: string;
}

export interface Session {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;
  type: 'used' | 'purchased';
  amount: number;
  notes?: string;
}

export interface BlockedDay {
  id: string;
  trainerId: string;
  date: string;
  reason?: string;
}

export interface TrainerTodo {
  id: string;
  trainerId: string;
  text: string;
  done: boolean;
}

export interface BroadcastNotice {
  id: string;
  trainerId: string;
  message: string;
  createdAt: string;
}

export interface TrainerProgram {
  id: string;
  name: string;
  description?: string;
  price?: number;
  paymentLink?: string;
  paidCash?: boolean;
  clientId?: string;
}

/** Exercise entry in a trainer's personal program (same shape as client program builder) */
export interface PersonalProgramExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  weight?: string;
  notes?: string;
  videoUrl?: string;
  explanation?: string;
}

export interface TrainerPersonalProgram {
  trainerId: string;
  name: string;
  notes?: string;
  /** Day label (e.g. Mon) -> exercises with sets, reps, duration, etc. */
  schedule: { day: string; exercises: PersonalProgramExercise[] }[];
}

export interface SavedClientProgram {
  id: string;
  clientId: string;
  trainerId: string;
  trainerName: string;
  name: string;
  schedule: { day: string; exercises: PersonalProgramExercise[] }[];
  createdAt: string;
}

export interface AssessmentSection {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

export interface IntakeFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
}

export interface PastMembership {
  id: string;
  name: string;
  description?: string;
  price: number;
  squarePaymentUrl: string;
  trainerId: string;
}

export interface ClientSpecificPackage {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  description?: string;
  price: number;
  paymentLink?: string;
}

/** Keys for Identity Rewrite Workshop answers (q1–q20 + declaration fields) */
export interface IdentityWorksheetEntry {
  id: string;
  clientId: string;
  date: string;
  /** New format: question/field id -> answer text */
  answers?: Record<string, string>;
  /** Legacy fields (still supported for old entries) */
  feeling?: string;
  emotionalTraits?: string;
  physicalTraits?: string;
  notes?: string;
}

export interface ClientStar {
  id: string;
  clientId: string;
  trainerId: string;
  createdAt: string;
}

export interface ClientGift {
  id: string;
  clientId: string;
  trainerId: string;
  message: string;
  receivedAt: string;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  type: 'how_did_you_feel' | 'how_can_i_help' | 'contact_trainer';
  content: string;
  createdAt: string;
}

/** In-app notice for client (e.g. "Trainer sent you a star") */
export interface ClientNotification {
  id: string;
  clientId: string;
  type: 'star_received';
  trainerName: string;
  createdAt: string;
  read?: boolean;
}

export interface InspirationImage {
  id: string;
  clientId: string;
  url: string;
  createdAt: string;
}

export interface SharedProgramExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  weight?: string;
  notes?: string;
  videoUrl?: string;
  explanation?: string;
}

export interface SharedWorkoutProgram {
  id: string;
  clientId: string;
  trainerId: string;
  trainerName: string;
  name: string;
  exercises: SharedProgramExercise[];
  sharedAt: string;
}

export interface ProgramWorkoutCompletion {
  id: string;
  programId: string;
  clientId: string;
  date: string;
  completed: boolean;
  overallRating?: number;
  exerciseRatings?: Record<string, number>;
}

export type UserRole = 'trainer' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
