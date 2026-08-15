import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  ArrowRight, Search, Plus
} from 'lucide-react';
import { YouthProfile, SupportProgram } from '../types';

interface SupportProgramsViewProps {
  youthList: YouthProfile[];
  supportPrograms: SupportProgram[];
  lang: 'ru' | 'uz';
  onNavigateRegistryWithFilter: (filter: string) => void;
  onOpenNewProgram: () => void;
}

export const SupportProgramsView: React.FC<SupportProgramsViewProps> = ({
  youthList,
  supportPrograms,
  lang,
  onNavigateRegistryWithFilter,
  onOpenNewProgram
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: lang === 'ru' ? 'Все направления' : 'Барча йўналишлар', count: supportPrograms.length },
    { id: 'обучение', label: lang === 'ru' ? 'Профобучение' : 'Касбга ўқитиш', count: supportPrograms.filter(p => p.category === 'обучение').length },
    { id: 'it_стажировка', label: lang === 'ru' ? 'IT-Park' : 'IT-Park', count: supportPrograms.filter(p => p.category === 'it_стажировка').length },
    { id: 'субсидия', label: lang === 'ru' ? 'Субсидии «Ёшлар дафтари»' : 'Субсидиялар', count: supportPrograms.filter(p => p.category === 'субсидия').length },
    { id: 'предпринимательство', label: lang === 'ru' ? 'Микрокредиты' : 'Микрокредитлар', count: supportPrograms.filter(p => p.category === 'предпринимательство').length },
    { id: 'трудоустройство', label: lang === 'ru' ? 'Ярмарки вакансий' : 'Бўш иш ўринлари', count: supportPrograms.filter(p => p.category === 'трудоустройство').length },
  ];

  const filteredPrograms = useMemo(() => {
    return supportPrograms.filter(prog => {
      const matchesCategory = selectedCategory === 'all' || prog.category === selectedCategory;
      const matchesSearch = 
        prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, supportPrograms]);

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'Code': return <Code className="w-4 h-4 text-cyan-400" />;
      case 'Gift': return <Gift className="w-4 h-4 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      default: return <Briefcase className="w-4 h-4 text-indigo-400" />;
    }
  };

  const totalSupported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-surface-1 p-5 rounded-2xl border border-white/[0.08] shadow-surface-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {lang === 'ru' 
                  ? 'Реестр государственных программ поддержки' 
                  : 'Давлат дастурлари реестри'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {lang === 'ru' 
                  ? `Найдено ${filteredPrograms.length} программ для молодежи.` 
                  : `Ёшлар учун ${filteredPrograms.length} та дастур топилди.`}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'ru'
              ? 'Каталог действующих каналов содействия занятости: бесплатное обучение в Моноцентре, гранты на оборудование и льготные микрокредиты.'
              : 'Бандликка кўмаклашиш давлат дастурлари каталоги.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-surface-2 px-4 py-2.5 rounded-xl border border-white/[0.08] flex flex-col items-start md:items-end">
            <span className="text-[11px] text-slate-400">{lang === 'ru' ? 'Уже направлено' : 'Йўналтирилган'}</span>
            <span className="text-base font-bold text-emerald-400">{totalSupported} чел.</span>
          </div>

          <button
            onClick={onOpenNewProgram}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Добавить вакансию' : 'Вакансия қўшиш'}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-1 border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            placeholder={lang === 'ru' ? 'Поиск по названию, провайдеру или ключевым словам...' : 'Номи, провайдер ёки калит сўзлар бўйича қидириш...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                  : 'bg-surface-1 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map(prog => {
          const countAssigned = youthList.filter(y => y.assigned_program?.id === prog.id).length;
          const countRecommended = youthList.filter(y => y.support_recommendation.includes(prog.id)).length;

          return (
            <div
              key={prog.id}
              className="bg-surface-1 p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between hover:border-white/[0.18] transition-all shadow-surface-card"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-surface-2 rounded-xl border border-white/[0.08] flex-shrink-0">
                    {getProgramIcon(prog.iconName)}
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase tracking-wider">
                      {prog.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                      {prog.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Провайдер: <span className="text-slate-200 font-medium">{prog.provider}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-surface-2/70 p-2.5 rounded-xl border border-white/[0.06]">
                  {prog.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/[0.06]">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Длительность:</span>
                    <strong className="text-white text-xs">{prog.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Стипендия / Грант:</span>
                    <strong className="text-emerald-400 text-xs">{prog.stipend}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-1 flex items-center justify-between border-t border-white/[0.06]">
                <div className="text-[11px] text-slate-400">
                  Рекомендовано: <strong className="text-indigo-400">{countRecommended}</strong> • Направлено: <strong className="text-emerald-400">{countAssigned}</strong>
                </div>

                <button
                  onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-white/[0.08] transition-all flex items-center gap-1.5"
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
