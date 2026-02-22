import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTextArea } from '@/components/glass/GlassInput';
import { getClientById, getIdentityWorksheetEntries, addIdentityWorksheetEntry } from '@/data/mockData';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

export type PronounSet = { subject: string; object: string; possessive: string; reflexive: string; title: string };
export function getPronouns(client: Client | undefined): PronounSet {
  const g = client?.gender;
  if (g === 'woman') return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself', title: 'woman' };
  if (g === 'man') return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself', title: 'man' };
  return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves', title: 'person' };
}

const IDENTITY_QUESTIONS: { id: string; label: string; placeholder?: string; rows?: number }[] = [
  { id: 'cover', label: '', rows: 0 },
  { id: 'q1', label: '1. How do you currently see yourself? Write freely using "I am" statements (minimum 5).', placeholder: 'e.g. I am inconsistent even when I care. I am motivated by emotion, not commitment...', rows: 6 },
  { id: 'q2', label: '2. What patterns or behaviors have been holding you back? Be brutally specific.', placeholder: 'Consider: stress response, self-talk when you fall off, relying on motivation vs structure, what drains you...', rows: 6 },
  { id: 'q3', label: '3. How has this version of you been keeping you safe but stuck? What discomfort does it avoid? What would you have to face if you changed?', placeholder: 'Example: Staying inconsistent keeps me safe from the fear of trying my hardest and still failing...', rows: 5 },
  { id: 'q4', label: '4. What story have you been telling yourself about why you can\'t change? Your story:', placeholder: 'e.g. "I\'m just not disciplined." / "I\'ll start when X happens." Is it true, or just familiar?', rows: 4 },
  { id: 'q5', label: '5. What is the cost of staying the same? If nothing changes in 6 months, what will you miss?', placeholder: 'Body, opportunities, confidence, respect, the life that stays out of reach...', rows: 5 },
  { id: 'q6a', label: '6. What is one belief you need to let go of? (A belief, not a habit.)', placeholder: 'e.g. "I need to feel motivated to take action."', rows: 2 },
  { id: 'q6b', label: '6b. Rewrite that belief. Your new belief:', placeholder: 'e.g. "Action creates motivation. I move first, feelings follow."', rows: 2 },
  { id: 'q7', label: '7. What do you need to grieve or forgive before you can rebuild?', placeholder: 'Past self to forgive, time/opportunity to grieve, resentment to release, what to accept...', rows: 5 },
  { id: 'q8a', label: '8. Smallest identity shift – from (old):', placeholder: 'e.g. "I want to work out more"', rows: 1 },
  { id: 'q8b', label: '8b. To (new identity statement):', placeholder: 'e.g. "I am someone who trains 3x/week, no exceptions."', rows: 1 },
  { id: 'q9', label: '9. What will you need to stop doing to become {{object}}?', placeholder: 'e.g. Stop negotiating every morning about working out; stop eating while distracted...', rows: 4 },
  { id: 'q10', label: '10. What will you need to start tolerating? Growth is uncomfortable.', placeholder: 'Discomfort during workouts, hunger between meals, saying no, being misunderstood...', rows: 4 },
  { id: 'q11', label: '11. Who is the version of you who already has what you want? Describe how {{subject}} carries {{reflexive}}, speaks to {{reflexive}}, moves through the day.', placeholder: '{{subject}} is calm, decisive, self-trusting. {{subject}} does not wait to feel ready...', rows: 6 },
  { id: 'q12', label: '12. What does a normal day in {{possessive}} life look like? (A random Tuesday, morning to night.)', placeholder: 'How {{subject}} starts the day, eats, trains, handles work and stress, unwinds, ends the day...', rows: 6 },
  { id: 'q13', label: '13. What are three core beliefs {{subject}} operates from? Non-negotiables.', placeholder: 'e.g. "I am the type of {{title}} who follows through." / "My actions matter more than my mood."', rows: 4 },
  { id: 'q14', label: '14. When things get hard, what does {{subject}} do? (When tired, stressed, behind, or spiraling.)', placeholder: '{{subject}} simplifies instead of quitting. {{subject}} asks "What would the {{title}} I\'m becoming do?"', rows: 4 },
  { id: 'q15', label: '15. What does {{subject}} no longer tolerate?', placeholder: 'Skipping meals then bingeing; mood dictating choices; breaking promises to themselves...', rows: 4 },
  { id: 'q16', label: '16. What needs to change in your real life to support this identity?', placeholder: 'Boundaries, schedule, meals/movement systems, self-talk, environment, what you consume...', rows: 5 },
  { id: 'q17', label: '17. Three micro-commitments this week. Specific, boring, repeatable, non-negotiable.', placeholder: 'e.g. Train 3x; 10k steps daily; 100oz water; no phone in bedroom; track every meal...', rows: 4 },
  { id: 'q18', label: '18. When you slip, how will you respond? Your response protocol:', placeholder: '"That happened. What\'s the next right move? I\'ll do that."', rows: 3 },
  { id: 'q19', label: '19. Who will hold you accountable, and how?', placeholder: 'Coach, friend, written agreement, public commitment...', rows: 3 },
  { id: 'q20', label: '20. What will you do when you want to quit?', placeholder: 'Reread this worksheet; text coach; go for a walk; one more day; remember the cost of staying the same...', rows: 4 },
  { id: 'decl1', label: 'Identity declaration: "I am no longer available for…"', placeholder: '', rows: 2 },
  { id: 'decl2', label: '"From now on, I show up as the {{title}} who…"', placeholder: '', rows: 2 },
  { id: 'decl3', label: '"I am becoming {{object}} by…"', placeholder: '', rows: 2 },
];

