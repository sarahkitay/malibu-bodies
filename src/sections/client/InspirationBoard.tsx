import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Type, Download, Smartphone, X, Palette, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import html2canvas from 'html2canvas';

interface InspirationBoardProps {
  clientId: string;
  onBack: () => void;
}

type BoardItemType = 'image' | 'text';

interface BoardItem {
  id: string;
  type: BoardItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  /** Border radius in px; default 8 */
  borderRadius?: number;
}

const FONTS = ['Plus Jakarta Sans', 'Dancing Script', 'Georgia', 'Playfair Display', 'Arial', 'Helvetica'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56];
const BORDER_RADIUS_OPTIONS = [0, 4, 8, 12, 16, 24, 32, 48];
const TEXT_COLORS = ['#2d2a26', '#000000', '#8fa895', '#d4a5a5', '#7a9eb8', '#b8a9c9', '#e8b89d', '#ffffff', '#f5f5f5', '#e0e0e0'];

const STORAGE_KEY = (cid: string) => `malibu-moodboard-${cid}`;
const BG_STORAGE_KEY = (cid: string) => `malibu-moodboard-bg-${cid}`;

function loadBoard(clientId: string): BoardItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY(clientId));
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveBoard(clientId: string, items: BoardItem[]) {
  localStorage.setItem(STORAGE_KEY(clientId), JSON.stringify(items));
}

function loadBgColor(clientId: string): string {
  try {
    return localStorage.getItem(BG_STORAGE_KEY(clientId)) ?? '#faf8f5';
  } catch {
    return '#faf8f5';
  }
}

