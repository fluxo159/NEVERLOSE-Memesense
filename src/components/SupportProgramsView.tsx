import React, { useState } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  CheckCircle2, Users, ArrowRight, ExternalLink, ShieldCheck, Sparkles 
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
    { id: 'обучение', label: lang === 'ru' ? 'Профобучение (Моноцентр)' : 'Касбга ўқитиш' },
    { id: 'it_стажировка', label: lang === 'ru' ? 'IT-Park и цифра' : 'IT-Park дастурлари' },
    { id: 'субсидия', label: lang === 'ru' ? 'Субсидии и гранты' : 'Субсидия ва грантлар' },
    { id: 'предпринимательство', label: lang === 'ru' ? 'Микрокредитование' : 'Микрокредитлар' },
    { id: 'трудоустройство', label: lang === 'ru' ? 'Ярмарки вакансий' : 'Бўш иш ўринлари' },
  ];

  const filteredPrograms = SUPPORT_PROGRAMS.filter(prog => {
    if (selectedCategory === 'all') return true;
    return prog.category === selectedCategory;
  });

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-6 h-6 text-amber-400" />;
      case 'Code': return <Code className="w-6 h-6 text-cyan-400" />;
      case 'Gift': return <Gift className="w-6 h-6 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-blue-400" />;
      default: return <Briefcase className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'ru' 
                ? 'Единый каталог государственных программ содействия занятости' 
                : 'Ёшлар бандлигига кўмаклашиш давлат дастурлари реестри'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {lang === 'ru'
                ? 'Платформа автоматически сопоставляет профили безработных и NEET-молодёжи с действующими квотами моноцентров, субсидиями «Ёшлар дафтари» и IT-ваучерами.'
                : 'Тизим ишсиз ёшларни Мономарказ, «Ёшлар дафтари» субсидиялари ва IT-ваучерлар билан интеграция қилади.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-right">
          <span className="text-xs text-slate-400 block">{lang === 'ru' ? 'Всего направлено' : 'Йўналтирилганлар'}</span>
          <span className="text-xl font-bold text-emerald-400">
            {youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length} чел.
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-gov-600 to-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
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
              className="glass-panel p-5 rounded-3xl border border-slate-700/60 bg-slate-900/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 group-hover:border-cyan-500/50 transition-colors flex-shrink-0">
                    {getProgramIcon(prog.iconName)}
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold uppercase tracking-wider">
                      {prog.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors leading-snug">
                      {prog.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Провайдер: <span className="text-slate-300 font-medium">{prog.provider}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 my-3">
                  {prog.description}
                </p>

                {/* Terms */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Длительность:</span>
                    <strong className="text-white">{prog.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Стипендия / Грант:</span>
                    <strong className="text-emerald-400">{prog.stipend}</strong>
                  </div>
                </div>
              </div>

              {/* Stats & Match */}
              <div className="pt-4 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Рекомендовано:</span>
                    <strong className="text-cyan-400">{countRecommended} чел.</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Направлено:</span>
                    <strong className="text-emerald-400">{countAssigned} чел.</strong>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1"
                >
                  <span>Подобрать кандидатов</span>
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
