import React, { useMemo } from "react";
import { lastNDateKeys } from "../../lib/dates";

/**
 * Computes a simple Pearson correlation between mood intensity and each activity metric
 * over the last N days, using only days where both values are present.
 */
function pearson(pairs) {
  const n = pairs.length;
  if (n < 3) return null;
  const xs = pairs.map((p) => p[0]);
  const ys = pairs.map((p) => p[1]);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

export default function MoodCorrelation({ entriesByDate, days = 30 }) {
  const keys = lastNDateKeys(days);

  const correlations = useMemo(() => {
    const metrics = [
      { key: "exercise", label: "Exercise minutes", extract: (r) => r?.exercise?.minutes },
      { key: "work", label: "Focused hours", extract: (r) => r?.work?.focusedHours },
      { key: "meditation", label: "Meditation minutes", extract: (r) => r?.meditation?.minutes },
    ];
    return metrics.map((m) => {
      const pairs = [];
      for (const k of keys) {
        const rec = entriesByDate[k];
        const mood = rec?.mood?.intensity;
        const val = m.extract(rec);
        if (mood != null && val != null) pairs.push([mood, val]);
      }
      return { ...m, r: pearson(pairs), n: pairs.length };
    });
  }, [entriesByDate, keys]);

  return (
    <div>
      {correlations.map((c) => (
        <div key={c.key} style={rowStyle}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.label}</span>
            <p style={{ fontSize: 11.5, color: "var(--ink-faint)", margin: "1px 0 0" }}>
              {c.n < 3 ? "Not enough overlapping data yet" : describeCorrelation(c.r)}
            </p>
          </div>
          {c.r != null && <CorrelationBar value={c.r} />}
        </div>
      ))}
    </div>
  );
}

function describeCorrelation(r) {
  const abs = Math.abs(r);
  const strength = abs > 0.6 ? "Strong" : abs > 0.3 ? "Moderate" : "Weak";
  const direction = r > 0 ? "positive" : "negative";
  return `${strength} ${direction} relationship with mood`;
}

function CorrelationBar({ value }) {
  const pct = Math.round(Math.abs(value) * 50); // half-width max
  const positive = value >= 0;
  return (
    <div style={{ width: 90, height: 8, background: "var(--hairline)", borderRadius: 4, position: "relative" }} aria-hidden="true">
      <div
        style={{
          position: "absolute",
          left: positive ? "50%" : `${50 - pct}%`,
          width: `${pct}%`,
          height: "100%",
          background: positive ? "var(--success)" : "var(--danger)",
          borderRadius: 4,
        }}
      />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--hairline-strong)" }} />
    </div>
  );
}

const rowStyle = { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--hairline)" };
