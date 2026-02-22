import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, useMotionValueEvent, animate } from 'framer-motion';

interface CountUpProps {
  value: string | number;
  className?: string;
}

/** Parses value for animation: "85%" -> 85, "12" -> 12 */
function parseNumeric(value: string | number): { num: number; suffix: string } {
  const s = String(value);
  const match = s.match(/^(\d+)(.*)$/);
  if (match) return { num: parseInt(match[1], 10), suffix: match[2] || '' };
  return { num: 0, suffix: s };
}

export function CountUp({ value, className }: CountUpProps) {
  const { num, suffix } = parseNumeric(value);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(rounded, 'change', (v) => setDisplay(v));

  useEffect(() => {
    const ctrl = animate(count, num, {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return () => ctrl.stop();
  }, [num, count]);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
      {display}
      {suffix}
    </span>
  );
}
