import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageSquare, User, Home, CreditCard, Dumbbell, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'dashboard' | 'clients' | 'schedule' | 'messages' | 'profile' | 'memberships' | 'bookings' | 'progress' | 'exercises' | 'inspiration';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  role: 'trainer' | 'client';
}

const trainerTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  { id: 'messages', label: 'Notes', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
];

const clientTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'schedule', label: 'Bookings', icon: Calendar },
  { id: 'inspiration', label: 'Inspire', icon: LayoutGrid },
  { id: 'memberships', label: 'Memberships', icon: CreditCard },
  { id: 'messages', label: 'Progress', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange, role }: BottomNavProps) {
  const tabs = role === 'trainer' ? trainerTabs : clientTabs;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
    >
      <div className="glass-nav rounded-t-3xl mx-auto max-w-md border-t border-white/40 py-2 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors min-h-[44px] justify-center',
                  isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                )}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--primary)]/8 rounded-xl -z-0"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon className={cn('w-5 h-5 relative z-10', isActive ? 'stroke-[2px]' : 'stroke-[1.5px]')} />
                <span className={cn('text-[10px] relative z-10', isActive ? 'font-semibold' : 'font-medium')}>
                  {tab.label}
                </span>
                {isActive && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[var(--primary)]" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
