import React, { useState } from 'react';
import { 
  Search, Download, UserPlus, MapPin, SlidersHorizontal, LayoutGrid, List, Users,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Upload, User, Briefcase,
  GraduationCap, Building2, Calendar
} from 'lucide-react';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { useYouthFilters } from '../hooks/useYouthFilters';
import { usePagination } from '../hooks/usePagination';
import { StatusBadge } from './StatusBadge';
import { CustomSelect } from './ui/CustomSelect';
import { FilterToggle } from './ui/FilterToggle';
import { t, getMahallaName, getEducationName } from '../data/translations';

interface YouthRegistryViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onOpenProfile: (youth: YouthProfile) => void;
  onOpenNewYouth: () => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  initialFilterStatus?: string;
}

export const YouthRegistryView: React.FC<YouthRegistryViewProps> = ({
  youthList,
  selectedMakhalla,
  lang,
  onOpenProfile,
  onOpenNewYouth,
  onOpenExport,
  onOpenImport,
  initialFilterStatus
}) => {
  const tr = t[lang];
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    makhallaFilter, setMakhallaFilter,
    genderFilter, setGenderFilter,
    ageFilter, setAgeFilter,
    neetOnly, setNeetOnly,
    filteredYouth,
    resetFilters,
    hasActiveFilters
  } = useYouthFilters(youthList, selectedMakhalla, initialFilterStatus);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage
  } = usePagination(filteredYouth, 20);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Control & Filter Toolbar */}
      <div className="bg-surface-1 p-4 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md bg-surface-2 border border-white/[0.08] rounded-lg focus-within:border-indigo-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr.registrySearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            
            {/* View Mode Toggle */}
            <div className="flex bg-surface-2 p-1 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-surface-3 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'ru' ? 'Таблица' : 'Jadval'}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-surface-3 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'ru' ? 'Карточки' : 'Kartochkalar'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Import */}
            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>{tr.registryBtnImport}</span>
              </button>
            )}

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.registryBtnExport}</span>
            </button>

            {/* Add Youth */}
            <button
              onClick={onOpenNewYouth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-200" />
              <span>{tr.registryBtnAddYouth}</span>
            </button>

          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/[0.06] text-xs">
          
          <div className="flex items-center gap-1.5 text-slate-400 mr-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-[13px]">{tr.registryFiltersLabel}</span>
          </div>

          {selectedMakhalla === 'all' && (
            <CustomSelect
              value={makhallaFilter}
              onChange={setMakhallaFilter}
              options={[
                { value: 'all', label: tr.allMakhallas, icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> },
                ...MAKHALLAS_LIST.map(m => ({ value: m.name, label: getMahallaName(m.name, lang), icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> }))
              ]}
            />
          )}

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: tr.registryFilterAllStatuses },
              { value: 'занят', label: tr.registryFilterEmployed, icon: <Briefcase className="w-3.5 h-3.5 text-sky-400" /> },
              { value: 'предприниматель', label: tr.registryFilterBusiness, icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> },
              { value: 'обучается', label: tr.registryFilterStudying, icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
              { value: 'направлен на обучение', label: tr.registryFilterCourses, icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> },
              { value: 'безработный', label: tr.registryFilterUnemployed, icon: <User className="w-3.5 h-3.5 text-slate-400" /> },
              { value: 'neet_pending', label: tr.registryFilterNeetPending, icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
              { value: 'supported', label: tr.registryFilterSupported, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
            ]}
          />

          <CustomSelect
            value={ageFilter}
            onChange={setAgeFilter}
            options={[
              { value: 'all', label: tr.registryFilterAllAges, icon: <Calendar className="w-3.5 h-3.5 text-indigo-400" /> },
              { value: '18-21', label: `18–21 ${lang === 'ru' ? 'лет' : 'yosh'}`, icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
              { value: '22-25', label: `22–25 ${lang === 'ru' ? 'лет' : 'yosh'}`, icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
              { value: '26-30', label: `26–30 ${lang === 'ru' ? 'лет' : 'yosh'}`, icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
            ]}
          />

          <CustomSelect
            value={genderFilter}
            onChange={setGenderFilter}
            options={[
              { value: 'all', label: tr.registryFilterAllGenders, icon: <Users className="w-3.5 h-3.5 text-slate-400" /> },
              { value: 'Мужской', label: tr.registryFilterMale, icon: <User className="w-3.5 h-3.5 text-sky-400" /> },
              { value: 'Женский', label: tr.registryFilterFemale, icon: <User className="w-3.5 h-3.5 text-rose-400" /> },
            ]}
          />

          <div className="mx-1 h-5 w-px bg-white/[0.08]"></div>

          <FilterToggle
            checked={neetOnly}
            onChange={setNeetOnly}
            label={tr.registryToggleNeetOnly}
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold ml-1"
            >
              {tr.registryResetFilters}
            </button>
          )}

          <div className="text-[11px] text-slate-400 ml-auto font-medium">
            {tr.registryFound} <strong className="text-white font-bold">{filteredYouth.length}</strong> {tr.registryOfTotal} {youthList.length} {tr.kpiPersons}
          </div>

        </div>
      </div>

      {/* Main Table or Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-surface-1 rounded-2xl border border-white/[0.08] shadow-surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/80 text-slate-400 font-bold border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{tr.registryThName}</th>
                  <th className="py-3 px-4">{tr.registryThAgeGender}</th>
                  <th className="py-3 px-4">{tr.registryThMakhalla}</th>
                  <th className="py-3 px-4">{tr.registryThStatus}</th>
                  <th className="py-3 px-4">{tr.registryThSpecialty}</th>
                  <th className="py-3 px-4">{tr.registryThDate}</th>
                  <th className="py-3 px-4 text-right">{tr.registryThAction}</th>
                </tr>
              </thead>
              <tbody key={currentPage} className="divide-y divide-white/[0.04] view-transition">
                {paginatedItems.map(youth => (
                  <tr 
                    key={youth.id}
                    className="hover:bg-surface-2/60 transition-colors group cursor-pointer"
                    onClick={() => onOpenProfile(youth)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></div>
                        <span className="text-xs font-semibold">{youth.full_name_demo}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <div className="font-semibold text-white">{youth.age} {lang === 'ru' ? 'лет' : 'yosh'}</div>
                      <div className="text-slate-500 text-[11px]">{youth.gender === 'Мужской' ? tr.registryFilterMale : tr.registryFilterFemale}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        {getMahallaName(youth.makhalla, lang)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={youth.employment_status} isNeet={youth.is_neet} lang={lang} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {youth.activity_type}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px] mt-0.5">
                        {youth.specialty || getEducationName(youth.education, lang)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {youth.last_updated}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProfile(youth);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-indigo-600 text-slate-300 hover:text-white font-semibold text-xs transition-all border border-white/[0.08]"
                      >
                        {tr.registryBtnOpen}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map(youth => (
            <div
              key={youth.id}
              onClick={() => onOpenProfile(youth)}
              className="bg-surface-1 p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.18] cursor-pointer transition-all flex flex-col justify-between shadow-surface-card"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      <span>{getMahallaName(youth.makhalla, lang)}</span>
                      <span>•</span>
                      <span>{youth.age} {lang === 'ru' ? 'лет' : 'yosh'}</span>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={youth.employment_status} isNeet={youth.is_neet} lang={lang} />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300 my-2 bg-surface-2/80 p-2.5 rounded-lg border border-white/[0.06]">
                  <div>
                    <span className="text-slate-500 text-[11px]">{lang === 'ru' ? 'Сфера:' : 'Soha:'}</span>{' '}
                    <strong className="text-white text-xs">{youth.activity_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">{lang === 'ru' ? 'Образование:' : 'Ma’lumoti:'}</span>{' '}
                    <strong className="text-slate-300 text-xs">{getEducationName(youth.education, lang)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{youth.last_updated}</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  {tr.registryOpenCard}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && filteredYouth.length > 0 && (
        <div className="flex items-center justify-between bg-surface-1 px-4 py-3 rounded-xl border border-white/[0.08]">
          <div className="text-xs text-slate-400">
            {tr.registryPage} <strong className="text-white">{currentPage}</strong> {tr.registryPageOf} <strong className="text-white">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-surface-2 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-surface-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-surface-2 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-surface-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filteredYouth.length === 0 && (
        <div className="bg-surface-1 p-10 rounded-2xl text-center text-slate-400 border border-white/[0.08]">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">{tr.registryEmptyTitle}</p>
          <p className="text-xs text-slate-500 mt-1">{tr.registryEmptyDesc}</p>
        </div>
      )}

    </div>
  );
};
