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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      
      {/* 1. Всего молодёжи */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-semibold">{lang === 'ru' ? 'Молодёжь (18–30)' : 'Ёшлар'}</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-extrabold text-white">{total}</div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {selectedMakhalla === 'all' ? (lang === 'ru' ? 'По району' : 'Туман бўйича') : selectedMakhalla}
        </div>
      </div>

      {/* 2. Занятые / Бизнес */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('занят')}
        className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-emerald-500/60 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-semibold group-hover:text-emerald-400 transition-colors">{lang === 'ru' ? 'Заняты / Бизнес' : 'Банд'}</span>
          <Briefcase className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-emerald-400">{employed}</span>
          <span className="text-xs text-emerald-300 font-semibold">{total > 0 ? Math.round((employed / total) * 100) : 0}%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {lang === 'ru' ? 'Трудоустроены' : 'Расмий банд'}
        </div>
      </div>

      {/* 3. Обучаются */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('обучается')}
        className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-cyan-500/60 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-semibold group-hover:text-cyan-400 transition-colors">{lang === 'ru' ? 'Обучаются' : 'Ўқимоқда'}</span>
          <GraduationCap className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-cyan-400">{studying}</span>
          <span className="text-xs text-cyan-300 font-semibold">{total > 0 ? Math.round((studying / total) * 100) : 0}%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {lang === 'ru' ? 'ВУЗы и техникумы' : 'Олий таълим'}
        </div>
      </div>

      {/* 4. Безработные */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('безработный')}
        className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-amber-500/60 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-semibold group-hover:text-amber-400 transition-colors">{lang === 'ru' ? 'Безработные' : 'Ишсизлар'}</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-amber-400">{unemployed}</span>
          <span className="text-xs text-amber-300 font-semibold">{total > 0 ? Math.round((unemployed / total) * 100) : 0}%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {lang === 'ru' ? 'Ищут работу' : 'Иш қидирмоқда'}
        </div>
      </div>

      {/* 5. NEET (На проверке) */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('neet_pending')}
        className="glass-panel p-4 rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900/90 hover:border-rose-400 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between text-rose-300 mb-1.5">
          <span className="text-xs font-bold">{lang === 'ru' ? 'NEET (Риск)' : 'NEET хавфи'}</span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-rose-400">{neetPending}</span>
          <span className="text-[11px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-semibold">
            {lang === 'ru' ? 'Проверка' : 'Текширув'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {lang === 'ru' ? 'Требуют визита' : 'Кўрик кутмоқда'}
        </div>
      </div>

      {/* 6. Охвачено господдержкой */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('supported')}
        className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-gov-400/60 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-semibold group-hover:text-gov-400 transition-colors">{lang === 'ru' ? 'Господдержка' : 'Давлат ёрдами'}</span>
          <CheckCircle2 className="w-4 h-4 text-gov-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-gov-400">{supported + training}</span>
          <span className="text-xs text-gov-300 font-semibold">чел.</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {lang === 'ru' ? 'Моноцентр & Гранты' : 'Мономарказ'}
        </div>
      </div>

    </div>
  );
};
