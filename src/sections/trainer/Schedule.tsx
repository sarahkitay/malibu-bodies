import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CalendarDays, Clock, Plus, ChevronLeft, ChevronRight, Check, X, MessageSquare } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Header } from '@/components/Header';
import { ScheduleSessionModal } from '@/sections/trainer/ScheduleSessionModal';
import { bookings, clients, getTrainerClients, updateBookingStatus, suggestBookingAlternative, acceptClientRescheduleRequest, getBlockedDays, addBlockedDay } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDateForInput, parseLocalDate } from '@/lib/dateUtils';

interface ScheduleProps {
  onBack: () => void;
}

export function Schedule({ onBack }: ScheduleProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const [scheduleViewMode, setScheduleViewMode] = useState<'monthly' | 'daily'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPreselected, setAddModalPreselected] = useState<{ date: Date; time: string } | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestForBooking, setSuggestForBooking] = useState<{ id: string; clientName: string } | null>(null);

  const TIME_SLOTS = Array.from({ length: 29 }, (_, i) => {
    const hour = 6 + Math.floor(i / 2);
    const min = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  const trainerClients = getTrainerClients(trainerId);
  const trainerBookings = bookings.filter((b) => trainerClients.some((c) => c.id === b.clientId));
  const blocked = getBlockedDays(trainerId);

  const isDateBlocked = (date: Date) =>
    blocked.some((b) => parseLocalDate(b.date).toDateString() === date.toDateString());

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getBookingsForDate = (date: Date) => {
    return trainerBookings.filter((b) => {
      const bookingDate = parseLocalDate(b.date);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const selectedBookings = selectedDate
    ? trainerBookings.filter((b) => parseLocalDate(b.date).toDateString() === selectedDate.toDateString())
    : [];

  const getBookingAtSlot = (date: Date, time: string) => {
    const dateStr = formatDateForInput(date);
    return trainerBookings.find((b) => b.date === dateStr && b.time === time);
  };

  const openAddForSlot = (date: Date, time: string) => {
    setAddModalPreselected({ date, time });
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen pb-above-nav">
      <Header
        title="Schedule"
        subtitle="Manage your sessions"
        showBack
        onBack={onBack}
        rightAction={
          <div className="flex gap-2">
            <GlassButton size="sm" onClick={() => setShowBlockModal(true)}>
              Block day
            </GlassButton>
            <GlassButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setAddModalPreselected(null); setShowAddModal(true); }}>
              Add Session
            </GlassButton>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* View toggle: Daily / Monthly */}
        <div className="flex rounded-2xl bg-white/30 p-1 gap-1">
          <button
            type="button"
            onClick={() => setScheduleViewMode('daily')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
              scheduleViewMode === 'daily' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-white/50'
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Daily
          </button>
          <button
            type="button"
            onClick={() => setScheduleViewMode('monthly')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
              scheduleViewMode === 'monthly' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-white/50'
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Monthly
          </button>
        </div>

        {scheduleViewMode === 'daily' ? (
          /* Daily view: date + time slots */
          <>
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <motion.button
                    onClick={() => {
                      const d = new Date(selectedDate || currentDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d);
                      setCurrentDate(d);
                    }}
                    className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {(selectedDate || currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </h2>
                  <motion.button
                    onClick={() => {
                      const d = new Date(selectedDate || currentDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d);
                      setCurrentDate(d);
                    }}
                    className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>

            <div className="space-y-2">
              {TIME_SLOTS.map((slotTime) => {
                const date = selectedDate || currentDate;
                const booking = getBookingAtSlot(date, slotTime);
                const isBlocked = isDateBlocked(date);
                return (
                  <motion.button
                    key={slotTime}
                    type="button"
                    onClick={() => {
                      if (isBlocked) return;
                      if (booking) return;
                      openAddForSlot(date, slotTime);
                    }}
                    disabled={isBlocked}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all border',
                      isBlocked && 'opacity-50 cursor-not-allowed border-amber-500/40 bg-amber-500/10 grayscale-[0.2]',
                      !booking && !isBlocked && 'border-transparent hover:bg-white/60 hover:shadow-md',
                      booking && 'border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/10 to-transparent shadow-sm'
                    )}
                    whileTap={!isBlocked ? { scale: 0.99 } : undefined}
                  >
                    <div className="w-14 flex-shrink-0 text-sm font-semibold text-[var(--foreground)] tabular-nums">
                      {slotTime}
                    </div>
                    <div className="flex-1 min-w-0">
                      {booking ? (
                        <>
                          <p className="font-medium text-[var(--foreground)] truncate">
                            {clients.find((c) => c.id === booking.clientId)?.name}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {booking.duration} min • {booking.type}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {isBlocked ? 'Blocked' : 'Tap to add session'}
                        </span>
                      )}
                    </div>
                    {booking && (
                      <span className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0',
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      )}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
        {/* Calendar */}
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <motion.button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <motion.button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-[var(--muted-foreground)] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map((day) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();
                const dayBookings = getBookingsForDate(date);
                const bookingCount = dayBookings.length;
                const dotCount = Math.min(bookingCount, 3);
                const isBlocked = isDateBlocked(date);

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all',
                      isBlocked && 'bg-amber-500/20 line-through opacity-60',
                      isSelected 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : isToday
                          ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                          : 'hover:bg-white/50'
                    )}
                    whileTap={{ scale: 0.9 }}
                    title={bookingCount > 0 ? `${bookingCount} session${bookingCount > 1 ? 's' : ''}` : isBlocked ? 'Blocked' : undefined}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-white' : 'text-[var(--foreground)]'
                    )}>
                      {day}
                    </span>
                    {bookingCount > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5 items-center justify-center">
                        {Array.from({ length: dotCount }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              'rounded-full',
                              dotCount === 1 ? 'w-1.5 h-1.5' : 'w-1 h-1',
                              isSelected ? 'bg-white' : 'bg-[var(--primary)]'
                            )}
                          />
                        ))}
                        {bookingCount > 3 && (
                          <span className={cn(
                            'text-[8px] font-bold ml-0.5',
                            isSelected ? 'text-white' : 'text-[var(--primary)]'
                          )}>+</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Agenda - selected date */}
        <div key={refreshKey}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
            </h3>
            <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Add Session
            </GlassButton>
          </div>

          <div className="space-y-2">
            {selectedBookings.length > 0 ? (
              [...selectedBookings]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((booking) => {
                const client = clients.find(c => c.id === booking.clientId);
                return (
                  <GlassCard key={booking.id} hover className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white">
                          {booking.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--foreground)]">{client?.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {booking.duration} min • {booking.type}
                          </p>
                          {booking.status === 'suggested' && booking.suggestedDate && booking.suggestedTime && (
                            <p className="text-xs text-[var(--primary)] mt-1">
                              Suggested: {parseLocalDate(booking.suggestedDate).toLocaleDateString()} at {booking.suggestedTime}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          'px-3 py-1 rounded-xl text-xs font-medium',
                          booking.status === 'confirmed' 
                            ? 'bg-green-500/15 text-green-600' 
                            :                           booking.status === 'suggested'
                              ? 'bg-blue-500/15 text-blue-600'
                              : booking.status === 'reschedule_requested'
                                ? 'bg-blue-500/15 text-blue-600'
                                : 'bg-amber-500/15 text-amber-600'
                        )}>
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <GlassButton size="sm" variant="primary" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => { updateBookingStatus(booking.id, 'confirmed'); setRefreshKey((k) => k + 1); }}>
                            Confirm
                          </GlassButton>
                          <GlassButton size="sm" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => { updateBookingStatus(booking.id, 'cancelled'); setRefreshKey((k) => k + 1); }}>
                            Deny
                          </GlassButton>
                          <GlassButton size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => setSuggestForBooking({ id: booking.id, clientName: client?.name || '' })}>
                            Suggest
                          </GlassButton>
                        </div>
                      )}
                      {booking.status === 'reschedule_requested' && booking.suggestedDate && booking.suggestedTime && (
                        <div className="mt-4 p-3 rounded-xl bg-blue-500/10">
                          <p className="text-sm font-medium text-[var(--foreground)]">Client requested reschedule:</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {parseLocalDate(booking.suggestedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {booking.suggestedTime}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <GlassButton size="sm" variant="primary" onClick={() => { acceptClientRescheduleRequest(booking.id); setRefreshKey((k) => k + 1); }}>
                              Accept
                            </GlassButton>
                            <GlassButton size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => setSuggestForBooking({ id: booking.id, clientName: client?.name || '' })}>
                              Suggest different time
                            </GlassButton>
                            <GlassButton size="sm" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => { updateBookingStatus(booking.id, 'cancelled'); setRefreshKey((k) => k + 1); }}>
                              Cancel
                            </GlassButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted-foreground)]">
                  No sessions scheduled for this day
                </p>
                <GlassButton variant="primary" className="mt-4" onClick={() => setShowAddModal(true)}>
                  Schedule Session
                </GlassButton>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Upcoming agenda */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Upcoming sessions</h3>
          <div className="space-y-3">
            {trainerBookings
              .filter(b => parseLocalDate(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
              .slice(0, 3)
              .map((booking) => {
                const client = clients.find(c => c.id === booking.clientId);
                return (
                  <GlassCard key={booking.id} hover className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--foreground)]">{client?.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {parseLocalDate(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {booking.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
          </div>
        </div>
        </>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <ScheduleSessionModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setRefreshKey((k) => k + 1);
              setAddModalPreselected(null);
            }}
            trainerId={trainerId}
            preselectedDate={addModalPreselected?.date || selectedDate || undefined}
            preselectedTime={addModalPreselected?.time}
          />
        )}
        {showBlockModal && (
          <BlockDayModal
            date={selectedDate || new Date()}
            onClose={() => setShowBlockModal(false)}
            onSave={() => {
              setShowBlockModal(false);
              setRefreshKey((k) => k + 1);
            }}
            trainerId={trainerId}
          />
        )}
        {suggestForBooking && (
          <SuggestTimeModal
            bookingId={suggestForBooking.id}
            clientName={suggestForBooking.clientName}
            onClose={() => setSuggestForBooking(null)}
            onSuccess={() => { setSuggestForBooking(null); setRefreshKey((k) => k + 1); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BlockDayModal({ date, onClose, onSave, trainerId }: { date: Date; onClose: () => void; onSave: () => void; trainerId: string }) {
  const [blockDate, setBlockDate] = useState(formatDateForInput(date));
  const [reason, setReason] = useState('');

  const handleBlock = () => {
    addBlockedDay({ trainerId, date: blockDate, reason: reason.trim() || undefined });
    onSave();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Block day</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Date</label>
            <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Reason (optional)</label>
            <input type="text" placeholder="e.g., Vacation, Personal day" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleBlock}>Block day</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function SuggestTimeModal({ bookingId, clientName, onClose, onSuccess }: { bookingId: string; clientName: string; onClose: () => void; onSuccess: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleSubmit = () => {
    if (date && time) {
      suggestBookingAlternative(bookingId, date, time);
      onSuccess();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Suggest Time for {clientName}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Time</label>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button key={t} onClick={() => setTime(t)} className={cn('px-4 py-2 rounded-xl text-sm', time === t ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleSubmit} disabled={!date || !time}>
            Send Suggestion
          </GlassButton>
        </div>
      </motion.div>
    </>
  );
}
