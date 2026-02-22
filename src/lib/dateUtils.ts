/** Format a Date for HTML date input (YYYY-MM-DD) using local timezone */
export function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD string as local date (avoids UTC midnight timezone shift) */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Parse free-text date and time (e.g. "Feb 21 3pm", "tomorrow 10am", "2/21/2026 3:00 PM").
 * Returns { date: "YYYY-MM-DD", time: "HH:mm" } or null if unparseable.
 */
export function parseDateTimeInput(text: string): { date: string; time: string } | null {
  const raw = text.trim();
  if (!raw) return null;
  const now = new Date();
  let date: Date = new Date(now);
  let hour = 9;
  let minute = 0;

  // Time patterns: 3pm, 3:30pm, 15:00, 3:00 PM
  const timeMatch = raw.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = (timeMatch[3] || '').toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (!ampm && hour <= 12) {
      // No am/pm: assume AM if <= 12, or 24h if > 12
      if (hour < 12) hour = hour;
      else if (hour === 12) hour = 12;
    }
  }
  const rest = raw.replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, '').replace(/\s+/g, ' ').trim();

  // Date part
  const lower = rest.toLowerCase();
  if (lower.includes('tomorrow')) {
    date.setDate(date.getDate() + 1);
  } else if (lower.match(/next\s+(mon|tue|wed|thu|fri|sat|sun)/i)) {
    const days: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const match = lower.match(/next\s+(mon|tue|wed|thu|fri|sat|sun)/i);
    if (match) {
      const target = days[match[1].toLowerCase().slice(0, 3)];
      const current = date.getDay();
      let add = target - current;
      if (add <= 0) add += 7;
      date.setDate(date.getDate() + add);
    }
  } else {
    // Try numeric: 2/21/2026, 2/21, 2026-02-21
    const numMatch = rest.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})?/);
    if (numMatch) {
      const a = parseInt(numMatch[1], 10);
      const b = parseInt(numMatch[2], 10);
      const c = numMatch[3] ? parseInt(numMatch[3], 10) : date.getFullYear();
      const y = c > 99 ? c : c < 50 ? 2000 + c : 1900 + c;
      const m = a <= 12 ? a : b;
      const d = a <= 12 ? b : a;
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) date = new Date(y, m - 1, d);
    } else {
      // Try month name: Feb 21, February 21
      const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const monthMatch = rest.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i);
      if (monthMatch) {
        const mi = months[monthMatch[1].toLowerCase().slice(0, 3)];
        const d = parseInt(monthMatch[2], 10);
        const y = date.getFullYear();
        if (d >= 1 && d <= 31) date = new Date(y, mi, d);
      }
    }
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { date: dateStr, time: timeStr };
}
