import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGreetingText, getFirstName } from '@/lib/greeting';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  onNotificationClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  onNotificationClick,
  notificationCount = 0,
  className,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'sticky top-0 z-40 px-4 py-4 glass-strong',
        className
      )}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-[var(--foreground)] font-serif">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {rightAction ? (
          rightAction
        ) : (
          <div className="flex items-center gap-2">
            <motion.button
              className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors relative"
              whileTap={{ scale: 0.9 }}
              onClick={onNotificationClick}
            >
              <Bell className="w-5 h-5" />
              {notificationCount !== undefined && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-semibold rounded-md flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
}

interface WelcomeHeaderProps {
  name: string;
  role: string;
  avatar?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function WelcomeHeader({ name, role, avatar, notificationCount = 0, onNotificationClick }: WelcomeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/50 shadow-lg">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xl font-semibold">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-md border-2 border-white" />
          </motion.div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">{getGreetingText()},</p>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] font-serif">
              {getFirstName(name)}
            </h1>
            <p className="text-xs text-[var(--primary)] font-medium">{role}</p>
          </div>
        </div>
        
        <motion.button
          className="w-12 h-12 rounded-xl glass-button flex items-center justify-center relative"
          whileTap={{ scale: 0.9 }}
          onClick={onNotificationClick}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-semibold rounded-full flex items-center justify-center"
            >
              {notificationCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
