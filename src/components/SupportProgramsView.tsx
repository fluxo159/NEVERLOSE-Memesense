import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  ArrowRight, Search, Plus, Layers, Filter, CheckCircle2, Sparkles, X
} from 'lucide-react';
import { YouthProfile, SupportProgram } from '../types';
import { t, getProgramCategoryName } from '../data/translations';

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
  const tr = t[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { 
      id: 'all', 
      label: tr.progCatAll, 
      count: supportPrograms.length,
      icon: Layers
    },
    { 
      id: 'обучение', 
      label: tr.progCatTraining, 
      count: supportPrograms.filter(p => p.category === 'обучение').length,
      icon: Wrench
    },
    { 
      id: 'it_стажировка', 
      label: tr.progCatIt, 
      count: supportPrograms.filter(p => p.category === 'it_стажировка').length,
      icon: Code
    },
    { 
      id: 'субсидия', 
      label: tr.progCatSubsidy, 
      count: supportPrograms.filter(p => p.category === 'субсидия').length,
      icon: Gift
    },
    { 
      id: 'предпринимательство', 
      label: tr.progCatCredit, 
      count: supportPrograms.filter(p => p.category === 'предпринимательство').length,
      icon: TrendingUp
    },
    { 
      id: 'трудоустройство', 
      label: tr.progCatJobs, 
      count: supportPrograms.filter(p => p.category === 'трудоустройство').length,
      icon: Briefcase
    },
  ];

  const filteredPrograms = useMemo(() => {
    return supportPrograms.filter(prog => {
      const matchesCategory = selectedCategory === 'all' || prog.category === selectedCategory;
      const title = (lang === 'uz' && prog.titleUz) ? prog.titleUz : prog.title;
      const description = (lang === 'uz' && prog.descriptionUz) ? prog.descriptionUz : prog.description;
      const provider = (lang === 'uz' && prog.providerUz) ? prog.providerUz : prog.provider;

      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [supportPrograms, selectedCategory, searchQuery, lang]);

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-slate-300" />;
      case 'Code': return <Code className="w-4 h-4 text-slate-300" />;
      case 'Gift': return <Gift className="w-4 h-4 text-slate-300" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-slate-300" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-slate-300" />;
      default: return <Briefcase className="w-4 h-4 text-slate-300" />;
    }
  };

  const totalSupported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* LEFT COLUMN: Sidebar (Search + Category Filter + Stats) */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
          
          {/* Search Box */}
          <div className="bg-surface-1 p-4 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'ru' ? 'Поиск программ' : 'Dasturlarni qidirish'}</span>
              </span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>{lang === 'ru' ? 'Сброс' : 'Tozalash'}</span>
                </button>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all shadow-inner"
                placeholder={tr.progSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Categories Sidebar Navigation */}
          <div className="bg-surface-1 p-4 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Направления' : 'Yo‘nalishlar'}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold font-mono">
                {supportPrograms.length} {lang === 'ru' ? 'всего' : 'jami'}
              </span>
            </div>

            <div className="space-y-1">
              {categories.map(cat => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-600/90 text-white font-semibold shadow-sm shadow-indigo-500/25 border border-indigo-500/30'
                        : 'bg-surface-2/40 hover:bg-surface-2 text-slate-300 hover:text-white border border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-3 text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Stats Summary Widget */}
          <div className="bg-surface-1 p-4 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ru' ? 'Охват программами' : 'Dasturlar qamrovi'}</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{tr.progAlreadyRouted}:</span>
                <span className="font-bold text-emerald-400">{totalSupported} {lang === 'ru' ? 'чел.' : 'kishi'}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalSupported / (youthList.length || 1)) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>{Math.round((totalSupported / (youthList.length || 1)) * 100)}% {lang === 'ru' ? 'от реестра' : 'reyestrdan'}</span>
                <span>{youthList.length} {lang === 'ru' ? 'чел. в базе' : 'kishi bazada'}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed px-0.5">
              {lang === 'ru' 
                ? 'Направляйте кандидатов категории NEET на обучение в Моноцентры, IT-стажировки и грантовые программы.' 
                : 'NEET toifasidagi yoshlarni Monomarkazlarga, IT-stajirovkalarga yo‘naltiring.'}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Vacancies & Programs List */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Header Bar */}
          <div className="bg-surface-1 p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-surface-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {currentCategoryObj?.label || tr.progHeaderTitle}
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-2 text-slate-300 border border-white/[0.08] font-semibold font-mono">
                  {filteredPrograms.length} {lang === 'ru' ? 'доступно' : 'mavjud'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {tr.progHeaderSubtitle}
              </p>
            </div>

            <button
              onClick={onOpenNewProgram}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>{tr.progBtnAdd}</span>
            </button>
          </div>

          {/* Cards Grid */}
          {filteredPrograms.length > 0 ? (
            <div key={selectedCategory} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredPrograms.map((prog, idx) => {
                const countAssigned = youthList.filter(y => y.assigned_program?.id === prog.id).length;
                const countRecommended = youthList.filter(y => y.support_recommendation.includes(prog.id)).length;
                const title = (lang === 'uz' && prog.titleUz) ? prog.titleUz : prog.title;
                const description = (lang === 'uz' && prog.descriptionUz) ? prog.descriptionUz : prog.description;
                const provider = (lang === 'uz' && prog.providerUz) ? prog.providerUz : prog.provider;
                const duration = (lang === 'uz' && prog.durationUz) ? prog.durationUz : prog.duration;
                const stipend = (lang === 'uz' && prog.stipendUz) ? prog.stipendUz : prog.stipend;

                return (
                  <div
                    key={prog.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="animate-card-cascade bg-surface-1 p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.16] transition-all shadow-surface-card flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      
                      {/* Top info row */}
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-surface-2 rounded-xl border border-white/[0.08] flex-shrink-0 mt-0.5 group-hover:border-white/[0.16] transition-colors">
                          {getProgramIcon(prog.iconName)}
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 border border-white/[0.08] text-slate-300 text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
                              <span>{getProgramCategoryName(prog.category, lang)}</span>
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white leading-snug">
                            {title}
                          </h3>
                          <div className="text-[11px] text-slate-400 truncate">
                            {tr.progProvider} <span className="text-slate-300 font-medium">{provider}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description Box */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-surface-2/60 p-3 rounded-xl border border-white/[0.04]">
                        {description}
                      </p>

                      {/* Duration & Stipend Stats */}
                      <div className="grid grid-cols-2 gap-3 text-xs py-2.5 px-3 bg-surface-2/40 rounded-xl border border-white/[0.04]">
                        <div>
                          <span className="text-slate-500 text-[11px] block">{tr.progDuration}</span>
                          <strong className="text-white text-xs mt-0.5 block font-semibold">{duration || '—'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px] block">{tr.progStipend}</span>
                          <strong className="text-slate-200 text-xs mt-0.5 block font-semibold">{stipend || '—'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>{tr.progRecommended} <strong className="text-slate-200 font-mono">{countRecommended}</strong></span>
                        <span>•</span>
                        <span>{tr.progRouted} <strong className="text-slate-200 font-mono">{countAssigned}</strong></span>
                      </div>

                      <button
                        onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                        className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-white/[0.08] transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                      >
                        <span>{tr.progBtnCandidates}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-surface-1 p-12 rounded-2xl border border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-surface-2 border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {lang === 'ru' ? 'Программы не найдены' : 'Dasturlar topilmadi'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'ru' 
                  ? 'Попробуйте изменить поисковый запрос или выбрать другое направление в левой колонке.' 
                  : 'Qidiruv so‘rovini o‘zgartirib ko‘ring yoki chap ustundan boshqa yo‘nalishni tanlang.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-slate-200 rounded-lg text-xs font-semibold border border-white/[0.08] transition-colors"
              >
                {tr.progCatAll}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
