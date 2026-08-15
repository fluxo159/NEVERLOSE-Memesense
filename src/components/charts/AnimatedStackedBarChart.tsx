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
  const [hoveredMahalla, setHoveredMahalla] = useState<MahallaBarItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Chart configuration
  const maxVal = Math.max(16, ...data.map(d => d.total + 2));
  const height = 190;
  const yTicks = [0, 4, 8, 12, 16];

  const colors = {
    employed: '#10B981',
    studying: '#06B6D4',
    neet: '#F43F5E'
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4 relative">
      
      {/* Chart Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
          {avgEmploymentLabel && (
            <span className="hidden sm:inline-block text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              {avgEmploymentLabel}
            </span>
          )}
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

      {/* Top Legend */}
      <div className="flex items-center justify-end gap-4 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>{labels.employed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
          <span>{labels.studying}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span>{labels.neet}</span>
        </div>
      </div>

      {/* Responsive Bar Chart Canvas */}
      <div className="relative pt-2 pb-1 flex-1 min-h-[220px]">
        
        {/* Y-Axis Grid & Labels */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-8 pr-2">
          {yTicks.slice().reverse().map((tick) => (
            <div key={tick} className="flex items-center w-full">
              <span className="text-[10px] text-slate-500 font-mono w-5 text-right pr-2">
                {tick}
              </span>
              <div className="flex-1 border-b border-white/[0.06] border-dashed" />
            </div>
          ))}
        </div>

        {/* Columns Grid */}
        <div className="pl-6 h-[175px] flex items-end justify-between gap-1 sm:gap-2 relative z-10">
          {data.map((item, idx) => {
            const isHovered = hoveredMahalla?.name === item.name;
            const colHeightPx = (item.total / maxVal) * height;

            const employedPx = item.total > 0 ? (item.employed / item.total) * colHeightPx : 0;
            const studyingPx = item.total > 0 ? (item.studying / item.total) * colHeightPx : 0;
            const neetPx = item.total > 0 ? (item.neet / item.total) * colHeightPx : 0;

            return (
              <div
                key={item.name}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
                onMouseEnter={(e) => {
                  setHoveredMahalla(item);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => {
                  setHoveredMahalla(null);
                  setTooltipPos(null);
                }}
              >
                {/* Highlight Backdrop on Hover */}
                {isHovered && (
                  <div className="absolute -inset-x-1 -inset-y-2 bg-white/[0.04] rounded-xl pointer-events-none transition-all" />
                )}

                {/* The Animated Column Stack */}
                <div
                  className="w-full max-w-[34px] rounded-t-md overflow-hidden flex flex-col-reverse shadow-md transition-transform duration-200"
                  style={{
                    height: `${Math.max(4, colHeightPx)}px`,
                    animation: `barGrowCascading 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 80}ms both`,
                    transformOrigin: 'bottom',
                    transform: isHovered ? 'scaleY(1.03) scaleX(1.06)' : 'none'
                  }}
                >
                  {/* Bottom: Employed */}
                  {employedPx > 0 && (
                    <div
                      style={{ height: `${employedPx}px`, backgroundColor: colors.employed }}
                      className="w-full transition-opacity duration-200 hover:brightness-110"
                    />
                  )}

                  {/* Middle: Studying */}
                  {studyingPx > 0 && (
                    <div
                      style={{ height: `${studyingPx}px`, backgroundColor: colors.studying }}
                      className="w-full transition-opacity duration-200 hover:brightness-110"
                    />
                  )}

                  {/* Top: NEET */}
                  {neetPx > 0 && (
                    <div
                      style={{ height: `${neetPx}px`, backgroundColor: colors.neet }}
                      className="w-full rounded-t-md transition-opacity duration-200 hover:brightness-110"
                    />
                  )}
                </div>

                {/* X-Axis Label */}
                <div className="mt-2 text-center w-full">
                  <span
                    className={`block text-[11px] font-medium transition-colors truncate transform -rotate-25 origin-top-left ${
                      isHovered ? 'text-indigo-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Custom Tooltip */}
        {hoveredMahalla && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#151922] border border-white/[0.14] rounded-xl p-3 shadow-2xl shadow-black/90 min-w-[190px] animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 10
            }}
          >
            <div className="text-xs font-bold text-white border-b border-white/[0.08] pb-1.5 mb-2">
              {hoveredMahalla.fullName}
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{labels.employed}:</span>
                </span>
                <strong className="text-white font-mono">{hoveredMahalla.employed} чел.</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>{labels.studying}:</span>
                </span>
                <strong className="text-white font-mono">{hoveredMahalla.studying} чел.</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{labels.neet}:</span>
                </span>
                <strong className="text-rose-400 font-mono">{hoveredMahalla.neet} чел.</strong>
              </div>

              <div className="pt-1.5 mt-1 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Всего в махалле:</span>
                <span className="font-mono text-white">{hoveredMahalla.total} чел.</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