function applyPronouns(text: string, p: PronounSet): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return text
    .replace(/\{\{subject\}\}/g, p.subject)
    .replace(/\{\{Subject\}\}/g, cap(p.subject))
    .replace(/\{\{object\}\}/g, p.object)
    .replace(/\{\{Object\}\}/g, cap(p.object))
    .replace(/\{\{possessive\}\}/g, p.possessive)
    .replace(/\{\{Possessive\}\}/g, cap(p.possessive))
    .replace(/\{\{reflexive\}\}/g, p.reflexive)
    .replace(/\{\{Reflexive\}\}/g, cap(p.reflexive))
    .replace(/\{\{title\}\}/g, p.title)
    .replace(/\{\{Title\}\}/g, cap(p.title));
}

interface IdentityWorksheetProps {
  clientId: string;
}

export function IdentityWorksheet({ clientId }: IdentityWorksheetProps) {
  const client = getClientById(clientId);
  const pronouns = getPronouns(client);
  const entries = getIdentityWorksheetEntries(clientId);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const latest = entries[0];
    if (latest?.answers && Object.keys(latest.answers).length > 0) return latest.answers;
    return {};
  });
  const [activeSection, setActiveSection] = useState<string>('cover');

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    addIdentityWorksheetEntry({
      clientId,
      date: new Date().toISOString().split('T')[0],
      answers: { ...answers },
    });
  };

  const intro = `This is not journaling for comfort. This is identity reconstruction.
Set aside 45-60 uninterrupted minutes with no phone and no distractions. Answer honestly, without softening or shaming yourself. Every habit you keep or break reinforces the identity you believe you are. Tell the truth so you can change it and move forward.

You will need: This worksheet • Complete honesty • Zero distractions.`;

  const part1Intro = `Part 1: The current you (self-assessment)`;
  const part2Intro = `Part 2: The gap (the bridge you're about to build)
Safety feels good. Growth requires friction.`;
  const part3Intro = `Part 3: The future you (reconstruction)
Close your eyes. See {{object}} clearly. Feel {{possessive}} energy.`;
  const part4Intro = `Part 4: The bridge (turning decision into action)
You will slip. Plan for it now.`;
  const finalIntro = `Final step: Identity declaration
Complete the statements below. Read this out loud. This is not a wish. This is a decision.`;
  const howToUse = `How to use this moving forward
Week 1: Complete this worksheet fully. Sit with it.
Week 2–6: Reread your Identity Declaration every Monday morning.
When you're struggling: Return to Part 2. Reread what staying the same will cost you.
When you feel off track: Return to your micro-commitments (Question 17). Just do those.
Monthly: Revisit the entire worksheet. Update your answers as you evolve.

You do not need a new personality. You need new standards. And those start here.`;

  const sections = [
    { id: 'cover', title: 'Cover' },
    { id: 'part1', title: 'Part 1' },
    { id: 'part2', title: 'Part 2' },
    { id: 'part3', title: 'Part 3' },
    { id: 'part4', title: 'Part 4' },
    { id: 'final', title: 'Declaration' },
  ];

  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const currentSection = sections[safeIndex];
  const nextSection = sections[safeIndex + 1];
  const progressPercent = ((safeIndex + 1) / sections.length) * 100;

  const goPrev = () => {
    if (safeIndex > 0) setActiveSection(sections[safeIndex - 1].id);
  };
  const goNext = () => {
    if (safeIndex < sections.length - 1) setActiveSection(sections[safeIndex + 1].id);
  };

  return (
    <div className="space-y-6 pb-safe">
      {/* Current / Next page + progress bar — mobile-friendly */}
      <div className="sticky top-0 z-10 -mx-4 px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-3 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]/50">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Current page</p>
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{currentSection?.title ?? 'Cover'}</p>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Next page</p>
            <p className="text-sm font-semibold text-[var(--muted-foreground)] truncate">{nextSection?.title ?? '—'}</p>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex gap-2 mt-3 min-h-[44px]">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex === 0}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation',
              safeIndex === 0 ? 'bg-white/30 text-[var(--muted-foreground)] opacity-60 cursor-not-allowed' : 'bg-white/60 text-[var(--foreground)] active:bg-white/80'
            )}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={safeIndex === sections.length - 1}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation',
              safeIndex === sections.length - 1 ? 'bg-white/30 text-[var(--muted-foreground)] opacity-60 cursor-not-allowed' : 'bg-[var(--primary)] text-[var(--primary-foreground)] active:opacity-90'
            )}
          >
            Next
          </button>
        </div>
      </div>

      {/* Cover */}
      {(activeSection === 'cover' || !activeSection) && (
        <GlassCard variant="strong" className="overflow-hidden relative">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-[var(--theme-gradient-start)] to-transparent pointer-events-none" />
          <div className="relative p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-wide">
              Identity Rewrite Workshop
            </h2>
            <p className="text-lg font-semibold text-[var(--primary)]">
              This is where lasting change begins
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              45–60 minute deep work session
            </p>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-line text-left">
              {intro}
            </p>
            <GlassButton
              variant="primary"
              fullWidth
              onClick={() => setActiveSection('part1')}
              className="mt-4"
              style={{ background: 'linear-gradient(135deg, var(--theme-gradient-start), var(--theme-gradient-end))' }}
            >
              Begin now
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Part 1 */}
      {activeSection === 'part1' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">{part1Intro}</h3>
          {IDENTITY_QUESTIONS.filter((q) => ['q1', 'q2', 'q3', 'q4'].includes(q.id)).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">{applyPronouns(q.label, pronouns)}</label>
              <GlassTextArea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder ? applyPronouns(q.placeholder, pronouns) : undefined}
                rows={q.rows ?? 3}
                className="min-h-0 bg-white/30"
              />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Part 2 */}
      {activeSection === 'part2' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">{applyPronouns(part2Intro, pronouns)}</h3>
          {IDENTITY_QUESTIONS.filter((q) => ['q5', 'q6a', 'q6b', 'q7', 'q8a', 'q8b', 'q9', 'q10'].includes(q.id)).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">{applyPronouns(q.label, pronouns)}</label>
              <GlassTextArea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder ? applyPronouns(q.placeholder, pronouns) : undefined}
                rows={q.rows ?? 2}
                className="min-h-0 bg-white/30"
              />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Part 3 */}
      {activeSection === 'part3' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">{applyPronouns(part3Intro, pronouns)}</h3>
          {IDENTITY_QUESTIONS.filter((q) => ['q11', 'q12', 'q13', 'q14', 'q15', 'q16'].includes(q.id)).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">{applyPronouns(q.label, pronouns)}</label>
              <GlassTextArea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder ? applyPronouns(q.placeholder, pronouns) : undefined}
                rows={q.rows ?? 3}
                className="min-h-0 bg-white/30"
              />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Part 4 */}
      {activeSection === 'part4' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">{applyPronouns(part4Intro, pronouns)}</h3>
          {IDENTITY_QUESTIONS.filter((q) => ['q17', 'q18', 'q19', 'q20'].includes(q.id)).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">{applyPronouns(q.label, pronouns)}</label>
              <GlassTextArea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder ? applyPronouns(q.placeholder, pronouns) : undefined}
                rows={q.rows ?? 3}
                className="min-h-0 bg-white/30"
              />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Final Declaration */}
      {activeSection === 'final' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">{applyPronouns(finalIntro, pronouns)}</h3>
          {IDENTITY_QUESTIONS.filter((q) => ['decl1', 'decl2', 'decl3'].includes(q.id)).map((q) => (
            <GlassCard key={q.id} className="p-4">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">{applyPronouns(q.label, pronouns)}</label>
              <GlassTextArea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder ? applyPronouns(q.placeholder, pronouns) : undefined}
                rows={q.rows ?? 2}
                className="min-h-0 bg-white/30"
              />
            </GlassCard>
          ))}
          <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line">{howToUse}</p>
        </div>
      )}

      <GlassButton
        variant="primary"
        fullWidth
        onClick={handleSave}
        className="py-3 font-semibold"
        style={{ background: 'linear-gradient(135deg, var(--theme-gradient-start) 0%, var(--theme-gradient-mid) 50%, var(--theme-gradient-end) 100%)' }}
      >
        Save Progress
      </GlassButton>

      {/* Past entries */}
      <div>
        <h4 className="font-semibold text-[var(--foreground)] mb-3">Past entries</h4>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.slice(0, 5).map((e) => (
              <GlassCard key={e.id} className="p-4">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">{new Date(e.date).toLocaleDateString('en-US')}</p>
                {e.answers && Object.keys(e.answers).length > 0 ? (
                  <p className="text-sm text-[var(--foreground)] line-clamp-2">
                    {Object.values(e.answers).filter(Boolean).slice(0, 2).join(' • ')}
                  </p>
                ) : (
                  <>
                    {e.feeling && <p><span className="text-sm font-medium">Feeling:</span> {e.feeling}</p>}
                    {e.emotionalTraits && <p><span className="text-sm font-medium">Emotional:</span> {e.emotionalTraits}</p>}
                    {e.physicalTraits && <p><span className="text-sm font-medium">Physical:</span> {e.physicalTraits}</p>}
                    {e.notes && <p><span className="text-sm font-medium">Notes:</span> {e.notes}</p>}
                  </>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-6 text-center">
            <p className="text-[var(--muted-foreground)]">No entries yet. Complete the sections above and tap Save Progress.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