export function InspirationBoard({ clientId, onBack }: InspirationBoardProps) {
  const { isDark } = useTheme();
  const [items, setItems] = useState<BoardItem[]>(() => loadBoard(clientId));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageEditPanelOpen, setImageEditPanelOpen] = useState(false);
  const [showHomeScreenHint, setShowHomeScreenHint] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(() => loadBgColor(clientId));
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(BG_STORAGE_KEY(clientId), backgroundColor);
  }, [clientId, backgroundColor]);

  const persist = useCallback((next: BoardItem[]) => {
    setItems(next);
    saveBoard(clientId, next);
  }, [clientId]);

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newItem: BoardItem = {
        id: `img-${Date.now()}`,
        type: 'image',
        x: 20,
        y: 20 + items.length * 30,
        width: 120,
        height: 120,
        imageUrl: url,
      };
      persist([...items, newItem]);
    }
    e.target.value = '';
  };

  const addText = () => {
    const isDarkBg = ['#2d2a26', '#1a1816'].includes(backgroundColor) || isDark;
    const newItem: BoardItem = {
      id: `txt-${Date.now()}`,
      type: 'text',
      x: 20,
      y: 20 + items.length * 30,
      width: 140,
      height: 40,
      text: 'Add your text',
      textColor: isDarkBg ? '#ffffff' : '#2d2a26',
      fontSize: 16,
      fontFamily: 'Plus Jakarta Sans',
    };
    persist([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<BoardItem>) => {
    persist(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const removeItem = (id: string) => {
    persist(items.filter(i => i.id !== id));
    setSelectedId(null);
  };

  /** Move item to end of array so it draws on top */
  const bringToFront = useCallback((id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const next = [...items];
    const [removed] = next.splice(idx, 1);
    next.push(removed);
    persist(next);
  }, [items, persist]);

  const sendToBack = useCallback((id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx <= 0) return;
    const next = [...items];
    const [removed] = next.splice(idx, 1);
    next.unshift(removed);
    persist(next);
  }, [items, persist]);

  const moveLayerUp = useCallback((id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0 || idx >= items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    persist(next);
  }, [items, persist]);

  const moveLayerDown = useCallback((id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx <= 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    persist(next);
  }, [items, persist]);

  const handleSelectItem = useCallback((id: string, isDoubleTap?: boolean) => {
    const item = items.find(i => i.id === id);
    setSelectedId(id);
    bringToFront(id);
    if (item?.type === 'image') {
      setImageEditPanelOpen(!!isDoubleTap);
    }
  }, [bringToFront, items]);

  const handleSaveImage = async () => {
    if (!boardRef.current) return;
    try {
      const canvas = await html2canvas(boardRef.current, {
        useCORS: true,
        backgroundColor,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `malibu-moodboard-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const selected = items.find(i => i.id === selectedId);

  return (
    <div className="min-h-screen pb-above-nav">
      <Header title="Mood Board" showBack onBack={onBack} />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
          <GlassButton size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
            Add image
          </GlassButton>
          <GlassButton size="sm" leftIcon={<Type className="w-4 h-4" />} onClick={() => addText()}>
            Add text
          </GlassButton>
          <GlassButton size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleSaveImage}>
            Save to device
          </GlassButton>
          <GlassButton size="sm" variant="secondary" leftIcon={<Smartphone className="w-4 h-4" />} onClick={() => setShowHomeScreenHint(true)}>
            Add to Home Screen
          </GlassButton>
          <GlassButton size="sm" variant="secondary" leftIcon={<Palette className="w-4 h-4" />} onClick={() => setShowBgPicker(!showBgPicker)}>
            Background
          </GlassButton>
          {items.length > 0 && (
            <GlassButton size="sm" variant="secondary" leftIcon={<Layers className="w-4 h-4" />} onClick={() => setShowLayers(!showLayers)}>
              Layers
            </GlassButton>
          )}
        </div>

        {showLayers && items.length > 0 && (
          <GlassCard className="p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers (bottom → top)
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">First = back, last = front. Change order below.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.slice().reverse().map((it, revIdx) => {
                const idx = items.length - 1 - revIdx;
                const isSelected = selectedId === it.id;
                return (
                  <div
                    key={it.id}
                    className={cn(
                      'flex items-center justify-between gap-2 p-2 rounded-xl',
                      isSelected ? 'bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]/40' : 'bg-white/30'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => { setSelectedId(it.id); }}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="text-sm font-medium truncate block">
                        {it.type === 'image' ? '🖼 Image' : `Text: ${(it.text || 'Add your text').slice(0, 20)}${(it.text?.length ?? 0) > 20 ? '…' : ''}`}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">Layer {items.length - idx}</span>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => moveLayerDown(it.id)} disabled={idx <= 0} className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed" title="Move back"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveLayerUp(it.id)} disabled={idx >= items.length - 1} className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed" title="Move forward"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => sendToBack(it.id)} disabled={idx <= 0} className="text-xs px-2 py-1 rounded-lg bg-white/50 hover:bg-white/70 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed">Back</button>
                      <button type="button" onClick={() => bringToFront(it.id)} disabled={idx >= items.length - 1} className="text-xs px-2 py-1 rounded-lg bg-white/50 hover:bg-white/70 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed">Front</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {showBgPicker && (
          <GlassCard className="p-4">
            <span className="text-sm font-medium text-[var(--foreground)] block mb-3">Board background color</span>
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white/50 overflow-hidden"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 min-w-[100px] px-3 py-2 rounded-xl bg-white/50 border border-white/60 text-sm"
                placeholder="#faf8f5"
              />
            </div>
          </GlassCard>
        )}

        <p className="text-xs text-[var(--muted-foreground)]">
          <strong>Move:</strong> drag from the center. <strong>Resize:</strong> drag from the outer edge or corner. Double-tap an image to edit. Tap a text box to edit below.
        </p>

        {/* Canvas */}
        <GlassCard className="relative min-h-[400px] overflow-visible p-0" onClick={() => { setSelectedId(null); setImageEditPanelOpen(false); }}>
          <div
            ref={boardRef}
            className="relative w-full min-h-[400px]"
            style={{ minHeight: 400, backgroundColor }}
          >
            {items.map((item) => (
              <BoardItemComponent
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                backgroundColor={backgroundColor}
                isDarkMode={isDark}
                requireDoubleTapForEdit={item.type === 'image'}
                onSelect={(e, isDoubleTap) => { e.stopPropagation(); handleSelectItem(item.id, isDoubleTap); }}
                onUpdate={(u) => updateItem(item.id, u)}
                onRemove={() => removeItem(item.id)}
                onStartEdit={() => {}}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Edit panel for selected text - above bottom nav */}
      {selected?.type === 'text' && selectedId && (
        <div className="fixed left-0 right-0 z-50 p-4 pb-6 bottom-[72px] md:bottom-[80px] glass-strong rounded-t-2xl border-t shadow-lg">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Edit text</span>
              <button onClick={() => setSelectedId(null)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <input
              type="text"
              value={selected.text ?? ''}
              onChange={(e) => updateItem(selectedId, { text: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/60"
              placeholder="Your text"
            />
            <div className="flex gap-2 flex-wrap">
              {TEXT_COLORS.map((c) => {
                const isDarkColor = ['#2d2a26', '#000000', '#1a1816'].includes(c) || parseInt(c.slice(1), 16) < 0x888888;
                return (
                  <button
                    key={c}
                    onClick={() => updateItem(selectedId, { textColor: c })}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 shadow',
                      isDarkColor ? 'border-white/80' : 'border-[var(--foreground)]/30'
                    )}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
            <div>
              <span className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Size</span>
              <div className="flex gap-1.5 flex-wrap">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateItem(selectedId, { fontSize: s })}
                    className={cn('px-2 py-1 rounded-lg text-xs', selected.fontSize === s ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <select
              value={selected.fontFamily ?? 'Plus Jakarta Sans'}
              onChange={(e) => updateItem(selectedId, { fontFamily: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/60"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {items.length > 1 && (
              <div className="flex gap-2 pt-2 border-t border-white/20">
                <GlassButton size="sm" onClick={() => sendToBack(selectedId)} disabled={items.findIndex(i => i.id === selectedId) <= 0}>
                  Send to back
                </GlassButton>
                <GlassButton size="sm" onClick={() => bringToFront(selectedId)} disabled={items.findIndex(i => i.id === selectedId) >= items.length - 1}>
                  Bring to front
                </GlassButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit panel for selected image - border radius + layers (only on double-tap) */}
      {selected?.type === 'image' && selectedId && imageEditPanelOpen && (
        <div className="fixed left-0 right-0 z-50 p-4 pb-6 bottom-[72px] md:bottom-[80px] glass-strong rounded-t-2xl border-t shadow-lg">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Edit image</span>
              <button type="button" onClick={() => setImageEditPanelOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <span className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Border radius</span>
              <div className="flex gap-1.5 flex-wrap">
                {BORDER_RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateItem(selectedId, { borderRadius: r })}
                    className={cn('px-2 py-1 rounded-lg text-xs', (selected.borderRadius ?? 8) === r ? 'bg-[var(--primary)] text-white' : 'bg-white/50')}
                  >
                    {r}px
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <GlassButton size="sm" onClick={() => sendToBack(selectedId)} disabled={items.findIndex(i => i.id === selectedId) <= 0}>
                Send to back
              </GlassButton>
              <GlassButton size="sm" onClick={() => bringToFront(selectedId)} disabled={items.findIndex(i => i.id === selectedId) >= items.length - 1}>
                Bring to front
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {showHomeScreenHint && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowHomeScreenHint(false)}>
          <GlassCard className="max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Add to Home Screen</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              <strong>iPhone:</strong> Tap Share, then &quot;Add to Home Screen&quot;.
              <br /><strong>Android:</strong> Tap menu (⋮), then &quot;Add to Home screen&quot;.
            </p>
            <GlassButton variant="primary" fullWidth onClick={() => setShowHomeScreenHint(false)}>Got it</GlassButton>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

const EDGE_THRESHOLD = 20;
type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

function getResizeHandle(localX: number, localY: number, width: number, height: number): ResizeHandle | null {
  const onLeft = localX <= EDGE_THRESHOLD;
  const onRight = localX >= width - EDGE_THRESHOLD;
  const onTop = localY <= EDGE_THRESHOLD;
  const onBottom = localY >= height - EDGE_THRESHOLD;
  if (onTop && onLeft) return 'nw';
  if (onTop && onRight) return 'ne';
  if (onBottom && onLeft) return 'sw';
  if (onBottom && onRight) return 'se';
  if (onTop) return 'n';
  if (onBottom) return 's';
  if (onLeft) return 'w';
  if (onRight) return 'e';
  return null;
}

function BoardItemComponent({
  item,
  isSelected,
  backgroundColor,
  isDarkMode,
  requireDoubleTapForEdit,
  onSelect,
  onUpdate,
  onRemove,
  onStartEdit,
}: {
  item: BoardItem;
  isSelected: boolean;
  backgroundColor: string;
  isDarkMode: boolean;
  requireDoubleTapForEdit?: boolean;
  onSelect: (e: React.MouseEvent, isDoubleTap?: boolean) => void;
  onUpdate: (u: Partial<BoardItem>) => void;
  onRemove: () => void;
  onStartEdit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<'move' | 'resize' | null>(null);
  const handleRef = useRef<ResizeHandle | null>(null);
  const startRef = useRef({ clientX: 0, clientY: 0, x: 0, y: 0, w: 0, h: 0 });
  const lastTapRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (requireDoubleTapForEdit) {
      const now = Date.now();
      if (now - lastTapRef.current < 350) {
        lastTapRef.current = 0;
        onSelect(e as unknown as React.MouseEvent, true);
      } else {
        lastTapRef.current = now;
        onSelect(e as unknown as React.MouseEvent, false);
      }
    } else {
      onSelect(e as unknown as React.MouseEvent);
      if (item.type === 'text') onStartEdit?.();
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const handle = getResizeHandle(localX, localY, item.width, item.height);
    if (handle) {
      interactionRef.current = 'resize';
      handleRef.current = handle;
      startRef.current = { clientX: e.clientX, clientY: e.clientY, x: item.x, y: item.y, w: item.width, h: item.height };
    } else {
      interactionRef.current = 'move';
      startRef.current = { clientX: e.clientX, clientY: e.clientY, x: item.x, y: item.y, w: item.width, h: item.height };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const mode = interactionRef.current;
    const start = startRef.current;
    if (mode === 'move') {
      const dx = e.clientX - start.clientX;
      const dy = e.clientY - start.clientY;
      onUpdate({ x: Math.max(0, start.x + dx), y: Math.max(0, start.y + dy) });
    } else if (mode === 'resize' && handleRef.current) {
      const handle = handleRef.current;
      const dx = e.clientX - start.clientX;
      const dy = e.clientY - start.clientY;
      const minSize = 40;
      let x = start.x;
      let y = start.y;
      let w = start.w;
      let h = start.h;
      if (handle.includes('e')) w = Math.max(minSize, start.w + dx);
      if (handle.includes('w')) {
        const newW = Math.max(minSize, start.w - dx);
        x = start.x + start.w - newW;
        w = newW;
      }
      if (handle.includes('s')) h = Math.max(minSize, start.h + dy);
      if (handle.includes('n')) {
        const newH = Math.max(minSize, start.h - dy);
        y = start.y + start.h - newH;
        h = newH;
      }
      onUpdate({ x, y, width: w, height: h });
    }
  };

  const handlePointerUp = () => {
    interactionRef.current = null;
    handleRef.current = null;
  };

  const radius = item.borderRadius ?? 8;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute select-none touch-none overflow-hidden ${isSelected ? 'cursor-move' : 'cursor-move'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex: isSelected ? 10 : 1,
        touchAction: 'none',
        borderRadius: radius,
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {item.type === 'image' && item.imageUrl && (
        <img
          src={item.imageUrl}
          alt="Board"
          className="w-full h-full object-cover pointer-events-none"
          style={{ borderRadius: radius }}
          draggable={false}
        />
      )}
      {item.type === 'text' && (() => {
        const darkBg = ['#2d2a26', '#1a1816'].includes(backgroundColor) || isDarkMode;
        const rawColor = item.textColor ?? (darkBg ? '#ffffff' : '#2d2a26');
        const darkColors = ['#2d2a26', '#000000', '#1a1816', '#333333', '#444444'];
        const isDarkText = darkColors.includes(rawColor) || (rawColor.startsWith('#') && parseInt(rawColor.slice(1), 16) < 0x666666);
        const textColor = darkBg && isDarkText ? '#ffffff' : rawColor;
        return (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden px-2 pointer-events-none"
            style={{
              color: textColor,
              fontSize: item.fontSize ?? 16,
              fontFamily: item.fontFamily ?? 'Plus Jakarta Sans',
              borderRadius: radius,
            }}
          >
            {item.text || 'Add your text'}
          </div>
        );
      })()}
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-[var(--primary)] pointer-events-none" style={{ borderRadius: radius }} />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs z-20 shadow-lg pointer-events-auto"
            aria-label="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </motion.div>
  );
}

