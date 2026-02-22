import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Palette, Type, Smile, Heart, Star, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTextArea } from '@/components/glass/GlassInput';
import { PRESET_AFFIRMATIONS, setAffirmationOfTheDay, addAffirmation } from '@/data/mockData';
import type { AffirmationGraphic } from '@/types';
import { cn } from '@/lib/utils';

const AFFIRMATION_BUBBLE_COLORS = [
  '#F6A5C0', /* refined pink - rendered with subtle gradient when displayed */ '#FFC0CB', '#FF69B4', '#FF1493', '#DB7093',
  '#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB',
  '#87CEEB', '#ADD8E6', '#B0E0E6', '#98FB98', '#90EE90',
  '#F0E68C', '#FFD700', '#FFA500', '#FFDAB9', '#FFE4B5',
];

const TEXT_COLORS = [
  '#1f2937', '#374151', '#4b5563', '#6b7280', '#111827',
  '#ffffff', '#7c2d12', '#1e3a5f', '#14532d', '#581c87', '#831843',
  '#b91c1c', '#0369a1', '#15803d',
];

const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default' },
  { value: "'Playfair Display', serif", label: 'Playfair (elegant)' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Cormorant Garamond', serif", label: 'Cormorant' },
  { value: "'Caveat', cursive", label: 'Caveat (handwritten)' },
  { value: "'Dancing Script', cursive", label: 'Dancing Script' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Quicksand', sans-serif", label: 'Quicksand' },
];

const GRAPHIC_OPTIONS: { value: AffirmationGraphic; icon: React.ReactNode }[] = [
  { value: 'none', icon: <X className="w-4 h-4" /> },
  { value: 'smiley', icon: <Smile className="w-4 h-4" /> },
  { value: 'heart', icon: <Heart className="w-4 h-4" /> },
  { value: 'star', icon: <Star className="w-4 h-4" /> },
  { value: 'sparkle', icon: <Sparkles className="w-4 h-4" /> },
];

interface AddAffirmationModalProps {
  onClose: () => void;
  clientId: string;
  clientName: string;
  onSent?: () => void;
}

export function AddAffirmationModal({
  onClose,
  clientId,
  clientName,
  onSent,
}: AddAffirmationModalProps) {
  const [customText, setCustomText] = useState('');
  const [selectedBubbleColor, setSelectedBubbleColor] = useState('#F6A5C0');
  const [selectedTextColor, setSelectedTextColor] = useState('#374151');
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedGraphic, setSelectedGraphic] = useState<AffirmationGraphic>('heart');
  const [usePreset, setUsePreset] = useState<string | null>(null);

  const content = usePreset ?? customText.trim();
  const canSend = content.length > 0;

  const handleSendToDashboard = () => {
    if (!content) return;
    addAffirmation({
      clientId,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      color: selectedBubbleColor,
      textColor: selectedTextColor,
      fontFamily: selectedFont || undefined,
      graphic: selectedGraphic === 'none' ? undefined : selectedGraphic,
    });
    setAffirmationOfTheDay(clientId, content, selectedBubbleColor, {
      textColor: selectedTextColor,
      fontFamily: selectedFont || undefined,
      graphic: selectedGraphic === 'none' ? undefined : selectedGraphic,
    });
    onSent?.();
    onClose();
  };

  const GraphicIcon = selectedGraphic === 'none' ? null : GRAPHIC_OPTIONS.find(g => g.value === selectedGraphic)?.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-3xl max-h-[calc(100vh-6rem)] overflow-y-auto max-w-lg mx-auto"
      >
        <div className="sticky top-0 glass-strong rounded-t-3xl px-4 py-4 flex items-center justify-between border-b border-[var(--border)] z-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Affirmation for {clientName}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Bubble color
            </h3>
            <div className="flex flex-wrap gap-2">
              {AFFIRMATION_BUBBLE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedBubbleColor(color)}
                  className="w-8 h-8 rounded-lg border-2 transition-all ring-1 ring-black/5"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedBubbleColor === color ? 'var(--primary)' : 'transparent',
                    boxShadow: selectedBubbleColor === color ? '0 0 0 2px var(--primary)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text color
            </h3>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedTextColor(color)}
                  className="w-8 h-8 rounded-lg border-2 transition-all ring-1 ring-black/5"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedTextColor === color ? 'var(--primary)' : 'transparent',
                    boxShadow: selectedTextColor === color ? '0 0 0 2px var(--primary)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Font</h3>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-[var(--foreground)] border border-[var(--border)]"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value || 'default'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Add a graphic (optional)</h3>
            <div className="flex flex-wrap gap-2">
              {GRAPHIC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedGraphic(opt.value)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                    selectedGraphic === opt.value ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)]/50' : 'bg-white/50 hover:bg-white/70'
                  )}
                  title={opt.value === 'none' ? 'None' : opt.value}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Preset affirmations</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {PRESET_AFFIRMATIONS.map((text) => (
                <button
                  key={text}
                  onClick={() => {
                    setUsePreset(usePreset === text ? null : text);
                    setCustomText('');
                  }}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                    usePreset === text ? 'bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]/50' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  &ldquo;{text}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Add custom affirmation</h3>
            <GlassTextArea
              placeholder="Type your own affirmation..."
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setUsePreset(null);
              }}
              rows={2}
              className="bg-white/50"
            />
          </div>

          {content && (
            <div
              className="p-4 rounded-2xl text-center"
              style={{
                background: selectedBubbleColor === '#F6A5C0' ? 'linear-gradient(180deg, #F6A5C0 0%, #E890AB 100%)' : selectedBubbleColor,
                color: selectedTextColor,
                fontFamily: selectedFont || undefined,
              }}
            >
              {GraphicIcon && (
                <span className="flex justify-center mb-2 [&>svg]:w-6 [&>svg]:h-6" style={{ color: selectedTextColor }}>{GraphicIcon}</span>
              )}
              <p className="italic font-medium">&ldquo;{content}&rdquo;</p>
              <p className="text-xs mt-2 opacity-80">Preview as client will see it</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <GlassButton fullWidth onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              fullWidth
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSendToDashboard}
              disabled={!canSend}
            >
              Send to Client Dashboard
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </>
  );
}
