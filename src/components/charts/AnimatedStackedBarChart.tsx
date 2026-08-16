import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export interface MahallaBarItem {
  name: string;
  fullName: string;
  employed: number;
  studying: number;
  neet: number;
  total: number;
}

interface AnimatedStackedBarChartProps {
  data: MahallaBarItem[];
  title?: string;
  avgEmploymentLabel?: string;
  openMapLabel?: string;
  labels: {
    employed: string;
    studying: string;
    neet: string;
  };
  onOpenMap?: () => void;
}

export const AnimatedStackedBarChart: React.FC<AnimatedStackedBarChartProps> = ({
  data,
  title,
  avgEmploymentLabel,
  openMapLabel = 'Открыть карту →',
  labels,
  onOpenMap
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Dynamic max bound calculation: rounds up to nearest multiple of 4
  const rawMax = Math.max(12, ...data.map(d => d.total));
  const maxVal = Math.ceil(rawMax / 4) * 4;

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 240;
  const chartTop = 20;
  const chartBottom = 182;
  const chartHeight = chartBottom - chartTop; // 162px
  const leftMargin = 32;
  const rightMargin = 16;
  const availableWidth = svgWidth - leftMargin - rightMargin;

  // Grid steps (4 equal segments)
  const step = maxVal / 4;
  const yTicks = [0, step, step * 2, step * 3, maxVal];

  const colors = {
    employed: '#10B981',
    studying: '#06B6D4',
    neet: '#F43F5E'
  };

  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="flex flex-col justify-between h-full space-y-3 relative">
      
      {/* Chart Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
          {avgEmploymentLabel && (
            <span className="inline-flex items-center gap-1.5 text-slate-300 text-[11px] font-medium bg-surface-2 px-2.5 py-0.5 rounded-md border border-white/[0.08] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{avgEmploymentLabel}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Top Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
              <span>{labels.employed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#06B6D4]" />
              <span>{labels.studying}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#F43F5E]" />
              <span>{labels.neet}</span>
            </div>
          </div>

          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors shrink-0"
            >
              <span>{openMapLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
        >
          {/* Y-Axis Grid Lines & Numbers */}
          {yTicks.map((tick) => {
            const yPos = chartBottom - (tick / maxVal) * chartHeight;

            return (
              <g key={tick}>
                <text
                  x={leftMargin - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono select-none"
                >
                  {tick}
                </text>
                <line
                  x1={leftMargin}
                  y1={yPos}
                  x2={svgWidth - rightMargin}
                  y2={yPos}
                  stroke={tick === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)'}
                  strokeDasharray={tick === 0 ? 'none' : '3 3'}
                  strokeWidth={tick === 0 ? 1.5 : 1}
                />
              </g>
            );
          })}

          {/* Columns */}
          {data.map((item, idx) => {
            const colGap = availableWidth / data.length;
            const colWidth = Math.min(28, colGap * 0.55);
            const xCenter = leftMargin + idx * colGap + colGap / 2;
            const xPos = xCenter - colWidth / 2;

            const isHovered = hoveredIdx === idx;
            const isDimmed = hoveredIdx !== null && !isHovered;

            // Segments calculation with clean 2px gap between stacked slices
            const segGap = 2;
            const activeSegments: { key: 'employed' | 'studying' | 'neet'; val: number; color: string }[] = [];
            if (item.employed > 0) activeSegments.push({ key: 'employed', val: item.employed, color: colors.employed });
            if (item.studying > 0) activeSegments.push({ key: 'studying', val: item.studying, color: colors.studying });
            if (item.neet > 0) activeSegments.push({ key: 'neet', val: item.neet, color: colors.neet });

            const totalHeight = (item.total / maxVal) * chartHeight;
            const totalGaps = Math.max(0, activeSegments.length - 1) * segGap;
            const usableHeight = Math.max(0, totalHeight - totalGaps);

            // Compute vertical layout starting from bottom up
            let currentBottom = chartBottom;
            const renderedSegments = activeSegments.map((seg) => {
              const segH = Math.max(3, (seg.val / item.total) * usableHeight);
              const segY = currentBottom - segH;
              currentBottom = segY - segGap;
              return { ...seg, y: segY, h: segH };
            });

            return (
              <g
                key={item.name}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  setHoveredIdx(idx);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null);
                  setTooltipPos(null);
                }}
                style={{
                  opacity: isDimmed ? 0.55 : 1,
                  transition: 'opacity 0.15s ease'
                }}
              >
                {/* Column Background Slot with Visible Boundary Borders */}
                <rect
                  x={xPos}
                  y={chartTop}
                  width={colWidth}
                  height={chartHeight}
                  fill={isHovered ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'}
                  stroke={isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={1}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Animated Column Group with Crisp Segment Boundaries */}
                <g
                  style={{
                    animation: `barGrowCascading 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 25}ms both`,
                    transformOrigin: `${xCenter}px ${chartBottom}px`
                  }}
                >
                  {renderedSegments.map((seg) => (
                    <rect
                      key={seg.key}
                      x={xPos}
                      y={seg.y}
                      width={colWidth}
                      height={seg.h}
                      fill={seg.color}
                      stroke="#0E1117"
                      strokeWidth={1}
                    />
                  ))}
                </g>

                {/* X-Axis Label */}
                <text
                  x={xCenter}
                  y={chartBottom + 16}
                  textAnchor="end"
                  transform={`rotate(-28, ${xCenter}, ${chartBottom + 16})`}
                  className={`text-[11px] font-medium transition-colors select-none ${
                    isHovered ? 'fill-white font-semibold' : 'fill-slate-400'
                  }`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Clean Tooltip */}
      {hoveredItem && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#151922] border border-white/[0.12] rounded-lg p-3 shadow-xl shadow-black/80 min-w-[200px] animate-in fade-in duration-100"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8
          }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2">
            <span className="text-xs font-bold text-white tracking-tight">
              {hoveredItem.fullName}
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-3 text-slate-300 border border-white/[0.06]">
              {hoveredItem.total} чел.
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Employed Row */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
                <span>{labels.employed}:</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400 text-[10px]">
                  {hoveredItem.total > 0 ? Math.round((hoveredItem.employed / hoveredItem.total) * 100) : 0}%
                </span>
                <strong className="text-white font-semibold">{hoveredItem.employed} чел.</strong>
              </div>
            </div>

            {/* Studying Row */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#06B6D4]" />
                <span>{labels.studying}:</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400 text-[10px]">
                  {hoveredItem.total > 0 ? Math.round((hoveredItem.studying / hoveredItem.total) * 100) : 0}%
                </span>
                <strong className="text-white font-semibold">{hoveredItem.studying} чел.</strong>
              </div>
            </div>

            {/* NEET Row */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#F43F5E]" />
                <span>{labels.neet}:</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-rose-400/80 text-[10px]">
                  {hoveredItem.total > 0 ? Math.round((hoveredItem.neet / hoveredItem.total) * 100) : 0}%
                </span>
                <strong className="text-rose-400 font-semibold">{hoveredItem.neet} чел.</strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


