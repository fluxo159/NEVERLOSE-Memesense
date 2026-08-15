import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, GraduationCap, Users, Briefcase } from 'lucide-react';
import { YouthProfile } from '../types';

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
  const total = youthList.length;
  const employed = youthList.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studying = youthList.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const neetPending = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const supported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const totalEngaged = employed + studying;
  const engagementPercent = total > 0 ? Math.round((totalEngaged / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
      
      {/* 1. PRIMARY HERO ACTION CARD (Apple HIG: Single Clear Priority + Linear Dark) */}
      <div 
        onClick={onNavigateTriage}
        className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-rose-500/40 bg-surface-1 hover:bg-surface-2 shadow-surface-card cursor-pointer hover:border-rose-500/70 transition-all flex flex-col justify-between group bg-gradient-to-b from-rose-950/20 via-surface-1 to-surface-1"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                {lang === 'ru' ? 'Главная задача на сегодня' : 'Бугунги асосий вазифа'}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{neetPending}</span>
              <span className="text-sm font-bold text-rose-300">
                {lang === 'ru' ? 'требуют проверки' : 'текширув кутмоқда'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {lang === 'ru'
                ? 'Молодёжь без официальной работы и учёбы. Необходим личный выездной визит инспектора.'
                : 'Расмий иши ва ўқиши бўлмаган ёшлар. Суҳбат асосида мақомни тасдиқлаш зарур.'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-300/90 truncate">
            {selectedMakhalla === 'all' ? (lang === 'ru' ? 'По всему району' : 'Туман бўйича') : `Махалля «${selectedMakhalla}»`}
          </span>
          <span className="text-xs font-bold text-rose-200 bg-rose-600/30 group-hover:bg-rose-600/50 border border-rose-500/40 px-3 py-1 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap">
            <span>{lang === 'ru' ? 'Начать проверку' : 'Текширувни бошлаш'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 2. THREE SECONDARY METRICS (Apple HIG: Deference & Clarity + Linear Surface) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Metric 1: Всего молодёжи */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-2 cursor-pointer transition-all flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">{lang === 'ru' ? 'Всего в реестре' : 'Жами рўйхатда'}</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1 tracking-tight">{total} <span className="text-xs font-normal text-slate-400">чел.</span></div>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06] font-medium">
            18–30 лет (8 махаллей)
          </div>
        </div>

        {/* Metric 2: Заняты или учатся */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('занят')}
          className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 hover:bg-surface-2 cursor-pointer transition-all flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">{lang === 'ru' ? 'Заняты / учатся' : 'Банд ёки ўқимоқда'}</span>
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-emerald-400 tracking-tight">{engagementPercent}%</span>
              <span className="text-[11px] font-semibold text-slate-400">({totalEngaged} чел.)</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06] font-medium">
            {employed} работают • {studying} учатся
          </div>
        </div>

        {/* Metric 3: Получили господдержку */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('supported')}
          className="bg-surface-1 p-3.5 rounded-xl border border-white/[0.08] hover:border-indigo-500/40 hover:bg-surface-2 cursor-pointer transition-all flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">{lang === 'ru' ? 'Получили помощь' : 'Ёрдам олган'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400 mt-1 tracking-tight">{supported} <span className="text-xs font-normal text-slate-400">чел.</span></div>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06] font-medium">
            Моноцентр, IT и гранты
          </div>
        </div>

      </div>

    </div>
  );
};
