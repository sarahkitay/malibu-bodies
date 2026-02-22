import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'default' | 'sage' | 'blush' | 'ocean' | 'lavender' | 'peach' | 'mint' | 'ruby' | 'twilight';
export type CardStyle = 'glass' | 'gradient';

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  isDark: boolean;
  setDark: (dark: boolean) => void;
  toggleDark: () => void;
  cardStyle: CardStyle;
  setCardStyle: (style: CardStyle) => void;
  themePickerOpen: boolean;
  openThemePicker: () => void;
  closeThemePicker: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColors: Record<ThemeColor, { name: string; gradient: string; description: string }> = {
  default: { 
    name: 'Warm Sand', 
    gradient: 'from-[#c4a77d] to-[#e8ddd0]',
    description: 'Cozy and inviting'
  },
  sage: { 
    name: 'Soft Sage', 
    gradient: 'from-[#8fa895] to-[#d4e0d6]',
    description: 'Calm and natural'
  },
  blush: { 
    name: 'Gentle Blush', 
    gradient: 'from-[#d4a5a5] to-[#f0e0e0]',
    description: 'Soft and romantic'
  },
  ocean: { 
    name: 'Ocean Mist', 
    gradient: 'from-[#7a9eb8] to-[#d4e3ed]',
    description: 'Fresh and serene'
  },
  lavender: { 
    name: 'Dreamy Lavender', 
    gradient: 'from-[#b8a9c9] to-[#e8e0f0]',
    description: 'Peaceful and dreamy'
  },
  peach: { 
    name: 'Sunset Peach', 
    gradient: 'from-[#e8b89d] to-[#f5e0d5]',
    description: 'Warm and energizing'
  },
  mint: {
    name: 'Sea Mint',
    gradient: 'from-[#7fcfbe] to-[#d8f3ec]',
    description: 'Clean and airy'
  },
  ruby: {
    name: 'Soft Ruby',
    gradient: 'from-[#c77a8d] to-[#f1d3db]',
    description: 'Elegant and bold'
  },
  twilight: {
    name: 'Twilight Blue',
    gradient: 'from-[#6d82b8] to-[#d6def2]',
    description: 'Cool and modern'
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>('blush');
  const [isDark, setIsDark] = useState(false);
  const [cardStyle, setCardStyleState] = useState<CardStyle>('gradient');
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('malibu-theme') as ThemeColor;
    const savedDark = localStorage.getItem('malibu-dark') === 'true';
    const savedCardStyle = localStorage.getItem('malibu-card-style') as CardStyle;
    if (savedTheme && themeColors[savedTheme]) setThemeState(savedTheme);
    setIsDark(savedDark);
    if (savedCardStyle === 'glass' || savedCardStyle === 'gradient') setCardStyleState(savedCardStyle);
    else setCardStyleState('gradient');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-card-style', cardStyle);
    document.documentElement.setAttribute('data-bg-style', cardStyle === 'gradient' ? 'gradient' : '');
  }, [theme, isDark, cardStyle]);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem('malibu-theme', newTheme);
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('malibu-dark', String(newDark));
  };

  const setDark = (dark: boolean) => {
    setIsDark(dark);
    localStorage.setItem('malibu-dark', String(dark));
  };

  const setCardStyle = (style: CardStyle) => {
    setCardStyleState(style);
    localStorage.setItem('malibu-card-style', style);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, isDark, setDark, toggleDark, cardStyle, setCardStyle,
      themePickerOpen, openThemePicker: () => setThemePickerOpen(true), closeThemePicker: () => setThemePickerOpen(false) 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { themeColors };
