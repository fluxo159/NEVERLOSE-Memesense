import React, { useState } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  ArrowRight, Sparkles 
} from 'lucide-react';
import { SUPPORT_PROGRAMS } from '../data/supportPrograms';
import { YouthProfile } from '../types';

interface SupportProgramsViewProps {
  youthList: YouthProfile[];
  lang: 'ru' | 'uz';
  onNavigateRegistryWithFilter: (filter: string) => void;
}

export const SupportProgramsView: React.FC<SupportProgramsViewProps> = ({
  youthList,
  lang,
  onNavigateRegistryWithFilter
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: lang === 'ru' ? 'Все направления (6)' : 'Барча йўналишлар' },
    { id: 'обучение', label: lang === 'ru' ? 'Профобучение' : 'Касбга ўқитиш' },
    { id: 'it_стажировка', label: lang === 'ru' ? 'IT-Park' : 'IT-Park' },
    { id: 'субсидия', label: lang === 'ru' ? 'Субсидии «Ёшлар дафтари»' : 'Субсидиялар' },
    { id: 'предпринимательство', label: lang === 'ru' ? 'Микрокредиты' : 'Микрокредитлар' },
    { id: 'трудоустройство', label: lang === 'ru' ? 'Ярмарки вакансий' : 'Бўш иш ўринлари' },
  ];

  const filteredPrograms = SUPPORT_PROGRAMS.filter(prog => {
    if (selectedCategory === 'all') return true;
    return prog.category === selectedCategory;
  });

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'Code': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Gift': return <Gift className="w-5 h-5 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-400" />;
      default: return <Briefcase className="w-5 h-5 text-cyan-400" />;
    }
  };

  const totalSupported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'ru' 
                ? 'Реестр государственных программ поддержки' 
                : 'Давлат дастурлари реестри'}
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {lang === 'ru'
              ? 'Каталог действующих каналов содействия занятости: бесплатное обучение в Моноцентре, гранты на оборудование и льготные микрокредиты.'
              : 'Бандликка кўмаклашиш давлат дастурлари каталоги.'}
          </p>
        </div>

        <div className="bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700/80 text-center min-w-[140px]">
          <span className="text-xs text-slate-400 font-medium block">{lang === 'ru' ? 'Всего направлено' : 'Йўналтирилган'}</span>
          <span className="text-2xl font-black text-emerald-400">{totalSupported} чел.</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPrograms.map(prog => {
          const countAssigned = youthList.filter(y => y.assigned_program?.id === prog.id).length;
          const countRecommended = youthList.filter(y => y.support_recommendation.includes(prog.id)).length;

          return (
            <div
              key={prog.id}
              className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-lg hover:translate-y-[-2px]"
            >
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 flex-shrink-0">
                    {getProgramIcon(prog.iconName)}
                  </div>
                  <div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold uppercase tracking-wider">
                      {prog.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                      {prog.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1">
                      Провайдер: <span className="text-slate-200 font-medium">{prog.provider}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                  {prog.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs py-2 border-y border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Длительность:</span>
                    <strong className="text-white text-sm">{prog.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Стипендия / Грант:</span>
                    <strong className="text-emerald-400 text-sm">{prog.stipend}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Рекомендовано: <strong className="text-cyan-400">{countRecommended}</strong> • Направлено: <strong className="text-emerald-400">{countAssigned}</strong>
                </div>

                <button
                  onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                  className="px-4 py-2 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>Кандидаты</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
