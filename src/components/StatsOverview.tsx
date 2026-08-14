import React from 'react';
import { Users, Briefcase, GraduationCap, AlertOctagon, ArrowUpRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { YouthProfile } from '../types';

interface StatsOverviewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  lang: 'ru' | 'uz';
  onFilterStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  youthList,
  selectedMakhalla,
  lang,
  onFilterStatus
}) => {
  const total = youthList.length;
  const employed = youthList.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studying = youthList.filter(y => y.employment_status === 'обучается').length;
  const unemployed = youthList.filter(y => y.employment_status === 'безработный').length;
  const training = youthList.filter(y => y.employment_status === 'направлен на обучение').length;
  
  const neetPending = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const neetVerified = youthList.filter(y => y.is_neet && y.neet_verification === 'verified').length;
  const supported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const employmentRate = total > 0 ? Math.round(((employed + studying) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* 1. Всего молодёжи */}
      <div className="glass-card p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'Молодёжь (18–30)' : 'Ёшлар сони'}</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-[11px] text-cyan-400 font-medium">100%</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
          <span>{selectedMakhalla === 'all' ? (lang === 'ru' ? 'По всему району' : 'Туман бўйича') : selectedMakhalla}</span>
        </div>
      </div>

      {/* 2. Занятые / Бизнес */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('занят')}
        className="glass-card p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 hover:border-emerald-500/50 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'Заняты / Бизнес' : 'Банд / Бизнес'}</span>
          <Briefcase className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{employed}</span>
          <span className="text-[11px] text-emerald-300 font-medium">{total > 0 ? Math.round((employed / total) * 100) : 0}%</span>
        </div>
        <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(employed / Math.max(total, 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 3. Обучаются */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('обучается')}
        className="glass-card p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 hover:border-cyan-500/50 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'Обучаются (ВУЗ/Колледж)' : 'Ўқимоқда (ОЎЮ/Коллеж)'}</span>
          <GraduationCap className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-cyan-400">{studying}</span>
          <span className="text-[11px] text-cyan-300 font-medium">{total > 0 ? Math.round((studying / total) * 100) : 0}%</span>
        </div>
        <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(studying / Math.max(total, 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Безработные */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('безработный')}
        className="glass-card p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 hover:border-amber-500/50 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'Безработные' : 'Ишсизлар'}</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{unemployed}</span>
          <span className="text-[11px] text-amber-300 font-medium">{total > 0 ? Math.round((unemployed / total) * 100) : 0}%</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400/80">
          <span>Целевая группа ЦЗН</span>
        </div>
      </div>

      {/* 5. NEET: Требует проверки */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('neet_pending')}
        className="glass-card p-3.5 rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 via-slate-800/80 to-slate-900/90 hover:border-rose-500/70 cursor-pointer transition-all relative"
      >
        <div className="flex items-center justify-between text-rose-300 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'NEET (На проверке)' : 'NEET (Текширувда)'}</span>
          <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400">{neetPending}</span>
          <span className="text-[11px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
            {lang === 'ru' ? 'Внимание' : 'Диққат'}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{lang === 'ru' ? 'Подтверждено:' : 'Тасдиқланган:'}</span>
          <span className="text-slate-200 font-bold">{neetVerified}</span>
        </div>
      </div>

      {/* 6. Охвачено господдержкой */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('supported')}
        className="glass-card p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/90 hover:border-gov-400/50 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">{lang === 'ru' ? 'Охват мерами' : 'Дастурлар қамрови'}</span>
          <CheckCircle2 className="w-4 h-4 text-gov-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gov-400">{supported + training}</span>
          <span className="text-[11px] text-gov-300 font-medium">
            {total > 0 ? Math.round(((supported + training) / Math.max(unemployed + neetPending, 1)) * 100) : 0}% нужд.
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'Моноцентр & Субсидии' : 'Мономарказ & Субсидия'}</span>
        </div>
      </div>

    </div>
  );
};
