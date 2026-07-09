import React, { useEffect, useRef, useState } from "react";

const RING_DEFS = [
  { key: "exercise", color: "var(--exercise)", soft: "var(--exercise-soft)", label: "Exercise" },
  { key: "work", color: "var(--work)", soft: "var(--work-soft)", label: "Focus" },
  { key: "meditation", color: "var(--meditation)", soft: "var(--meditation-soft)", label: "Meditation" },
];

/**
 * progress: { exercise: 0..1+ (overflow allowed), work: 0..1+, meditation: 0..1+ }
 * onRingTap(key): called when a ring is tapped to open its quick-log sheet.
 */
export default function RingTrio({ progress, onRingTap, size = 220 }) {
  const allComplete = RING_DEFS.every((r) => (progress[r.key] || 0) >= 1);
  const [justCompleted, setJustCompleted] = useState(false);
  const prevAllComplete = useRef(allComplete);

  useEffect(() => {
    if (allComplete && !prevAllComplete.current) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 1400);
      return () => clearTimeout(t);
    }
    prevAllComplete.current = allComplete;
  }, [allComplete]);

  const center = size / 2;
  const strokeWidth = size * 0.072;
  const gap = strokeWidth * 0.45;

  return (
    <div
      role="group"
      aria-label="Today's progress rings: exercise, focus, and meditation"
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto",
        filter: justCompleted ? "drop-shadow(0 0 18px rgba(212,162,58,0.45))" : "none",
        transition: "filter 0.6s ease",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {RING_DEFS.map((ring, i) => {
          const radius = center - strokeWidth / 2 - i * (strokeWidth + gap);
          const value = Math.max(0, progress[ring.key] || 0);
          const clamped = Math.min(value, 1);
          const overflow = Math.max(0, value - 1);
          return (
            <RingArc
              key={ring.key}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              color={ring.color}
              softColor={ring.soft}
              progress={clamped}
              overflow={overflow}
              label={ring.label}
              onTap={() => onRingTap?.(ring.key)}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        {allComplete ? (
          <>
            <span style={{ fontSize: size * 0.13 }} aria-hidden="true">✦</span>
            <span
              className="font-display"
              style={{ fontSize: size * 0.08, color: "var(--ink)", marginTop: 2, fontWeight: 600 }}
            >
              +3 bonus
            </span>
          </>
        ) : (
          <span
            className="font-mono"
            style={{ fontSize: size * 0.09, color: "var(--ink-faint)" }}
          >
            {RING_DEFS.filter((r) => (progress[r.key] || 0) >= 1).length}/3
          </span>
        )}
      </div>
    </div>
  );
}

function RingArc({ cx, cy, r, strokeWidth, color, softColor, progress, overflow, label, onTap }) {
  const circumference = 2 * Math.PI * r;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedProgress(progress));
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const dashOffset = circumference * (1 - animatedProgress);
  const showOverflowRing = overflow > 0;
  const overflowDash = circumference * Math.min(overflow, 1);

  return (
    <g
      onClick={onTap}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${Math.round(progress * 100)}% of goal${overflow > 0 ? ", goal exceeded" : ""}. Tap to log.`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap?.(); } }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={softColor} strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      {showOverflowRing && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 0.32}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - overflowDash}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity={0.55}
        />
      )}
      {/* transparent hit-area ring, wider than the visible stroke, for easier tapping */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="transparent" strokeWidth={strokeWidth * 2.2} />
    </g>
  );
}
