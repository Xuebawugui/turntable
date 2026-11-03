"use client";

import { useEffect, useMemo, useState } from "react";

type WheelPrize = {
  id: string;
  label: string;
  color: string;
  grand?: boolean;
  index: number;
};

type Props = {
  prizes: WheelPrize[];
  spinning: boolean;
  targetIndex: number | null;
  onSpinEnd?: () => void;
};

const SPIN_DURATION_MS = 5200;
const EXTRA_TURNS = 7;

export function LuckyWheel({ prizes, spinning, targetIndex, onSpinEnd }: Props) {
  const [rotation, setRotation] = useState(0);
  const count = prizes.length;
  const slice = count > 0 ? 360 / count : 0;

  const conicGradient = useMemo(() => {
    if (count === 0) return "hsl(0 0% 22%)";
    const stops = prizes
      .map((p, i) => {
        const start = (i / count) * 100;
        const end = ((i + 1) / count) * 100;
        return `${p.color} ${start}% ${end}%`;
      })
      .join(", ");
    return `conic-gradient(from -90deg, ${stops})`;
  }, [prizes, count]);

  useEffect(() => {
    if (!spinning || targetIndex === null || count === 0) return;

    const centerOfSlice = targetIndex * slice + slice / 2;
    const targetRotation = EXTRA_TURNS * 360 + (360 - centerOfSlice);

    setRotation((prev) => {
      const base = prev % 360;
      return prev - base + targetRotation;
    });

    const t = setTimeout(() => onSpinEnd?.(), SPIN_DURATION_MS);
    return () => clearTimeout(t);
  }, [spinning, targetIndex, count, slice, onSpinEnd]);

  const labels = useMemo(() => {
    const r = 34;
    return prizes.map((p, i) => {
      const angleDeg = i * slice + slice / 2 - 90;
      const rad = (angleDeg * Math.PI) / 180;
      const x = 50 + r * Math.cos(rad);
      const y = 50 + r * Math.sin(rad);
      return { ...p, x, y, rotate: angleDeg + 90 };
    });
  }, [prizes, slice]);

  const sizeClass =
    "w-[min(100%,calc(100vw-3rem))] max-w-[min(340px,85vw)] sm:max-w-[380px]";

  if (count === 0) {
    return (
      <div
        className={`relative mx-auto flex aspect-square items-center justify-center rounded-full border border-white/10 bg-zinc-800 ${sizeClass}`}
      >
        <p className="px-4 text-center text-sm text-muted-foreground">Loading prizes…</p>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto aspect-square ${sizeClass}`}>
      <div className="absolute inset-[-6px] rounded-full bg-gradient-to-b from-white/20 to-white/5 p-[1px] shadow-glow">
        <div className="h-full w-full rounded-full bg-zinc-900" />
      </div>

      <div
        className="absolute inset-0 overflow-hidden rounded-full border-2 border-white/15 shadow-[inset_0_0_30px_rgba(0,0,0,0.45)] transition-transform ease-[cubic-bezier(0.15,0.85,0.25,1)]"
        style={{
          background: conicGradient,
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? `${SPIN_DURATION_MS}ms` : "0ms",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-bottom bg-white/35"
            style={{ transform: `translateX(-50%) rotate(${i * slice - 90}deg)` }}
          />
        ))}
        {labels.map((item) => (
          <span
            key={item.id}
            className={`absolute z-10 max-w-[3.25rem] text-center text-[9px] font-bold leading-tight sm:max-w-[4rem] sm:text-[10px] ${
              item.grand ? "text-amber-50" : "text-white"
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-0.5">
        <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden>
          <path
            d="M14 36 L2 8 Q14 0 26 8 Z"
            fill="hsl(0 0% 98%)"
            stroke="hsl(0 0% 100% / 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-[18%] min-h-[52px] w-[18%] min-w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-white sm:text-xs">
          Spin
        </span>
      </div>
    </div>
  );
}
