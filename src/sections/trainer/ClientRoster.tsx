import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, ChevronDown, User, MoreVertical, FileText, CheckCircle, Calendar, Bell, UserX, Key, Star } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Header } from '@/components/Header';
import { AddClientModal } from '@/sections/trainer/AddClientModal';
import { ScheduleSessionModal } from '@/sections/trainer/ScheduleSessionModal';
import { QuickNoteModal } from '@/sections/trainer/QuickNoteModal';
import { SendNotificationModal } from '@/sections/trainer/SendNotificationModal';
import { toast } from 'sonner';
import { getTrainerClients, currentUser, setClientStatus, updateClientAccessCode, useClientSession, addClientStar } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientRosterProps {
  onViewClient: (clientId: string) => void;
  onBack: () => void;
  initialFilter?: 'warm-leads' | 'cold-leads';
}

type SortOption = 'name' | 'sessions' | 'recent';
type FilterOption = 'all' | 'active' | 'low-sessions' | 'leads' | 'warm-leads' | 'cold-leads';

export function ClientRoster({ onViewClient, onBack, initialFilter }: ClientRosterProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const clients = getTrainerClients(trainerId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>(initialFilter || 'all');

  useEffect(() => {
    if (initialFilter) setFilterBy(initialFilter);
  }, [initialFilter]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [showQuickNote, setShowQuickNote] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [dropdownClientId, setDropdownClientId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (filterBy) {
      case 'active':
        result = result.filter(c => c.status === 'active');
        break;
      case 'low-sessions':
        result = result.filter(c => c.sessionsRemaining <= 3);
        break;
      case 'leads':
        result = result.filter(c => c.status === 'lead');
        break;
      case 'warm-leads':
        result = result.filter(c => c.status === 'inactive' && c.leadType === 'warm');
        break;
      case 'cold-leads':
        result = result.filter(c => c.status === 'inactive' && c.leadType === 'cold');
        break;
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'sessions':
        result.sort((a, b) => b.sessionsRemaining - a.sessionsRemaining);
        break;
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.lastAssessment ? new Date(a.lastAssessment).getTime() : 0;
          const dateB = b.lastAssessment ? new Date(b.lastAssessment).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return result;
  }, [searchQuery, sortBy, filterBy]);

  const activeCount = clients.filter(c => c.status === 'active').length;
  const lowSessionCount = clients.filter(c => c.sessionsRemaining <= 3).length;
  const leadCount = clients.filter(c => c.status === 'lead').length;
  const warmLeadCount = clients.filter(c => c.status === 'inactive' && c.leadType === 'warm').length;
  const coldLeadCount = clients.filter(c => c.status === 'inactive' && c.leadType === 'cold').length;

  const filterOptions: { value: FilterOption; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: clients.length },
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'low-sessions', label: 'Low Sessions', count: lowSessionCount },
    { value: 'leads', label: 'Leads', count: leadCount },
    { value: 'warm-leads', label: 'Warm (archived, had bookings)', count: warmLeadCount },
    { value: 'cold-leads', label: 'Cold (archived, no bookings)', count: coldLeadCount },
  ];

  return (
    <div className="min-h-screen pb-above-nav">
      <Header
        title="Client Roster"
        subtitle={`${filteredClients.length} clients`}
        showBack
        onBack={onBack}
        rightAction={
          <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddClient(true)}>
            Add Client
          </GlassButton>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <GlassInput
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="relative">
            <motion.button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn(
                'h-full px-4 rounded-2xl glass-button flex items-center gap-2 transition-colors',
                showFilterMenu && 'bg-white/80'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              <ChevronDown className={cn('w-4 h-4 transition-transform', showFilterMenu && 'rotate-180')} />
            </motion.button>
            
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl p-2 z-30 shadow-xl max-h-64 overflow-y-auto"
                >
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterBy(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors',
                        filterBy === option.value 
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                          : 'hover:bg-white/50'
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{option.count}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'name' as SortOption, label: 'A-Z' },
            { value: 'sessions' as SortOption, label: 'Sessions' },
            { value: 'recent' as SortOption, label: 'Recent' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                sortBy === option.value
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Client Cards */}
        <motion.div 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <motion.div
                key={`${client.id}-${refreshKey}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ClientCard
                  client={client}
                  trainerId={trainerId}
                  onViewProfile={() => onViewClient(client.id)}
                  onScheduleSession={() => setShowScheduleModal(client.id)}
                  onQuickNote={() => setShowQuickNote(client.id)}
                  onCheckIn={() => {
                    if (useClientSession(client.id)) setRefreshKey((k) => k + 1);
                  }}
                  onSendNotification={() => setShowNotification(client.id)}
                  onSetInactive={() => {
                    setClientStatus(client.id, client.status === 'inactive' ? 'active' : 'inactive');
                    setDropdownClientId(null);
                    setRefreshKey((k) => k + 1);
                  }}
                  onSendStar={() => {
                    addClientStar(client.id, trainerId);
                    setDropdownClientId(null);
                    setRefreshKey((k) => k + 1);
                    toast.success(`Star sent to ${client.name}!`, { description: 'They\'ll see a notice in their app.' });
                  }}
                  onResetPasscode={() => {
                    updateClientAccessCode(client.id);
                    setDropdownClientId(null);
                    setRefreshKey((k) => k + 1);
                  }}
                  dropdownOpen={dropdownClientId === client.id}
                  onDropdownToggle={() => setDropdownClientId((id) => (id === client.id ? null : client.id))}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredClients.length === 0 && (
            <GlassCard className="p-8 text-center">
              <User className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">No clients found</p>
              <p className="text-sm text-[var(--muted-foreground)]/70 mt-1">
                Try adjusting your search or filters
              </p>
            </GlassCard>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddClient && (
          <AddClientModal
            onClose={() => setShowAddClient(false)}
            onSuccess={() => setShowAddClient(false)}
            trainerId={trainerId}
            trainerName={currentUser.name}
          />
        )}
        {showScheduleModal && (
          <ScheduleSessionModal
            onClose={() => setShowScheduleModal(null)}
            onSuccess={() => setShowScheduleModal(null)}
            trainerId={trainerId}
            preselectedClientId={showScheduleModal}
          />
        )}
        {showQuickNote && (
          <QuickNoteModal
            onClose={() => setShowQuickNote(null)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
            clientId={showQuickNote}
            clientName={clients.find((c) => c.id === showQuickNote)?.name ?? ''}
            trainerId={trainerId}
          />
        )}
        {showNotification && (
          <SendNotificationModal
            onClose={() => setShowNotification(null)}
            clientName={clients.find((c) => c.id === showNotification)?.name ?? ''}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ClientCardProps {
  client: Client;
  trainerId: string;
  onViewProfile: () => void;
  onScheduleSession: () => void;
  onQuickNote: () => void;
  onCheckIn: () => void;
  onSendNotification: () => void;
  onSendStar: () => void;
  onSetInactive: () => void;
  onResetPasscode: () => void;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
}

function ClientCard({
  client,
  onViewProfile,
  onScheduleSession,
  onQuickNote,
  onCheckIn,
  onSendNotification,
  onSendStar,
  onSetInactive,
  onResetPasscode,
  dropdownOpen,
  onDropdownToggle,
}: ClientCardProps) {
  const sessionProgress = client.totalSessions > 0 ? (client.sessionsRemaining / client.totalSessions) * 100 : 0;
  const isLowSessions = client.sessionsRemaining <= 3;

  return (
    <GlassCard hover className="overflow-hidden cursor-pointer" onClick={onViewProfile}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-3 flex-1"
            onClick={onViewProfile}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/50">
                {client.avatar ? (
                  <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg font-semibold">
                    {client.name.charAt(0)}
                  </div>
                )}
              </div>
              {client.status === 'active' && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">{client.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Age {client.age} • {client.trainerName}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-0.5">
            <button
              type="button"
              className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors text-[var(--primary)]"
              onClick={(e) => {
                e.stopPropagation();
                onSendStar();
              }}
              title="Send star"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDropdownToggle();
              }}
            >
              <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDropdownToggle();
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-56 glass-strong rounded-2xl p-2 z-50 shadow-xl max-h-[min(70vh,400px)] overflow-y-auto overscroll-contain"
                  >
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleSession();
                        onDropdownToggle();
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule a session
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendNotification();
                        onDropdownToggle();
                      }}
                    >
                      <Bell className="w-4 h-4" />
                      Send notification
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendStar();
                        onDropdownToggle();
                      }}
                    >
                      <Star className="w-4 h-4" />
                      Send star
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetInactive();
                      }}
                    >
                      <UserX className="w-4 h-4" />
                      {client.status === 'inactive' ? 'Make active again' : 'Make client inactive temporarily'}
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResetPasscode();
                      }}
                    >
                      <Key className="w-4 h-4" />
                      Reset client passcode
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--muted-foreground)]">Sessions</span>
              <span className={cn(
                'text-xs font-medium',
                isLowSessions ? 'text-amber-600' : 'text-[var(--primary)]'
              )}>
                {client.sessionsRemaining}/{client.totalSessions}
              </span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sessionProgress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  'h-full rounded-full',
                  isLowSessions ? 'bg-amber-500' : 'bg-[var(--primary)]'
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {client.lastAssessment && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <FileText className="w-3.5 h-3.5" />
              <span>Assessed {new Date(client.lastAssessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {client.lastProgram && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Program updated</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <GlassButton size="sm" variant="primary" fullWidth onClick={(e) => { e.stopPropagation(); onViewProfile(); }}>
            View Profile
          </GlassButton>
          <GlassButton size="sm" fullWidth onClick={(e) => { e.stopPropagation(); onQuickNote(); }}>
            Quick Note
          </GlassButton>
          {client.sessionsRemaining > 0 && (
            <GlassButton
              size="sm"
              variant={isLowSessions ? 'primary' : 'secondary'}
              className={cn(isLowSessions && 'bg-green-500 hover:bg-green-600')}
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn();
              }}
              title="Mark session used today"
            >
              <CheckCircle className="w-4 h-4" />
            </GlassButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
