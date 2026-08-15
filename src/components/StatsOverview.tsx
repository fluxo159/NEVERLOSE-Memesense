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

  const isAllClear = neetPending === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* 1. PRIMARY HERO ACTION CARD (Apple HIG: Single Clear Priority & Positive Reinforcement) */}
      <div 
        onClick={onNavigateTriage}
        className={`lg:col-span-5 p-5 rounded-2xl border-2 bg-gradient-to-r via-slate-900 to-slate-900 shadow-xl cursor-pointer transition-all flex flex-col justify-between group ${
          isAllClear 
            ? 'border-emerald-500/50 hover:border-emerald-400 from-emerald-950/40' 
            : 'border-rose-500/60 hover:border-rose-400 from-rose-950/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAllClear ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isAllClear ? 'text-emerald-400' : 'text-rose-300'}`}>
                {isAllClear 
                  ? (lang === 'ru' ? 'Задач на сегодня нет' : 'Бугунги вазифалар йўқ')
                  : (lang === 'ru' ? 'Главная задача на сегодня' : 'Бугунги асосий вазифа')}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-black text-white">{neetPending}</span>
              <span className={`text-base font-bold ${isAllClear ? 'text-emerald-300/80' : 'text-rose-200'}`}>
                {isAllClear 
                  ? (lang === 'ru' ? 'ожидают проверки' : 'текширув кутмоқда')
                  : (lang === 'ru' ? 'требуют проверки' : 'текширув кутмоқда')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed pr-2">
              {isAllClear 
                ? (lang === 'ru' 
                    ? 'Отличная работа! Все молодые люди без официальной занятости проверены. База в актуальном состоянии.' 
                    : 'Жуда яхши! Барча ишсиз ёшлар текширилди. База актуаль ҳолатда.')
                : (lang === 'ru' 
                    ? 'Молодёжь без официальной работы и учёбы. Необходим личный выездной визит инспектора.' 
                    : 'Расмий иши ва ўқиши бўлмаган ёшлар. Суҳбат асосида мақомни тасдиқлаш зарур.')}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border flex-shrink-0 group-hover:scale-110 transition-transform ${
            isAllClear 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            {isAllClear ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </div>

        <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isAllClear ? 'border-emerald-900/40' : 'border-rose-900/40'}`}>
          <span className={`text-xs font-semibold ${isAllClear ? 'text-emerald-300/80' : 'text-rose-300'}`}>
            {selectedMakhalla === 'all' ? (lang === 'ru' ? 'По всему району' : 'Туман бўйича') : `Махалля «${selectedMakhalla}»`}
          </span>
          <span className={`text-xs font-bold text-white px-3.5 py-1.5 rounded-xl shadow transition-colors flex items-center gap-1.5 ${
            isAllClear ? 'bg-emerald-600 group-hover:bg-emerald-500' : 'bg-rose-600 group-hover:bg-rose-500'
          }`}>
            <span>
              {isAllClear 
                ? (lang === 'ru' ? 'Всё проверено' : 'Барчаси текширилган') 
                : (lang === 'ru' ? 'Начать проверку' : 'Текширувни бошлаш')}
            </span>
            {!isAllClear && <ArrowRight className="w-3.5 h-3.5" />}
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
            <div className="text-4xl font-black text-white mt-1.5">{total} <span className="text-sm font-normal text-slate-500">чел.</span></div>
            <div className="mt-3 text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {lang === 'ru' ? 'База актуальна (онлайн)' : 'База янгиланган (онлайн)'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-slate-800/80">
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
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-4xl font-black text-emerald-400">{engagementPercent}%</span>
              <span className="text-sm font-medium text-slate-500">({totalEngaged} чел.)</span>
            </div>
            <div className="mt-3.5 w-full bg-slate-800 rounded-full h-1.5 border border-slate-700/50 overflow-hidden relative">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full absolute left-0 top-0 transition-all duration-1000" 
                style={{ width: `${engagementPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-slate-800/80">
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
            <div className="text-4xl font-black text-cyan-400 mt-1.5">{supported} <span className="text-sm font-normal text-slate-500">чел.</span></div>
            <div className="mt-3 text-[11px] text-cyan-400/90 font-medium flex items-center gap-1.5">
              <div className="flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                +12%
              </div>
              <span>{lang === 'ru' ? 'Рост за этот месяц' : 'Шу ойдаги ўсиш'}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-slate-800/80">
            Моноцентр, IT и гранты
          </div>
        </div>

      </div>

    </div>
  );
};
