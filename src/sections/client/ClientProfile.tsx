import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Bell, Shield, LogOut, ChevronRight, Edit, Palette } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput, GlassTextArea } from '@/components/glass/GlassInput';
import { Header } from '@/components/Header';
import { getClientById, getClientNotificationEnabled, setClientNotificationEnabled, getClientDataSharingPrefs, setClientDataSharingPrefs, updateClientGoals, addClientFeedback, updateClientAvatar } from '@/data/mockData';
import { useTheme } from '@/hooks/useTheme';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
  onLogout: () => void;
}

export function ClientProfile({ clientId, onBack, onLogout }: ClientProfileProps) {
  const [, setAvatarRefresh] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const client = getClientById(clientId);
  const { openThemePicker } = useTheme();
  if (!client) return null;
  const [isEditing, setIsEditing] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateClientAvatar(clientId, url);
      setAvatarRefresh((r) => r + 1);
    }
    e.target.value = '';
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const menuItems = [
    { icon: User, label: 'Personal Information', action: () => setIsEditing(true) },
    { icon: Palette, label: 'Customize Theme', action: openThemePicker },
    { icon: Bell, label: 'Notifications', action: () => setShowNotifications(true) },
    { icon: Shield, label: 'Privacy & Security', action: () => setShowPrivacy(true) },
  ];

  return (
    <div className="min-h-screen pb-above-nav flex flex-col">
      <Header
        title="Profile"
        showBack
        onBack={onBack}
        onNotificationClick={() => setShowNotifications(true)}
        notificationCount={0}
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto flex-1 overflow-y-auto min-h-0">
        {/* Profile Card */}
        <GlassCard className="overflow-hidden">
          <div className="p-6 text-center">
            <motion.div 
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white/50 shadow-xl mx-auto">
                {client.avatar ? (
                  <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-semibold">
                    {client.name.charAt(0)}
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--primary)]/90 transition-colors"
                title="Change profile picture"
              >
                <Edit className="w-4 h-4" />
              </button>
            </motion.div>
            
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-4">{client.name}</h2>
            <p className="text-[var(--muted-foreground)]">{client.email}</p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{client.age}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Years Old</p>
              </div>
              <div className="w-px h-10 bg-[var(--border)]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{client.sessionsRemaining}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Sessions Left</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Goals */}
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">My Goals</h3>
              <button onClick={() => setShowEditGoals(true)} className="text-sm text-[var(--primary)] font-medium hover:underline">
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {client.goals?.map((goal, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Trainer Info */}
        <GlassCard>
          <div className="p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">My Trainer</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xl font-semibold">
                {client.trainerName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--foreground)]">{client.trainerName}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Personal Trainer</p>
              </div>
              <GlassButton size="sm" onClick={() => setShowContactModal(true)}>Contact</GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={item.action}
              className="w-full"
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard hover className="overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <span className="flex-1 text-left font-medium text-[var(--foreground)]">
                    {item.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
              </GlassCard>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full" onClick={onLogout}>
          <GlassCard hover className="overflow-hidden border-red-200">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <span className="flex-1 text-left font-medium text-red-500">
                Log Out
              </span>
            </div>
          </GlassCard>
        </button>
      </div>

      {/* Edit Modal - positioned higher, scrollable */}
      {isEditing && (
        <EditProfileModal 
          client={client} 
          onClose={() => setIsEditing(false)} 
        />
      )}
      {showNotifications && (
        <NotificationsModal clientId={clientId} onClose={() => setShowNotifications(false)} />
      )}
      {showContactModal && (
        <ContactTrainerModal
          clientId={clientId}
          trainerName={client.trainerName}
          onClose={() => setShowContactModal(false)}
        />
      )}
      {showPrivacy && (
        <PrivacySecurityModal clientId={clientId} onClose={() => setShowPrivacy(false)} />
      )}
      {showEditGoals && (
        <EditGoalsModal
          currentGoals={client.goals ?? []}
          onClose={() => setShowEditGoals(false)}
          onSave={(goals) => { updateClientGoals(clientId, goals); setShowEditGoals(false); }}
        />
      )}
    </div>
  );
}

const PREBUILT_GOALS = ['Build muscle', 'Lose weight', 'Gain strength', 'Longevity', 'Improve flexibility', 'Increase energy', 'Better posture', 'Stress relief'];

function EditGoalsModal({ currentGoals, onClose, onSave }: { currentGoals: string[]; onClose: () => void; onSave: (goals: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentGoals));
  const [custom, setCustom] = useState('');

  const toggle = (g: string) => {
    const next = new Set(selected);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    setSelected(next);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed) {
      setSelected((s) => new Set([...s, trimmed]));
      setCustom('');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Edit goals</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PREBUILT_GOALS.map((g) => (
              <button key={g} onClick={() => toggle(g)} className={cn('px-4 py-2 rounded-xl text-sm', selected.has(g) ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>{g}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())} placeholder="Add custom goal..." className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
            <GlassButton onClick={addCustom} disabled={!custom.trim()}>Add</GlassButton>
          </div>
          <GlassButton variant="primary" fullWidth onClick={() => onSave([...selected])}>Save goals</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function ContactTrainerModal({ clientId, trainerName, onClose }: { clientId: string; trainerName: string; onClose: () => void }) {
  const [note, setNote] = useState('');

  const handleSend = () => {
    if (note.trim()) {
      addClientFeedback({ clientId, type: 'contact_trainer', content: note.trim() });
      onClose();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Contact {trainerName}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Your note will be sent to {trainerName} and she will be notified.</p>
        <GlassTextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write your message..." rows={4} className="bg-white/30" />
        <GlassButton variant="primary" fullWidth className="mt-4" onClick={handleSend} disabled={!note.trim()}>Send</GlassButton>
      </motion.div>
    </>
  );
}

function NotificationsModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const enabled = getClientNotificationEnabled(clientId);
  const [value, setValue] = useState(enabled);

  const handleToggle = () => {
    const next = !value;
    setValue(next);
    setClientNotificationEnabled(clientId, next);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[15%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Notifications</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[var(--foreground)]">Push notifications</span>
          <button
            onClick={handleToggle}
            className={cn('w-12 h-7 rounded-lg flex items-center p-0.5 transition-colors', value ? 'bg-[var(--primary)] justify-end' : 'bg-white/50 justify-start')}
          >
                <span className="block w-5 h-5 rounded-md bg-white shadow transition-transform" />
          </button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">{value ? 'Notifications are on' : 'Notifications are off'}</p>
      </motion.div>
    </>
  );
}

function PrivacySecurityModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const prefs = getClientDataSharingPrefs(clientId);
  const [progress, setProgress] = useState(prefs.progress);
  const [nutrition, setNutrition] = useState(prefs.nutrition);
  const [photos, setPhotos] = useState(prefs.photos);

  const handleSave = () => {
    setClientDataSharingPrefs(clientId, { progress, nutrition, photos });
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[10%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Privacy & Security</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Choose which data to share with your trainer</p>
        <div className="space-y-3 mb-4">
          <label className="flex items-center justify-between py-2">
            <span>Progress & measurements</span>
            <input type="checkbox" checked={progress} onChange={(e) => setProgress(e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between py-2">
            <span>Nutrition logs</span>
            <input type="checkbox" checked={nutrition} onChange={(e) => setNutrition(e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between py-2">
            <span>Progress photos</span>
            <input type="checkbox" checked={photos} onChange={(e) => setPhotos(e.target.checked)} className="rounded" />
          </label>
        </div>
        <div className="p-4 rounded-2xl bg-white/30 text-sm text-[var(--muted-foreground)] mb-4">
          <strong className="text-[var(--foreground)]">Privacy notice</strong>
          <p className="mt-2">Your data is stored securely and used only to provide personalized training. We follow industry-standard practices to protect your information. We do not sell your data to third parties.</p>
        </div>
        <GlassButton variant="primary" fullWidth onClick={handleSave}>Save preferences</GlassButton>
      </motion.div>
    </>
  );
}

function EditProfileModal({ client, onClose }: { client: Client; onClose: () => void }) {
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
        className="fixed top-[8%] left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[75vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Edit Profile</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                {client.avatar ? (
                  <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-semibold">
                    {client.name.charAt(0)}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          <GlassInput
            label="Full Name"
            defaultValue={client.name}
            leftIcon={<User className="w-4 h-4" />}
          />

          <GlassInput
            label="Email"
            type="email"
            defaultValue={client.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <GlassInput
            label="Phone"
            type="tel"
            defaultValue={client.phone || ''}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <GlassInput
            label="Age"
            type="number"
            defaultValue={client.age.toString()}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <GlassButton variant="primary" fullWidth className="mt-6">
            Save Changes
          </GlassButton>
        </div>
      </motion.div>
    </>
  );
}
