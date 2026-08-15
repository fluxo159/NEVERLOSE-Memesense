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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* 1. PRIMARY HERO ACTION CARD (Apple HIG: Single Clear Priority) */}
      <div 
        onClick={onNavigateTriage}
        className="lg:col-span-5 p-5 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 shadow-xl cursor-pointer hover:border-rose-400 transition-all flex flex-col justify-between group"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                {lang === 'ru' ? 'Главная задача на сегодня' : 'Бугунги асосий вазифа'}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-black text-white">{neetPending}</span>
              <span className="text-base font-bold text-rose-200">
                {lang === 'ru' ? 'требуют проверки' : 'текширув кутмоқда'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {lang === 'ru'
                ? 'Молодёжь без официальной работы и учёбы. Необходим личный выездной визит инспектора.'
                : 'Расмий иши ва ўқиши бўлмаган ёшлар. Суҳбат асосида мақомни тасдиқлаш зарур.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-900/40 flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-300">
            {selectedMakhalla === 'all' ? (lang === 'ru' ? 'По всему району' : 'Туман бўйича') : `Махалля «${selectedMakhalla}»`}
          </span>
          <span className="text-xs font-bold text-white bg-rose-600 group-hover:bg-rose-500 px-3.5 py-1.5 rounded-xl shadow transition-colors flex items-center gap-1.5">
            <span>{lang === 'ru' ? 'Начать проверку' : 'Текширувни бошлаш'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 2. THREE CALM SECONDARY CONTEXT METRICS (Apple HIG: Deference & Clarity) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Metric 1: Всего молодёжи */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-slate-500 cursor-pointer transition-all flex flex-col justify-between shadow-md"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{lang === 'ru' ? 'Всего в реестре' : 'Жами рўйхатда'}</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{total} <span className="text-xs font-normal text-slate-400">чел.</span></div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            18–30 лет (8 махаллей)
          </div>
        </div>

        {/* Metric 2: Заняты или учатся */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('занят')}
          className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-emerald-500/60 cursor-pointer transition-all flex flex-col justify-between shadow-md"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{lang === 'ru' ? 'Заняты или учатся' : 'Банд ёки ўқимоқда'}</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-400">{engagementPercent}%</span>
              <span className="text-xs font-semibold text-slate-300">({totalEngaged} чел.)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            {employed} работают • {studying} учатся
          </div>
        </div>

        {/* Metric 3: Получили господдержку */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('supported')}
          className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-cyan-500/60 cursor-pointer transition-all flex flex-col justify-between shadow-md"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">{lang === 'ru' ? 'Получили помощь' : 'Ёрдам олган'}</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{supported} <span className="text-xs font-normal text-slate-400">чел.</span></div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Моноцентр, IT и гранты
          </div>
        </div>

      </div>

    </div>
  );
};
