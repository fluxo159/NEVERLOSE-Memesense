import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Users, Briefcase } from 'lucide-react';
import { YouthProfile } from '../types';
import { t, getMahallaName } from '../data/translations';

interface StatsOverviewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  lang: 'ru' | 'uz';
  onFilterStatus?: (status: string) => void;
  onNavigateTriage?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  youthList,
  selectedMakhalla,
  lang,
  onFilterStatus,
  onNavigateTriage
}) => {
  const tr = t[lang];
  const total = youthList.length;
  const employed = youthList.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studying = youthList.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const neetPending = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const supported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const totalEngaged = employed + studying;
  const engagementPercent = total > 0 ? Math.round((totalEngaged / total) * 100) : 0;
  const isAllClear = neetPending === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* 1. PRIMARY HERO ACTION CARD (Noticeable yet clean Linear Dark style) */}
      <div 
        onClick={onNavigateTriage}
        className={`lg:col-span-5 p-5 rounded-2xl border bg-surface-1 shadow-surface-card cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${
          isAllClear 
            ? 'border-emerald-500/30 hover:border-emerald-500/60' 
            : 'border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-glow-brand'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAllClear ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`}></span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isAllClear ? 'text-emerald-400' : 'text-indigo-300'}`}>
                {isAllClear ? tr.kpiAllClearTitle : tr.kpiNeedsActionTitle}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-4xl font-black text-white">{neetPending}</span>
              <span className="text-sm font-semibold text-slate-300">
                {isAllClear 
                  ? (lang === 'ru' ? 'ожидают проверки' : 'kishi kutmoqda')
                  : (lang === 'ru' ? 'требуют проверки' : 'kishi tekshiruvda')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pr-2">
              {isAllClear ? tr.kpiAllClearDesc : tr.kpiPendingNeetDesc}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.18] transition-colors">
            {isAllClear ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-indigo-400" />
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            {selectedMakhalla === 'all' 
              ? tr.kpiThroughoutDistrict 
              : `${tr.makhallaPrefix} «${getMahallaName(selectedMakhalla, lang)}»`}
          </span>
          <span className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all flex items-center gap-1.5 ${
            isAllClear 
              ? 'bg-emerald-600 group-hover:bg-emerald-500' 
              : 'bg-indigo-600 group-hover:bg-indigo-500 shadow-indigo-500/25'
          }`}>
            <span>{isAllClear ? tr.kpiBtnAllClear : tr.kpiBtnStartTriage}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* 2. THREE CALM SECONDARY CONTEXT METRICS */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 h-full">
        
        {/* Metric 1: Всего молодёжи */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="h-full bg-surface-1 p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] cursor-pointer transition-all flex flex-col justify-between shadow-surface-card"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{tr.kpiTotalInRegistry}</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-4xl font-black text-white mt-1.5">{total} <span className="text-sm font-normal text-slate-500">{tr.kpiPersons}</span></div>
            <div className="mt-3 text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {tr.kpiActiveDb}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-white/[0.06]">
            {tr.kpiAgeSpan}
          </div>
        </div>

        {/* Metric 2: Заняты или учатся */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('занят')}
          className="h-full bg-surface-1 p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] cursor-pointer transition-all flex flex-col justify-between shadow-surface-card"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{tr.kpiEngaged}</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-4xl font-black text-emerald-400">{engagementPercent}%</span>
              <span className="text-sm font-medium text-slate-500">({totalEngaged} {tr.kpiPersons})</span>
            </div>
            <div className="mt-3.5 w-full bg-surface-3 rounded-full h-1.5 border border-white/[0.04] overflow-hidden relative">
              <div 
                className="bg-emerald-500 h-full rounded-full absolute left-0 top-0 transition-all duration-1000" 
                style={{ width: `${engagementPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-white/[0.06]">
            {employed} {tr.kpiWorkingCount} • {studying} {tr.kpiStudyingCount}
          </div>
        </div>

        {/* Metric 3: Получили господдержку */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('supported')}
          className="h-full bg-surface-1 p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] cursor-pointer transition-all flex flex-col justify-between shadow-surface-card"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{tr.kpiSupported}</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-4xl font-black text-slate-100 mt-1.5">{supported} <span className="text-sm font-normal text-slate-500">{tr.kpiPersons}</span></div>
            <div className="mt-3 text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <div className="flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-3 text-emerald-400 border border-white/[0.08]">
                +12%
              </div>
              <span>{tr.kpiGrowthMonth}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-white/[0.06]">
            {tr.kpiMonoAndGrants}
          </div>
        </div>

      </div>

    </div>
  );
};
