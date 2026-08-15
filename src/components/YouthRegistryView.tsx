import React, { useState } from 'react';
import { 
  Search, Download, UserPlus, Eye, MapPin, SlidersHorizontal, LayoutGrid, List, Users,
  CheckCircle, Briefcase, GraduationCap, AlertCircle, Sparkles
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';

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
  userRole,
  lang,
  onOpenProfile,
  onOpenNewYouth,
  onOpenExport,
  onOpenImport,
  initialFilterStatus
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus || 'all');
  const [makhallaFilter, setMakhallaFilter] = useState<string>(selectedMakhalla !== 'all' ? selectedMakhalla : 'all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [neetOnly, setNeetOnly] = useState<boolean>(false);

  const filteredYouth = youthList.filter(youth => {
    if (makhallaFilter !== 'all' && youth.makhalla !== makhallaFilter) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'neet_pending') {
        if (!youth.is_neet || youth.neet_verification !== 'pending_verification') return false;
      } else if (statusFilter === 'supported') {
        if (!youth.assigned_program && youth.employment_status !== 'направлен на обучение') return false;
      } else if (youth.employment_status !== statusFilter) {
        return false;
      }
    }

    if (neetOnly && !youth.is_neet) return false;
    if (genderFilter !== 'all' && youth.gender !== genderFilter) return false;

    if (ageFilter === '18-21' && (youth.age < 18 || youth.age > 21)) return false;
    if (ageFilter === '22-25' && (youth.age < 22 || youth.age > 25)) return false;
    if (ageFilter === '26-30' && (youth.age < 26 || youth.age > 30)) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        youth.full_name_demo.toLowerCase().includes(q) ||
        youth.makhalla.toLowerCase().includes(q) ||
        youth.activity_type.toLowerCase().includes(q) ||
        (youth.specialty && youth.specialty.toLowerCase().includes(q)) ||
        youth.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const getStatusBadge = (status: EmploymentStatus, isNeet: boolean) => {
    if (isNeet) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>{lang === 'ru' ? 'Без работы/учёбы' : 'Ишсиз'}</span>
        </span>
      );
    }

    switch (status) {
      case 'занят':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{lang === 'ru' ? 'Работает (найм)' : 'Ишлайди'}</span>
          </span>
        );
      case 'предприниматель':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Briefcase className="w-3 h-3 text-purple-400" />
            <span>{lang === 'ru' ? 'Свой бизнес / ИП' : 'Тадбиркор'}</span>
          </span>
        );
      case 'обучается':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <GraduationCap className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'ru' ? 'Учится (ВУЗ)' : 'Ўқимоқда'}</span>
          </span>
        );
      case 'направлен на обучение':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{lang === 'ru' ? 'Курсы Моноцентра' : 'Мономарказда'}</span>
          </span>
        );
      case 'безработный':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Users className="w-3 h-3 text-amber-400" />
            <span>{lang === 'ru' ? 'Ищет работу' : 'Иш қидирмоқда'}</span>
          </span>
        );
      case 'не уточнено':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-surface-3 text-slate-400 border border-white/[0.08]">
            ? {lang === 'ru' ? 'Не уточнено' : 'Аниқланмаган'}
          </span>
        );
    }
  };

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
              placeholder={lang === 'ru' ? 'Поиск по ФИО, специальности, навыкам...' : 'Ф.И.Ш., мутахассислик бўйича излаш...'}
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
                title="Таблица"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-surface-3 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Карточки"
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
                <span>📥 {lang === 'ru' ? 'Импорт файла' : 'Импорт'}</span>
              </button>
            )}

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Скачать Excel/CSV' : 'Экспорт'}</span>
            </button>

            {/* Add Youth */}
            <button
              onClick={onOpenNewYouth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? '+ Добавить человека' : '+ Қўшиш'}</span>
            </button>

          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-white/[0.06] text-xs">
          
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{lang === 'ru' ? 'Фильтры:' : 'Филтрлар:'}</span>
          </div>

          <div className="flex items-center gap-2 bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1">
            <select
              value={makhallaFilter}
              onChange={(e) => setMakhallaFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full py-0.5 pr-4"
            >
              <option value="all" className="bg-surface-1">{lang === 'ru' ? 'Все 8 махаллей' : 'Барча маҳаллалар'}</option>
              {MAKHALLAS_LIST.map(m => (
                <option key={m.id} value={m.name} className="bg-surface-1">{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full py-0.5 pr-4"
            >
              <option value="all" className="bg-surface-1">{lang === 'ru' ? 'Все статусы занятости' : 'Барча ҳолатлар'}</option>
              <option value="занят" className="bg-surface-1">{lang === 'ru' ? 'Работают (найм)' : 'Ишлайди'}</option>
              <option value="предприниматель" className="bg-surface-1">{lang === 'ru' ? 'Свой бизнес / ИП' : 'Тадбиркор'}</option>
              <option value="обучается" className="bg-surface-1">{lang === 'ru' ? 'Учатся (ВУЗ)' : 'Ўқимоқда'}</option>
              <option value="направлен на обучение" className="bg-surface-1">{lang === 'ru' ? 'На курсах Моноцентра' : 'Ўқишга юборилган'}</option>
              <option value="безработный" className="bg-surface-1">{lang === 'ru' ? 'Ищут работу' : 'Ишсиз'}</option>
              <option value="neet_pending" className="bg-surface-1">{lang === 'ru' ? '⚠️ Без работы/учёбы (нужен визит)' : '⚠️ Текширувда'}</option>
              <option value="supported" className="bg-surface-1">{lang === 'ru' ? '✓ Получили помощь' : '✓ Ёрдам олган'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1">
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full py-0.5 pr-4"
            >
              <option value="all" className="bg-surface-1">{lang === 'ru' ? 'Любой возраст (18-30)' : 'Барча ёшлар'}</option>
              <option value="18-21" className="bg-surface-1">18–21 {lang === 'ru' ? 'лет' : 'ёш'}</option>
              <option value="22-25" className="bg-surface-1">22–25 {lang === 'ru' ? 'лет' : 'ёш'}</option>
              <option value="26-30" className="bg-surface-1">26–30 {lang === 'ru' ? 'лет' : 'ёш'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full py-0.5 pr-4"
            >
              <option value="all" className="bg-surface-1">{lang === 'ru' ? 'Пол: Любой' : 'Жинси: Барчаси'}</option>
              <option value="Мужской" className="bg-surface-1">{lang === 'ru' ? 'Мужской' : 'Эркак'}</option>
              <option value="Женский" className="bg-surface-1">{lang === 'ru' ? 'Женский' : 'Аёл'}</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={neetOnly}
              onChange={(e) => setNeetOnly(e.target.checked)}
              className="rounded accent-rose-500 cursor-pointer"
            />
            <span className="font-semibold text-xs">{lang === 'ru' ? 'Только без работы' : 'Фақат ишсизлар'}</span>
          </label>

          {(statusFilter !== 'all' || makhallaFilter !== 'all' || ageFilter !== 'all' || genderFilter !== 'all' || neetOnly || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setMakhallaFilter('all');
                setAgeFilter('all');
                setGenderFilter('all');
                setNeetOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold ml-1"
            >
              {lang === 'ru' ? 'Сбросить' : 'Тозалаш'}
            </button>
          )}

          <div className="text-[11px] text-slate-400 ml-auto font-medium">
            Найдено: <strong className="text-white font-bold">{filteredYouth.length}</strong> из {youthList.length} чел.
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
                  <th className="py-3 px-4">Ф.И.О. гражданина</th>
                  <th className="py-3 px-4">Возраст / Пол</th>
                  <th className="py-3 px-4">Махалля</th>
                  <th className="py-3 px-4">Текущий статус</th>
                  <th className="py-3 px-4">Сфера / Специальность</th>
                  <th className="py-3 px-4">Дата</th>
                  <th className="py-3 px-4 text-right">Анкета</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredYouth.map(youth => (
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
                      <div className="font-semibold text-white">{youth.age} лет</div>
                      <div className="text-slate-500 text-[11px]">{youth.gender}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        {youth.makhalla}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(youth.employment_status, youth.is_neet)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {youth.activity_type}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px] mt-0.5">
                        {youth.specialty || youth.education}
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
                        Открыть
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
          {filteredYouth.map(youth => (
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
                      <span>{youth.makhalla}</span>
                      <span>•</span>
                      <span>{youth.age} лет</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(youth.employment_status, youth.is_neet)}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300 my-2 bg-surface-2/80 p-2.5 rounded-lg border border-white/[0.06]">
                  <div>
                    <span className="text-slate-500 text-[11px]">Сфера:</span>{' '}
                    <strong className="text-white text-xs">{youth.activity_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Образование:</span>{' '}
                    <strong className="text-slate-300 text-xs">{youth.education}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{youth.last_updated}</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  Открыть анкету →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredYouth.length === 0 && (
        <div className="bg-surface-1 p-10 rounded-2xl text-center text-slate-400 border border-white/[0.08]">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Ничего не найдено</p>
          <p className="text-xs text-slate-500 mt-1">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
        </div>
      )}

    </div>
  );
};
