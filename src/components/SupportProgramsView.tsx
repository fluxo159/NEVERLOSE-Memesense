import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  ArrowRight, Search, MapPin, Building, Clock, Filter
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
  }, [selectedCategory, searchQuery]);

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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Search & Banner Area */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              {lang === 'ru' ? 'Поиск программ поддержки' : 'Қўллаб-қувватлаш дастурларини қидириш'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'ru' 
                ? `Найдено ${filteredPrograms.length} программ для молодежи.` 
                : `Ёшлар учун ${filteredPrograms.length} та дастур топилди.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewProgram}
              className="hidden md:flex px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all items-center gap-2"
            >
              <span>{lang === 'ru' ? '+ Добавить вакансию' : '+ Вакансия қўшиш'}</span>
            </button>
            <div className="bg-slate-800/90 px-5 py-2.5 rounded-xl border border-slate-700/50 flex flex-col items-end">
              <span className="text-xs text-slate-400">{lang === 'ru' ? 'Уже направлено' : 'Йўналтирилган'}</span>
              <span className="text-xl font-bold text-emerald-400">{totalSupported} чел.</span>
            </div>
          </div>
        </div>

        {/* Mobile Add Button */}
        <button
          onClick={onOpenNewProgram}
          className="w-full md:hidden py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
        >
          <span>{lang === 'ru' ? '+ Добавить вакансию' : '+ Вакансия қўшиш'}</span>
        </button>

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-base shadow-inner"
            placeholder={lang === 'ru' ? 'Поиск по названию, провайдеру или ключевым словам...' : 'Номи, провайдер ёки калит сўзлар бўйича қидириш...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 flex-shrink-0 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/80 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {lang === 'ru' ? 'Категории' : 'Категориялар'}
              </h3>
            </div>
            
            <div className="space-y-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-600/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main List Area */}
        <div className="w-full lg:w-3/4 space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border border-slate-700/60 bg-slate-900/40">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-300">
                {lang === 'ru' ? 'Ничего не найдено' : 'Ҳеч нарса топилмади'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {lang === 'ru' ? 'Попробуйте изменить поисковой запрос или фильтры.' : 'Қидирув сўровини ёки фильтрларни ўзгартириб кўринг.'}
              </p>
            </div>
          ) : (
            filteredPrograms.map(prog => {
              const countAssigned = youthList.filter(y => y.assigned_program?.id === prog.id).length;
              const countRecommended = youthList.filter(y => y.support_recommendation.includes(prog.id)).length;

              return (
                <div
                  key={prog.id}
                  className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-cyan-500/40 transition-all shadow-md group flex flex-col sm:flex-row gap-5"
                >
                  {/* Icon Area */}
                  <div className="hidden sm:flex flex-shrink-0 items-start pt-1">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-cyan-500/30 group-hover:bg-slate-900 transition-colors">
                      {getProgramIcon(prog.iconName)}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors cursor-pointer">
                          {prog.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-300 mt-1">
                          <Building className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{prog.provider}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-base sm:text-lg font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20 whitespace-nowrap block">
                          {prog.stipend}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {prog.duration}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Ташкент, Мирзо-Улугбек
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 uppercase font-bold tracking-wide">
                        {prog.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/60 gap-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span className="text-slate-400">
                            {lang === 'ru' ? 'Рекомендовано: ' : 'Тавсия этилган: '} 
                            <strong className="text-white">{countRecommended}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-slate-400">
                            {lang === 'ru' ? 'Направлено: ' : 'Йўналтирилган: '} 
                            <strong className="text-white">{countAssigned}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span>{lang === 'ru' ? 'Подобрать кандидатов' : 'Номзодларни танлаш'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
      </div>
    </div>
  );
};
