import React from 'react';
import { Users, Briefcase, GraduationCap, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';
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
  const supported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* 1. Всего молодёжи */}
      <div className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] shadow-sm hover:border-white/[0.16] transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">{lang === 'ru' ? 'Молодёжь' : 'Ёшлар'}</span>
          <Users className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{total}</div>
        <div className="text-[10px] text-slate-500 mt-1 truncate font-medium">
          {selectedMakhalla === 'all' ? (lang === 'ru' ? 'По всему району' : 'Туман бўйича') : selectedMakhalla}
        </div>
      </div>

      {/* 2. Занятые / Бизнес */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('занят')}
        className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all shadow-sm group hover:bg-surface-2"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors tracking-wide uppercase">
            {lang === 'ru' ? 'Заняты' : 'Банд'}
          </span>
          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">{employed}</span>
          <span className="text-[11px] text-emerald-500/80 font-bold">{total > 0 ? Math.round((employed / total) * 100) : 0}%</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">
          {lang === 'ru' ? 'Трудоустроены' : 'Расмий банд'}
        </div>
      </div>

      {/* 3. Обучаются */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('обучается')}
        className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group hover:bg-surface-2"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors tracking-wide uppercase">
            {lang === 'ru' ? 'Студенты' : 'Талабалар'}
          </span>
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-cyan-400 tracking-tight">{studying}</span>
          <span className="text-[11px] text-cyan-500/80 font-bold">{total > 0 ? Math.round((studying / total) * 100) : 0}%</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">
          {lang === 'ru' ? 'ВУЗы и техникумы' : 'Олий таълим'}
        </div>
      </div>

      {/* 4. Безработные */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('безработный')}
        className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all shadow-sm group hover:bg-surface-2"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-400 transition-colors tracking-wide uppercase">
            {lang === 'ru' ? 'Безработные' : 'Ишсизлар'}
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">{unemployed}</span>
          <span className="text-[11px] text-amber-500/80 font-bold">{total > 0 ? Math.round((unemployed / total) * 100) : 0}%</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">
          {lang === 'ru' ? 'В поиске работы' : 'Иш қидирмоқда'}
        </div>
      </div>

      {/* 5. NEET (На проверке) */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('neet_pending')}
        className="bg-surface-1 p-3.5 rounded-xl border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all shadow-sm group hover:bg-surface-2 bg-gradient-to-b from-rose-950/15 to-transparent"
      >
        <div className="flex items-center justify-between text-rose-300 mb-1">
          <span className="text-[11px] font-bold text-rose-400 tracking-wide uppercase">
            {lang === 'ru' ? 'NEET Риск' : 'NEET хавфи'}
          </span>
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">{neetPending}</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold uppercase tracking-wider">
            {lang === 'ru' ? 'Проверка' : 'Кўрик'}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">
          {lang === 'ru' ? 'Требуют визита' : 'Кўрик кутмоқда'}
        </div>
      </div>

      {/* 6. Охвачено господдержкой */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('supported')}
        className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-indigo-500/40 cursor-pointer transition-all shadow-sm group hover:bg-surface-2"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors tracking-wide uppercase">
            {lang === 'ru' ? 'Господдержка' : 'Ёрдам'}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-indigo-400 tracking-tight">{supported + training}</span>
          <span className="text-[10px] text-indigo-300/80 font-bold">чел.</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">
          {lang === 'ru' ? 'Моноцентр & IT-Park' : 'Мономарказ'}
        </div>
      </div>

    </div>
  );
};
