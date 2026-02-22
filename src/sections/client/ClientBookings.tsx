import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, MapPin, Video, X } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { Header } from '@/components/Header';
import { getClientById, getClientBookings, addBooking, updateBookingStatus, acceptBookingSuggestion, requestClientReschedule, isBookingWithin24Hours } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { parseLocalDate } from '@/lib/dateUtils';

interface ClientBookingsProps {
  clientId: string;
  onBack: () => void;
}

export function ClientBookings({ clientId, onBack }: ClientBookingsProps) {
  const [, setRefreshKey] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<Date | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<{ id: string } | null>(null);

  const client = getClientById(clientId);
  const clientBookings = getClientBookings(clientId);
  if (!client) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getBookingsForDate = (date: Date) => {
    return clientBookings.filter(b => {
      const bookingDate = parseLocalDate(b.date);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const upcomingBookings = clientBookings.filter(b => parseLocalDate(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && b.status !== 'cancelled' && b.status !== 'completed');

  return (
    <div className="min-h-screen pb-above-nav">
      <Header
        title="My Bookings"
        subtitle="Request a session"
        showBack
        onBack={onBack}
        rightAction={
          <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setPreselectedDate(selectedDate); setShowBookingModal(true); }}>
            Book
          </GlassButton>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Calendar */}
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <motion.button
                onClick={() => navigateMonth('prev')}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[var(--foreground)]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <motion.button
                onClick={() => navigateMonth('next')}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)] py-2">
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
                const hasBookings = dayBookings.length > 0;

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'aspect-square rounded-full flex flex-col items-center justify-center relative transition-all',
                      isSelected && 'shadow-[inset_0_0_0_2px_var(--primary)]',
                      isToday && !isSelected && 'bg-[var(--primary)] text-white',
                      !isToday && !isSelected && 'hover:bg-white/50'
                    )}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isToday && !isSelected ? 'text-white' : 'text-[var(--foreground)]'
                    )}>
                      {day}
                    </span>
                    {hasBookings && (
                      <span 
                        className={cn(
                          'absolute bottom-1 w-[5px] h-[5px] rounded-full bg-[var(--primary)]',
                          (isToday && !isSelected) && 'bg-white'
                        )} 
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Selected Date */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex flex-col items-center justify-center text-white">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-semibold">{booking.time}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--foreground)]">
                              Session with {client.trainerName}
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {booking.duration} minutes
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {booking.type === 'virtual' ? (
                                <Video className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              )}
                              <span className="text-xs text-[var(--muted-foreground)]">{booking.type}</span>
                            </div>
                          </div>
                          <GlassBadge 
                            variant={booking.status === 'confirmed' ? 'success' : booking.status === 'suggested' ? 'default' : 'warning'}
                          >
                            {booking.status.replace(/_/g, ' ')}
                          </GlassBadge>
                        </div>
                        {booking.status === 'suggested' && booking.suggestedDate && booking.suggestedTime && (
                          <div className="mt-3 p-3 rounded-xl bg-[var(--primary)]/10">
                            <p className="text-sm font-medium text-[var(--foreground)]">Bella suggested:</p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {parseLocalDate(booking.suggestedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {booking.suggestedTime}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <GlassButton size="sm" variant="primary" onClick={() => acceptBookingSuggestion(booking.id)}>
                                Accept
                              </GlassButton>
                              <GlassButton size="sm" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                                Decline
                              </GlassButton>
                            </div>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <div className="mt-4 flex gap-2">
                            <GlassButton size="sm" variant="primary" fullWidth>
                              Join
                            </GlassButton>
                            <GlassButton size="sm" fullWidth onClick={() => setRescheduleFor({ id: booking.id })}>
                              Reschedule
                            </GlassButton>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : (
                <GlassCard className="p-6 text-center">
                  <p className="text-[var(--muted-foreground)] mb-4">No sessions on this day</p>
                  <GlassButton 
                    variant="primary" 
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => { setPreselectedDate(selectedDate); setShowBookingModal(true); }}
                  >
                    Book Session
                  </GlassButton>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Upcoming Sessions</h3>
          <div className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking, index) => {
                const within24h = isBookingWithin24Hours(booking);
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard hover className="overflow-hidden cursor-pointer">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-[var(--primary)]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--foreground)]">
                              {parseLocalDate(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {booking.time} • {booking.duration} min
                            </p>
                          </div>
                          <GlassBadge variant="success">{booking.status.replace(/_/g, ' ')}</GlassBadge>
                        </div>
                        {(booking.status === 'confirmed' || booking.status === 'reschedule_requested') && (
                          <div className="mt-4 space-y-2">
                            <GlassButton 
                              size="sm" 
                              variant="primary" 
                              fullWidth 
                              onClick={(e) => { e.stopPropagation(); window.open('facetime:8184042932', '_blank'); }}
                            >
                              Join
                            </GlassButton>
                            <div className="flex gap-2">
                              <GlassButton size="sm" fullWidth onClick={(e) => { e.stopPropagation(); setRescheduleFor({ id: booking.id }); }}>
                                Reschedule
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                fullWidth
                                variant="secondary"
                                onClick={(e) => { e.stopPropagation(); if (!within24h) { updateBookingStatus(booking.id, 'cancelled'); setRefreshKey(k => k + 1); } }}
                                disabled={within24h}
                                title={within24h ? 'Cannot cancel within 24 hours' : undefined}
                              >
                                Cancel
                              </GlassButton>
                            </div>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            ) : (
              <GlassCard className="p-6 text-center">
                <p className="text-[var(--muted-foreground)]">No upcoming sessions</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            clientId={clientId}
            preselectedDate={preselectedDate}
            onClose={() => { setShowBookingModal(false); setPreselectedDate(null); }}
            onSuccess={() => { setShowBookingModal(false); setPreselectedDate(null); }}
          />
        )}
        {rescheduleFor && (
          <ClientRescheduleModal
            bookingId={rescheduleFor.id}
            onClose={() => setRescheduleFor(null)}
            onSuccess={() => setRescheduleFor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClientRescheduleModal({ bookingId, onClose, onSuccess }: { bookingId: string; onClose: () => void; onSuccess: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleRequest = () => {
    if (date && time) {
      requestClientReschedule(bookingId, date, time);
      onSuccess();
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Request reschedule</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button key={t} onClick={() => setTime(t)} className={cn('px-4 py-2 rounded-xl text-sm', time === t ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}>{t}</button>
              ))}
            </div>
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleRequest} disabled={!date || !time}>Request reschedule</GlassButton>
        </div>
      </motion.div>
    </>
  );
}

function BookingModal({ clientId, preselectedDate, onClose, onSuccess }: { clientId: string; preselectedDate?: Date | null; onClose: () => void; onSuccess: () => void }) {
  const client = getClientById(clientId);
  const initialDate = preselectedDate
    ? `${preselectedDate.getFullYear()}-${String(preselectedDate.getMonth() + 1).padStart(2, '0')}-${String(preselectedDate.getDate()).padStart(2, '0')}`
    : '';
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'in-person' | 'virtual'>('in-person');

  const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !client) return;
    addBooking({
      clientId,
      trainerId: client.trainerId,
      date: selectedDate,
      time: selectedTime,
      duration: 60,
      type: sessionType,
      status: 'pending',
    });
    onSuccess();
  };

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
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl p-6 max-w-lg mx-auto max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Book a Session</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]/70 mb-2 block">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:ring-2 focus:ring-[var(--primary)]/30 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]/70 mb-2 block">Time</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                    selectedTime === time
                      ? 'bg-[var(--primary)] text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]/70 mb-2 block">Session Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionType('in-person')}
                className={cn(
                  'flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all',
                  sessionType === 'in-person'
                    ? 'bg-[var(--primary)] text-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              >
                <MapPin className="w-4 h-4" />
                <span>In-Person</span>
              </button>
              <button
                onClick={() => setSessionType('virtual')}
                className={cn(
                  'flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all',
                  sessionType === 'virtual'
                    ? 'bg-[var(--primary)] text-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              >
                <Video className="w-4 h-4" />
                <span>Virtual</span>
              </button>
            </div>
          </div>

          <GlassButton 
            variant="primary" 
            fullWidth 
            className="mt-6"
            disabled={!selectedDate || !selectedTime}
            onClick={handleConfirm}
          >
            Request Booking
          </GlassButton>
        </div>
      </motion.div>
    </>
  );
}
