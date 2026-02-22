import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Phone, Mail, AlertCircle } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { addClient, generateAccessCode } from '@/data/mockData';
import type { NewClientInput } from '@/data/mockData';

interface AddClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
  trainerId: string;
  trainerName: string;
}

export function AddClientModal({ onClose, onSuccess, trainerId, trainerName }: AddClientModalProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [goals, setGoals] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const handleGenerateCode = () => {
    const code = generateAccessCode();
    setAccessCode(code);
    setGeneratedCode(code);
    setAutoGenerate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = fullName.trim();
    if (!name) {
      setError('Full name is required');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Please enter a valid age');
      return;
    }

    const email = contactEmail.trim();
    if (!email) {
      setError('Email is required');
      return;
    }

    const input: NewClientInput = {
      name,
      age: ageNum,
      email,
      phone: contactPhone.trim() || undefined,
      accessCode: autoGenerate ? undefined : accessCode.trim() || undefined,
      emergencyContact:
        emergencyName || emergencyPhone || emergencyRelation
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.trim(),
              relationship: emergencyRelation.trim(),
            }
          : undefined,
      goals: goals.trim() ? goals.trim().split(',').map((g) => g.trim()).filter(Boolean) : undefined,
      medicalHistory: medicalHistory.trim() || undefined,
    };

    const client = addClient(input, trainerId, trainerName);
    setGeneratedCode(client.accessCode);
    setJustAdded(true);
    onSuccess();
    if (!client.accessCode) onClose();
  };

  if (justAdded && generatedCode) {
    return (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-[var(--foreground)]">Client added!</p>
            <p className="text-sm text-[var(--muted-foreground)]">Share this access code with your client for portal login:</p>
            <p className="text-2xl font-mono font-bold text-[var(--primary)] tracking-widest">{generatedCode}</p>
            <div className="flex gap-3">
              <GlassButton fullWidth onClick={() => navigator.clipboard?.writeText(generatedCode)}>Copy</GlassButton>
              <GlassButton variant="primary" fullWidth onClick={onClose}>Done</GlassButton>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Add New Client</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Full Name * */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Full Name *
            </label>
            <GlassInput
              placeholder="Client's full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
              className="bg-white/30"
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Age
            </label>
            <GlassInput
              type="number"
              min={1}
              max={120}
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-white/30"
            />
          </div>

          {/* Client Contact Info */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide block">
              Client Contact Info (Phone, Email)
            </label>
            <GlassInput
              type="tel"
              placeholder="Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              className="bg-white/30"
            />
            <GlassInput
              type="email"
              placeholder="Email *"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              className="bg-white/30"
            />
          </div>

          {/* Client Access Code */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide block">
              Client Access Code (Optional)
            </label>
            <p className="text-xs text-[var(--muted-foreground)]">
              Leave blank to auto-generate. A unique 4-6 character code will be generated. Share this code with
              clients for portal access.
            </p>
            <div className="flex gap-2">
              <GlassInput
                placeholder="Leave blank to auto-generate"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase().slice(0, 6));
                  setAutoGenerate(false);
                }}
                maxLength={6}
                className="bg-white/30 flex-1"
              />
              <GlassButton type="button" onClick={handleGenerateCode} variant="secondary">
                Generate
              </GlassButton>
            </div>
            {generatedCode && (
              <p className="text-sm text-green-600 font-medium">
                Generated code: {generatedCode}. Share with client for login.
              </p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide block">
              Emergency Contact
            </label>
            <GlassInput
              placeholder="Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              className="bg-white/30"
            />
            <GlassInput
              placeholder="Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="bg-white/30"
            />
            <GlassInput
              placeholder="Relationship"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              className="bg-white/30"
            />
          </div>

          {/* Goals */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Goals
            </label>
            <GlassTextArea
              placeholder="Client goals and objectives..."
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="bg-white/30"
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2 block">
              Medical History
            </label>
            <GlassTextArea
              placeholder="Relevant medical history..."
              rows={3}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="bg-white/30"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton type="button" fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" fullWidth>
              Add Client
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
