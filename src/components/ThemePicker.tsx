import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check, Moon, Sun } from 'lucide-react';
import { useTheme, themeColors, type ThemeColor } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ThemePicker() {
  const { theme, setTheme, isDark, setDark, cardStyle, setCardStyle, themePickerOpen, openThemePicker, closeThemePicker } = useTheme();
  const isMobile = useIsMobile();

  return (
    <>
      <motion.button
        onClick={openThemePicker}
        className={cn(
          "fixed z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full glass-strong flex items-center justify-center text-[var(--primary)] shadow-lg hover:shadow-xl transition-shadow",
          isMobile ? "top-4 right-4" : "bottom-6 right-6"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <Palette className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {themePickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={closeThemePicker}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: isMobile ? -10 : 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: isMobile ? -10 : 20 }}
              className={cn(
                "fixed z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[min(78vh,640px)] overflow-y-auto overscroll-contain glass-strong rounded-3xl p-6 shadow-2xl",
                isMobile ? "top-20 right-4" : "bottom-24 right-6"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Customize Theme
                </h3>
                <button
                  onClick={closeThemePicker}
                  className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Style Toggle */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--foreground)]/70 mb-3 block">
                  Card Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCardStyle('glass')}
                    className={cn(
                      'flex-1 py-3 rounded-2xl transition-all text-sm font-medium',
                      cardStyle === 'glass' 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70 text-[var(--foreground)]'
                    )}
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => setCardStyle('gradient')}
                    className={cn(
                      'flex-1 py-3 rounded-2xl transition-all text-sm font-medium',
                      cardStyle === 'gradient' 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70 text-[var(--foreground)]'
                    )}
                  >
                    Immersive
                  </button>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--foreground)]/70 mb-3 block">
                  Appearance
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDark(false)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all',
                      !isDark 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70'
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setDark(true)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all',
                      isDark 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70'
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>

              {/* Color Themes */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]/70 mb-3 block">
                  Color Theme
                </label>
                <div className="space-y-2">
                  {(Object.keys(themeColors) as ThemeColor[]).map((colorKey) => {
                    const colorInfo = themeColors[colorKey];
                    const isActive = theme === colorKey;
                    
                    return (
                      <motion.button
                        key={colorKey}
                        onClick={() => setTheme(colorKey)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-2xl transition-all',
                          isActive 
                            ? 'bg-white/80 shadow-md ring-2 ring-[var(--primary)]/30' 
                            : 'bg-white/40 hover:bg-white/60'
                        )}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl bg-gradient-to-br shadow-inner',
                          colorInfo.gradient
                        )} />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[var(--foreground)] text-sm">
                            {colorInfo.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {colorInfo.description}
                          </p>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
