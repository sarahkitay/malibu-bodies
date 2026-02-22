import { useState } from 'react';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import { saveIntakeToFirebase, type IntakeSubmissionData } from '@/lib/firebaseIntake';
import { cn } from '@/lib/utils';

interface IntakeFormEmbedProps {
  trainerId?: string;
  inviteId?: string;
  newClient?: boolean;
  onSuccess?: () => void;
  preview?: boolean;
}

const OBSTACLES = ['Consistency', 'Time', 'Motivation', 'Nutrition structure', 'Injury or pain', 'Overwhelm', 'Other'];
const TRAINING_TYPES = ['Weights', 'Pilates', 'Cardio', 'Yoga', 'Group classes', 'Walking / hiking', 'Other'];
const EQUIPMENT_OPTIONS = ['Full gym', 'Apartment / hotel gym', 'Home weights', 'No equipment', 'Combination'];
const NUTRITION_HABITS = ['Snacking', 'Cravings', 'Skipping meals', 'Emotional eating', 'None of the above'];
const PROGRESS_OPTIONS = ['Scale', 'Photos', 'Measurements', 'Strength gains', 'How clothes fit', 'Energy levels'];

export function IntakeFormEmbed({ trainerId, inviteId, newClient, onSuccess, preview }: IntakeFormEmbedProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');

  const [program, setProgram] = useState('');
  const [inPersonOption, setInPersonOption] = useState<'1:1' | 'duet' | ''>('');

  const [primaryGoal, setPrimaryGoal] = useState('');
  const [whyImportant, setWhyImportant] = useState('');
  const [commitment, setCommitment] = useState(5);
  const [biggestObstacle, setBiggestObstacle] = useState<string[]>([]);

  const [typicalWeekday, setTypicalWeekday] = useState('');
  const [workoutTime, setWorkoutTime] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState(5);

  const [activityLevel, setActivityLevel] = useState('');
  const [trainingTypes, setTrainingTypes] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentCombo, setEquipmentCombo] = useState('');
  const [injuries, setInjuries] = useState('');

  const [mealsPerDay, setMealsPerDay] = useState('');
  const [eatingPattern, setEatingPattern] = useState('');
  const [allergies, setAllergies] = useState('');
  const [nutritionHabits, setNutritionHabits] = useState<string[]>([]);

  const [progressTracking, setProgressTracking] = useState<string[]>([]);
  const [workedWithCoach, setWorkedWithCoach] = useState('');

  const [notWillingToTolerate, setNotWillingToTolerate] = useState('');
  const [whatTriedAndWhy, setWhatTriedAndWhy] = useState('');
  const [lifeDifferentIfWorks, setLifeDifferentIfWorks] = useState('');
  const [anticipateResistance, setAnticipateResistance] = useState('');
  const [preparedToInvest2500, setPreparedToInvest2500] = useState<boolean | null>(null);

  const [agreementMedical, setAgreementMedical] = useState(false);
  const [agreementResponsibility, setAgreementResponsibility] = useState(false);
  const [agreementPersonalUse, setAgreementPersonalUse] = useState(false);
  const [agreementConsistency, setAgreementConsistency] = useState(false);
  const [agreementNoRefunds, setAgreementNoRefunds] = useState(false);
  const [agreementNoGuarantee, setAgreementNoGuarantee] = useState(false);
  const [signature, setSignature] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleMulti = (arr: string[], setter: (v: string[]) => void, v: string) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const isCoaching = program === 'coaching';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    setError('');
    const required = !fullName.trim() || !email.trim() || !program || !primaryGoal.trim() || !whyImportant.trim() ||
      !typicalWeekday.trim() || !workoutTime || !daysPerWeek || !activityLevel || !signature.trim();
    const agreementsOk = agreementMedical && agreementResponsibility && agreementPersonalUse && agreementConsistency && agreementNoRefunds && agreementNoGuarantee;
    if (required || !agreementsOk) {
      setError('Please fill in all required fields and confirm all agreements.');
      return;
    }
    if (program === 'in-person' && !inPersonOption) {
      setError('Please select 1:1 or Duet if applying for in-person training.');
      return;
    }
    if (isCoaching && preparedToInvest2500 === null) {
      setError('Please answer whether you are prepared to invest $2,500 for 8 weeks of 1:1 coaching.');
      return;
    }
    setSubmitting(true);
    try {
      const data: IntakeSubmissionData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dob || undefined,
        height: height || undefined,
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
        program,
        inPersonOption: program === 'in-person' ? (inPersonOption as '1:1' | 'duet') : undefined,
        primaryGoal: primaryGoal.trim(),
        whyImportant: whyImportant.trim(),
        commitmentLevel: commitment,
        biggestObstacle,
        typicalWeekday: typicalWeekday.trim(),
        workoutTime,
        daysPerWeek,
        sleepHours: sleepHours || undefined,
        stressLevel: stressLevel || undefined,
        activityLevel,
        trainingTypes,
        equipment,
        equipmentCombo: equipment.includes('Combination') ? equipmentCombo : undefined,
        injuries: injuries.trim() || undefined,
        mealsPerDay: mealsPerDay || undefined,
        eatingPattern: eatingPattern.trim() || undefined,
        allergies: allergies.trim() || undefined,
        nutritionHabits,
        progressTracking,
        workedWithCoach: workedWithCoach.trim() || undefined,
        notWillingToTolerate: isCoaching ? notWillingToTolerate.trim() || undefined : undefined,
        whatTriedAndWhy: isCoaching ? whatTriedAndWhy.trim() || undefined : undefined,
        lifeDifferentIfWorks: isCoaching ? lifeDifferentIfWorks.trim() || undefined : undefined,
        anticipateResistance: isCoaching ? anticipateResistance.trim() || undefined : undefined,
        preparedToInvest2500: isCoaching ? preparedToInvest2500 ?? undefined : undefined,
        agreementMedical,
        agreementResponsibility,
        agreementPersonalUse,
        agreementConsistency,
        agreementNoRefunds,
        agreementNoGuarantee,
        signature: signature.trim(),
        submittedAt: new Date().toISOString(),
        inviteId,
        newClient,
        trainerId,
      };
      await saveIntakeToFirebase(data);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit. Check Firebase config.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-3 rounded-xl bg-red-500/15 text-red-600 text-sm">{error}</div>}

      {/* Header */}
      <div className="text-sm text-[var(--muted-foreground)] space-y-2">
        <p>This application is required for custom programming, virtual coaching, and in-person training.</p>
        <p>Pre-made programs are purchased separately and delivered automatically. They do not require an application.</p>
        <p>Please answer honestly. I personally review every application and reserve the right to accept or decline based on fit.</p>
      </div>

      {/* Basic Information */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Basic Information</h4>
        <div className="space-y-3">
          <GlassInput label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={preview} />
          <GlassInput label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Double-check — all communication is sent here" required disabled={preview} />
          <GlassInput label="Phone Number *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Required for in-person training" required disabled={preview} />
          <GlassInput label="Date of Birth (MM/DD/YYYY)" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={preview} />
          <GlassInput label="Height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={"e.g., 5'6\""} disabled={preview} />
          <GlassInput label="Current Weight (lbs)" type="number" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} disabled={preview} />
          <GlassInput label="Goal Weight (lbs)" type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} placeholder="If applicable" disabled={preview} />
        </div>
      </section>

      {/* What are you applying for */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">What Are You Applying For? *</h4>
        <p className="text-sm text-[var(--muted-foreground)] mb-2">Select ONE primary option:</p>
        <div className="space-y-2">
          {[
            { value: 'bundle', label: 'Custom Training + Meal Plan Bundle (Self-Guided – 6 Weeks)' },
            { value: 'coaching', label: 'Virtual 1:1 Coaching (8-Week Program – Application Only)' },
            { value: 'in-person', label: 'In-Person Personal Training (Consultation Required)' },
          ].map((o) => (
            <label key={o.value} className={cn('flex items-center gap-3 p-3 rounded-xl', !preview && 'cursor-pointer hover:bg-white/30')}>
              <input type="radio" name="program" value={o.value} checked={program === o.value} onChange={() => { setProgram(o.value); setInPersonOption(''); }} disabled={preview} required />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
        {program === 'in-person' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">If in-person training, which option?</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '1:1' as const, label: '1:1 Personal Training' },
                { value: 'duet' as const, label: 'Duet Training (2 people)' },
              ].map((o) => (
                <button key={o.value} type="button" onClick={() => !preview && setInPersonOption(o.value)} className={cn('px-4 py-2 rounded-xl text-sm', inPersonOption === o.value ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Goals & Readiness */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Goals & Readiness</h4>
        <div className="space-y-3">
          <GlassTextArea label="What is your primary goal for the next 6–8 weeks? *" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} rows={3} required disabled={preview} />
          <GlassTextArea label="Why is this goal important to you right now? *" value={whyImportant} onChange={(e) => setWhyImportant(e.target.value)} rows={3} required disabled={preview} />
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">On a scale of 1–10, how committed are you to following a structured plan consistently? *</label>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">1 (low commitment) → 10 (fully committed)</p>
            <input type="range" min={1} max={10} value={commitment} onChange={(e) => setCommitment(parseInt(e.target.value, 10))} disabled={preview} className="w-full" />
            <p className="text-center font-semibold text-[var(--primary)]">{commitment}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">What has been your biggest obstacle so far?</label>
            <div className="flex flex-wrap gap-2">
              {OBSTACLES.map((o) => (
                <label key={o} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer', !preview && 'hover:bg-white/30')}>
                  <input type="checkbox" checked={biggestObstacle.includes(o)} onChange={() => toggleMulti(biggestObstacle, setBiggestObstacle, o)} disabled={preview} />
                  <span className="text-sm">{o}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle & Schedule */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Lifestyle & Schedule</h4>
        <div className="space-y-3">
          <GlassTextArea label="Describe a typical weekday (work schedule, responsibilities, energy levels): *" value={typicalWeekday} onChange={(e) => setTypicalWeekday(e.target.value)} rows={3} required disabled={preview} />
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">When would you realistically train most days? *</label>
            <div className="flex flex-wrap gap-2">
              {['Morning', 'Midday', 'Evening', 'Varies'].map((t) => (
                <button key={t} type="button" onClick={() => !preview && setWorkoutTime(t.toLowerCase())} className={cn('px-4 py-2 rounded-xl text-sm', workoutTime === t.toLowerCase() ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">How many days per week can you commit to training? *</label>
            <div className="flex flex-wrap gap-2">
              {['2–3', '3–4', '4–5', '5+'].map((d) => (
                <button key={d} type="button" onClick={() => !preview && setDaysPerWeek(d)} className={cn('px-4 py-2 rounded-xl text-sm', daysPerWeek === d ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <GlassInput label="Average sleep per night (hours)" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} type="number" min={0} max={24} step={0.5} disabled={preview} />
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">Current stress level (1–10)</label>
            <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value, 10))} disabled={preview} className="w-full" />
            <p className="text-center font-semibold text-[var(--primary)]">{stressLevel}</p>
          </div>
        </div>
      </section>

      {/* Training Background */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Training Background</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Current training experience level: *</label>
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((a) => (
                <button key={a} type="button" onClick={() => !preview && setActivityLevel(a.toLowerCase())} className={cn('px-4 py-2 rounded-xl text-sm', activityLevel === a.toLowerCase() ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">What types of training do you enjoy or currently do? (Check all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {TRAINING_TYPES.map((t) => (
                <label key={t} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer', !preview && 'hover:bg-white/30')}>
                  <input type="checkbox" checked={trainingTypes.includes(t)} onChange={() => toggleMulti(trainingTypes, setTrainingTypes, t)} disabled={preview} />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">What equipment do you have access to?</label>
            <div className="space-y-2">
              {EQUIPMENT_OPTIONS.map((e) => (
                <label key={e} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer', !preview && 'hover:bg-white/30')}>
                  <input type="checkbox" checked={equipment.includes(e)} onChange={() => toggleMulti(equipment, setEquipment, e)} disabled={preview} />
                  <span className="text-sm">{e}</span>
                </label>
              ))}
              {equipment.includes('Combination') && (
                <GlassInput label="Please specify" value={equipmentCombo} onChange={(e) => setEquipmentCombo(e.target.value)} placeholder="Describe your equipment access" disabled={preview} />
              )}
            </div>
          </div>
          <GlassTextArea label="Any injuries, pain, or movements that should be avoided? (Be specific.)" value={injuries} onChange={(e) => setInjuries(e.target.value)} rows={2} disabled={preview} />
        </div>
      </section>

      {/* Nutrition (for custom program applicants) */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Nutrition (For Custom Program Applicants)</h4>
        <div className="space-y-3">
          <GlassInput label="How many meals do you typically eat per day?" value={mealsPerDay} onChange={(e) => setMealsPerDay(e.target.value)} disabled={preview} />
          <GlassTextArea label="Describe your current eating pattern" value={eatingPattern} onChange={(e) => setEatingPattern(e.target.value)} placeholder="Home-cooked, meal prep, eating out, inconsistent, etc." rows={2} disabled={preview} />
          <GlassTextArea label="Any food allergies, intolerances, or foods you refuse to eat?" value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={2} disabled={preview} />
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Which habits do you currently struggle with?</label>
            <div className="flex flex-wrap gap-2">
              {NUTRITION_HABITS.map((h) => (
                <label key={h} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer', !preview && 'hover:bg-white/30')}>
                  <input type="checkbox" checked={nutritionHabits.includes(h)} onChange={() => toggleMulti(nutritionHabits, setNutritionHabits, h)} disabled={preview} />
                  <span className="text-sm">{h}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Progress & History */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Progress & History</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">How do you prefer to track progress?</label>
            <div className="flex flex-wrap gap-2">
              {PROGRESS_OPTIONS.map((p) => (
                <label key={p} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer', !preview && 'hover:bg-white/30')}>
                  <input type="checkbox" checked={progressTracking.includes(p)} onChange={() => toggleMulti(progressTracking, setProgressTracking, p)} disabled={preview} />
                  <span className="text-sm">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <GlassTextArea label="Have you worked with a coach before? If yes, what worked and what didn't? (Optional)" value={workedWithCoach} onChange={(e) => setWorkedWithCoach(e.target.value)} rows={3} disabled={preview} />
        </div>
      </section>

      {/* Virtual 1:1 Coaching Applicants Only */}
      {isCoaching && (
        <section className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
          <h4 className="font-semibold text-[var(--foreground)] mb-2">Virtual 1:1 Coaching Applicants Only</h4>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">Skip if not applying for coaching</p>
          <div className="space-y-3">
            <GlassTextArea label="What are you no longer willing to tolerate about your current habits, body, or lifestyle?" value={notWillingToTolerate} onChange={(e) => setNotWillingToTolerate(e.target.value)} rows={3} disabled={preview} />
            <GlassTextArea label="What have you already tried to change on your own, and why do you think it hasn't stuck?" value={whatTriedAndWhy} onChange={(e) => setWhatTriedAndWhy(e.target.value)} rows={3} disabled={preview} />
            <GlassTextArea label="How will your life look different if this works exactly as intended?" value={lifeDifferentIfWorks} onChange={(e) => setLifeDifferentIfWorks(e.target.value)} rows={3} disabled={preview} />
            <GlassTextArea label="This program requires consistent execution, honest check-ins, and direct feedback. Where do you anticipate resistance coming up for you?" value={anticipateResistance} onChange={(e) => setAnticipateResistance(e.target.value)} rows={2} disabled={preview} />
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Are you prepared to invest $2,500 for 8 weeks of 1:1 coaching if accepted? *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => !preview && setPreparedToInvest2500(true)} className={cn('px-4 py-2 rounded-xl text-sm', preparedToInvest2500 === true ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>Yes</button>
                <button type="button" onClick={() => !preview && setPreparedToInvest2500(false)} className={cn('px-4 py-2 rounded-xl text-sm', preparedToInvest2500 === false ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>No</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Agreements */}
      <section>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Agreements & Confirmation</h4>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">Please confirm the following:</p>
        <div className="space-y-2">
          {[
            { state: agreementMedical, set: setAgreementMedical, text: 'I have medical clearance to exercise and understand this is not medical advice.' },
            { state: agreementResponsibility, set: setAgreementResponsibility, text: 'I accept full responsibility for my health and participation.' },
            { state: agreementPersonalUse, set: setAgreementPersonalUse, text: 'All programs are for personal use only.' },
            { state: agreementConsistency, set: setAgreementConsistency, text: 'Results depend on my consistency and follow-through.' },
            { state: agreementNoRefunds, set: setAgreementNoRefunds, text: 'No refunds are offered once a program or coaching begins.' },
            { state: agreementNoGuarantee, set: setAgreementNoGuarantee, text: 'Submission does not guarantee acceptance.' },
          ].map(({ state, set, text }) => (
            <label key={text} className={cn('flex items-center gap-3 p-3 rounded-xl', !preview && 'cursor-pointer hover:bg-white/30')}>
              <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} disabled={preview} required />
              <span className="text-sm">{text}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <GlassInput label="Digital Signature (Type Full Name) *" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your full legal name" required disabled={preview} />
        </div>
      </section>

      {/* What Happens Next */}
      <div className="text-sm text-[var(--muted-foreground)] p-4 rounded-xl bg-white/50 space-y-1">
        <p className="font-medium text-[var(--foreground)]">What Happens Next</p>
        <p>• Applications are reviewed within 3–5 business days</p>
        <p>• If accepted, you will receive payment instructions and next steps via email</p>
        <p>• If not a fit, I may recommend a pre-made program instead</p>
      </div>

      {!preview && (
        <GlassButton type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </GlassButton>
      )}
    </form>
  );
}
