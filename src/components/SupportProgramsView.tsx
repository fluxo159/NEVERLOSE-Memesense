import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase, 
  ArrowRight, Search, Plus
} from 'lucide-react';
import { YouthProfile, SupportProgram } from '../types';
import { t } from '../data/translations';

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
    { id: 'all', label: tr.progCatAll, count: supportPrograms.length },
    { id: 'обучение', label: tr.progCatTraining, count: supportPrograms.filter(p => p.category === 'обучение').length },
    { id: 'it_стажировка', label: tr.progCatIt, count: supportPrograms.filter(p => p.category === 'it_стажировка').length },
    { id: 'субсидия', label: tr.progCatSubsidy, count: supportPrograms.filter(p => p.category === 'субсидия').length },
    { id: 'предпринимательство', label: tr.progCatCredit, count: supportPrograms.filter(p => p.category === 'предпринимательство').length },
    { id: 'трудоустройство', label: tr.progCatJobs, count: supportPrograms.filter(p => p.category === 'трудоустройство').length },
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
  }, [supportPrograms, selectedCategory, searchQuery]);

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-slate-400" />;
      case 'Code': return <Code className="w-4 h-4 text-slate-400" />;
      case 'Gift': return <Gift className="w-4 h-4 text-slate-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-slate-400" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-slate-400" />;
      default: return <Briefcase className="w-4 h-4 text-slate-400" />;
    }
  };

  const totalSupported = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-surface-1 p-5 rounded-2xl border border-white/[0.08] shadow-surface-card bg-gradient-to-r from-surface-1 via-surface-2 to-surface-1">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {tr.progHeaderTitle}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                ({filteredPrograms.length} {lang === 'ru' ? 'программ' : 'та дастур'})
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
              {tr.progHeaderSubtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
            <button
              onClick={onOpenNewProgram}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-brand transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{tr.progBtnAdd}</span>
            </button>
            <div className="bg-surface-2 px-4 py-2 rounded-xl border border-white/[0.08] text-right min-w-[120px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{tr.progAlreadyRouted}</span>
              <div className="text-lg font-bold text-emerald-400">{totalSupported} {tr.kpiPersons}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Categories */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full bg-surface-2 border border-white/[0.08] rounded-lg focus-within:border-indigo-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            placeholder={tr.progSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                  : 'bg-surface-2 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {cat.label}
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
              className="bg-surface-1 p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between hover:border-white/[0.18] transition-all shadow-surface-card space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-surface-2 rounded-xl border border-white/[0.08] flex-shrink-0 mt-0.5">
                    {getProgramIcon(prog.iconName)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase tracking-wider">
                      {prog.category}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {prog.title}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      {tr.progProvider} <span className="text-slate-200 font-medium">{prog.provider}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-2/70 p-3 rounded-xl border border-white/[0.06]">
                  {prog.description}
                </p>

                {/* Duration & Stipend Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs py-2.5 px-3 bg-surface-2/40 rounded-xl border border-white/[0.06]">
                  <div>
                    <span className="text-slate-500 text-[11px] block">{tr.progDuration}</span>
                    <strong className="text-white text-xs mt-0.5 block">{prog.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{tr.progStipend}</span>
                    <strong className="text-emerald-400 text-xs mt-0.5 block">{prog.stipend}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  {tr.progRecommended} <strong className="text-indigo-400">{countRecommended}</strong> • {tr.progRouted} <strong className="text-emerald-400">{countAssigned}</strong>
                </div>

                <button
                  onClick={() => onNavigateRegistryWithFilter('neet_pending')}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-white/[0.08] transition-all flex items-center gap-1.5"
                >
                  <span>{tr.progBtnCandidates}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
