import React, { useState } from 'react';

export interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

interface AnimatedDonutChartProps {
  data: DonutDataItem[];
  total: number;
  unitLabel?: string;
  inRegistryLabel?: string;
  title?: string;
}

export const AnimatedDonutChart: React.FC<AnimatedDonutChartProps> = ({
  data,
  total,
  unitLabel = 'человек',
  inRegistryLabel = 'чел. в реестре',
  title
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG geometry constants
  const size = 260;
  const strokeWidth = 28;
  const radius = 88;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius; // ~552.92

  // Calculate segment lengths and cumulative offsets
  const nonZeroData = data.filter(d => d.value > 0);
  const totalVal = nonZeroData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  let cumulativeOffset = 0;
  const gapPixels = nonZeroData.length > 1 ? 3 : 0;

  const segments = nonZeroData.map((item, idx) => {
    const rawRatio = item.value / totalVal;
    const strokeDash = rawRatio * circumference;
    const visibleLength = Math.max(0, strokeDash - gapPixels);
    const startOffset = cumulativeOffset;
    cumulativeOffset += strokeDash;

    return {
      ...item,
      idx,
      percentage: Math.round(rawRatio * 100),
      strokeDasharray: `${visibleLength} ${circumference - visibleLength}`,
      strokeDashoffset: -startOffset,
      animationDelay: `${idx * 120}ms`
    };
  });

  const activeItem = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <span className="text-[11px] text-slate-300 font-semibold bg-surface-2 px-2.5 py-1 rounded-lg border border-white/[0.08] font-mono">
            {total} {inRegistryLabel}
          </span>
        </div>
      )}

      {/* SVG Donut Circle with Sharp Clean Cuts */}
      <div className="relative flex items-center justify-center my-auto py-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none"
        >
          {/* Subtle Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
          />

          {/* Sharp Slices with Crisp Cut Boundaries (strokeLinecap="butt") */}
          {segments.map((seg) => {
            const isHovered = hoveredIndex === seg.idx;
            const isDimmed = hoveredIndex !== null && !isHovered;

            return (
              <circle
                key={seg.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                onMouseEnter={() => setHoveredIndex(seg.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-150"
                style={{
                  animation: `donutSliceDraw 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${seg.animationDelay} both`,
                  opacity: isDimmed ? 0.3 : 1,
                  filter: isHovered ? `drop-shadow(0 0 6px ${seg.color}60)` : 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Center Dynamic Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <div className="space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-2xl font-black text-white">{activeItem.value}</span>
              <div className="text-[11px] font-bold text-slate-300 font-mono">
                {activeItem.percentage}%
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                {activeItem.name}
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-3xl font-black text-white tracking-tight">{total}</span>
              <span className="text-xs text-slate-400 font-medium block">{unitLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="space-y-1.5 pt-3 border-t border-white/[0.06] text-xs">
        {segments.map((seg) => {
          const isHovered = hoveredIndex === seg.idx;
          const isDimmed = hoveredIndex !== null && !isHovered;

          return (
            <div
              key={seg.name}
              onMouseEnter={() => setHoveredIndex(seg.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between py-1 px-1.5 rounded-lg transition-all cursor-pointer ${
                isHovered ? 'bg-surface-2 text-white' : isDimmed ? 'opacity-40 text-slate-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-transform"
                  style={{
                    backgroundColor: seg.color,
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)'
                  }}
                />
                <span className="truncate text-xs">{seg.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                <span className="text-slate-500">{seg.percentage}%</span>
                <span className="font-semibold text-white">{seg.value} чел.</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
