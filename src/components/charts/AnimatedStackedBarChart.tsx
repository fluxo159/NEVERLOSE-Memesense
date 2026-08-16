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
  const chartTop = 15;
  const chartBottom = 185;
  const chartHeight = chartBottom - chartTop; // 170px
  const leftMargin = 32;
  const rightMargin = 15;
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
            <span className="inline-flex items-center gap-1.5 text-slate-300 text-[11px] font-medium bg-surface-2 px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
              <span>{avgEmploymentLabel}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Top Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-emerald-500" />
              <span>{labels.employed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-cyan-500" />
              <span>{labels.studying}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-rose-500" />
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

      {/* SVG Canvas for Perfect Pixel Alignment */}
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
                  y={yPos + 4}
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
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray={tick === 0 ? 'none' : '3 3'}
                  strokeWidth={tick === 0 ? 1.5 : 1}
                />
              </g>
            );
          })}

          {/* Columns */}
          {data.map((item, idx) => {
            const colWidth = Math.min(34, (availableWidth / data.length) * 0.65);
            const colGap = availableWidth / data.length;
            const xCenter = leftMargin + idx * colGap + colGap / 2;
            const xPos = xCenter - colWidth / 2;

            const totalHeight = (item.total / maxVal) * chartHeight;
            const employedH = item.total > 0 ? (item.employed / maxVal) * chartHeight : 0;
            const studyingH = item.total > 0 ? (item.studying / maxVal) * chartHeight : 0;
            const neetH = item.total > 0 ? (item.neet / maxVal) * chartHeight : 0;

            const isHovered = hoveredIdx === idx;

            // Y positions (stacked from baseline upwards)
            const employedY = chartBottom - employedH;
            const studyingY = employedY - studyingH;
            const neetY = studyingY - neetH;

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
              >
                {/* Column Highlight Backdrop */}
                {isHovered && (
                  <rect
                    x={xPos - 4}
                    y={chartTop}
                    width={colWidth + 8}
                    height={chartHeight + 2}
                    rx={6}
                    fill="rgba(255, 255, 255, 0.04)"
                  />
                )}

                {/* Animated Column Group with Subtle Fast Entry Animation */}
                <g
                  style={{
                    animation: `barGrowCascading 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 20}ms both`,
                    transformOrigin: `${xCenter}px ${chartBottom}px`
                  }}
                >
                  {/* Employed Section (Bottom) */}
                  {employedH > 0 && (
                    <rect
                      x={xPos}
                      y={employedY}
                      width={colWidth}
                      height={employedH}
                      fill={colors.employed}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Studying Section (Middle) */}
                  {studyingH > 0 && (
                    <rect
                      x={xPos}
                      y={studyingY}
                      width={colWidth}
                      height={studyingH}
                      fill={colors.studying}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* NEET Section (Top with rounded cap) */}
                  {neetH > 0 && (
                    <rect
                      x={xPos}
                      y={neetY}
                      width={colWidth}
                      height={neetH}
                      rx={4}
                      fill={colors.neet}
                      className="transition-all duration-150"
                    />
                  )}
                </g>

                {/* X-Axis Label */}
                <text
                  x={xCenter}
                  y={chartBottom + 16}
                  textAnchor="end"
                  transform={`rotate(-25, ${xCenter}, ${chartBottom + 16})`}
                  className={`text-[11px] font-medium transition-colors select-none ${
                    isHovered ? 'fill-indigo-400 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Custom Tooltip */}
      {hoveredItem && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#151922] border border-white/[0.14] rounded-xl p-3 shadow-2xl shadow-black/90 min-w-[190px] animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 10
          }}
        >
          <div className="text-xs font-bold text-white border-b border-white/[0.08] pb-1.5 mb-2">
            {hoveredItem.fullName}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{labels.employed}:</span>
              </span>
              <strong className="text-white font-mono">{hoveredItem.employed} чел.</strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>{labels.studying}:</span>
              </span>
              <strong className="text-white font-mono">{hoveredItem.studying} чел.</strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{labels.neet}:</span>
              </span>
              <strong className="text-rose-400 font-mono">{hoveredItem.neet} чел.</strong>
            </div>

            <div className="pt-1.5 mt-1 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Всего в махалле:</span>
              <span className="font-mono text-white">{hoveredItem.total} чел.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
