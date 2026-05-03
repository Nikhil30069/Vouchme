import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  color?: string;
  delay?: number;
}

export const ScoreRing = ({ score, max = 10, size = 88, color = "#0e0e11", delay = 0 }: ScoreRingProps) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(score), delay * 1000 + 120);
    return () => clearTimeout(t);
  }, [score, delay]);

  const pct = displayed / max;
  const fontSize = size > 70 ? 22 : size > 50 ? 16 : 13;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="44" cy="44" r={r} strokeWidth="6" stroke="var(--surface-3)" fill="none" />
        <circle
          cx="44" cy="44" r={r} strokeWidth="6"
          stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: `stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color }}>
          {displayed.toFixed(1)}
        </div>
        <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 500, marginTop: 2 }}>/ {max}</div>
      </div>
    </div>
  );
};
