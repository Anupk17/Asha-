import React from 'react';

export interface WaveformProps {
  isActive: boolean;
  levels?: number[]; // normalized 0 to 1
  barsCount?: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  isActive,
  levels,
  barsCount = 24,
}) => {
  // Generate dummy animated heights if levels are not provided but active
  const bars = Array.from({ length: barsCount }).map((_, i) => {
    if (!isActive) return 6;
    if (levels && levels[i] !== undefined) {
      return Math.max(6, Math.min(48, Math.round(levels[i] * 48)));
    }
    // Subtle pulsating default visual
    const sinOffset = Math.sin((i / barsCount) * Math.PI * 2);
    return Math.max(8, Math.min(44, Math.round(18 + sinOffset * 14 + (i % 3) * 6)));
  });

  return (
    <div className="flex items-center justify-center gap-1 h-14 px-4 bg-teal-100/50 rounded-card border border-teal-700/10">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isActive ? 'bg-teal-700' : 'bg-muted/40'
          }`}
          style={{
            height: `${height}px`,
            opacity: isActive ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
};

