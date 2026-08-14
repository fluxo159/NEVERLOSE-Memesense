import React, { useState } from 'react';
import { 
  Search, Download, UserPlus, Eye, MapPin, SlidersHorizontal, LayoutGrid, List, Users
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-rose-500/20 text-rose-300 border border-rose-500/40">
          ⚠️ NEET (Риск)
        </span>
      );
    }

    switch (status) {
      case 'занят':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ✓ Занят (найм)
          </span>
        );
      case 'предприниматель':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-500/20 text-purple-300 border border-purple-500/40">
            ★ Бизнес / ИП
          </span>
        );
      case 'обучается':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            🎓 Обучается
          </span>
        );
      case 'направлен на обучение':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-500/20 text-blue-300 border border-blue-500/40">
            ⚡ Моноцентр / Курс
          </span>
        );
      case 'безработный':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ⏳ Безработный
          </span>
        );
      case 'не уточнено':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-300 border border-slate-700">
            ? Не уточнено
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Control & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Поиск по ФИО, специальности, навыкам...' : 'Ф.И.Ш., мутахассислик бўйича излаш...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Таблица"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Карточки"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Import */}
            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
              >
                <span>📥 {lang === 'ru' ? 'Импорт' : 'Импорт'}</span>
              </button>
            )}

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'Экспорт' : 'Экспорт'}</span>
            </button>

            {/* Add Youth */}
            <button
              onClick={onOpenNewYouth}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Добавить' : 'Қўшиш'}</span>
            </button>

          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-800 text-xs">
          
          <div className="flex items-center gap-1.5 text-slate-400 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{lang === 'ru' ? 'Фильтры:' : 'Филтрлар:'}</span>
          </div>

          <select
            value={makhallaFilter}
            onChange={(e) => setMakhallaFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ru' ? 'Все махалли' : 'Барча маҳаллалар'}</option>
            {MAKHALLAS_LIST.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ru' ? 'Все статусы' : 'Барча ҳолатлар'}</option>
            <option value="занят">{lang === 'ru' ? 'Занят (найм)' : 'Банд'}</option>
            <option value="предприниматель">{lang === 'ru' ? 'Бизнес / ИП' : 'Тадбиркор'}</option>
            <option value="обучается">{lang === 'ru' ? 'Обучается (ВУЗ)' : 'Ўқимоқда'}</option>
            <option value="направлен на обучение">{lang === 'ru' ? 'Направлен на обучение' : 'Ўқишга юборилган'}</option>
            <option value="безработный">{lang === 'ru' ? 'Безработный' : 'Ишсиз'}</option>
            <option value="не уточнено">{lang === 'ru' ? 'Не уточнено' : 'Аниқланмаган'}</option>
            <option value="neet_pending">{lang === 'ru' ? '⚠️ NEET на проверке' : '⚠️ NEET текширувда'}</option>
            <option value="supported">{lang === 'ru' ? '✓ Охвачен поддержкой' : '✓ Қўллаб-қувватланган'}</option>
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ru' ? 'Любой возраст (18-30)' : 'Барча ёшлар'}</option>
            <option value="18-21">18–21 {lang === 'ru' ? 'лет' : 'ёш'}</option>
            <option value="22-25">22–25 {lang === 'ru' ? 'лет' : 'ёш'}</option>
            <option value="26-30">26–30 {lang === 'ru' ? 'лет' : 'ёш'}</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ru' ? 'Пол: Любой' : 'Жинси: Барчаси'}</option>
            <option value="Мужской">{lang === 'ru' ? 'Мужской' : 'Эркак'}</option>
            <option value="Женский">{lang === 'ru' ? 'Женский' : 'Аёл'}</option>
          </select>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={neetOnly}
              onChange={(e) => setNeetOnly(e.target.checked)}
              className="rounded accent-rose-500 cursor-pointer"
            />
            <span className="font-semibold">{lang === 'ru' ? 'Только NEET' : 'Фақат NEET'}</span>
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
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold ml-2"
            >
              {lang === 'ru' ? 'Сбросить' : 'Тозалаш'}
            </button>
          )}

          <div className="text-xs text-slate-400 ml-auto font-medium">
            Найдено: <strong className="text-white font-bold">{filteredYouth.length}</strong> из {youthList.length}
          </div>

        </div>
      </div>

      {/* Main Table or Cards View */}
      {viewMode === 'table' ? (
        <div className="glass-panel rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Ф.И.О. (Демо)</th>
                  <th className="py-3.5 px-4">Возраст / Пол</th>
                  <th className="py-3.5 px-4">Махалля</th>
                  <th className="py-3.5 px-4">Текущий статус</th>
                  <th className="py-3.5 px-4">Деятельность / Специальность</th>
                  <th className="py-3.5 px-4">Дата</th>
                  <th className="py-3.5 px-4 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredYouth.map(youth => (
                  <tr 
                    key={youth.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onOpenProfile(youth)}
                  >
                    <td className="py-4 px-5 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0"></div>
                        <span>{youth.full_name_demo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-xs">
                      <div className="font-semibold text-white">{youth.age} лет</div>
                      <div className="text-slate-400 text-[11px]">{youth.gender}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        {youth.makhalla}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(youth.employment_status, youth.is_neet)}
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-xs">
                      <div className="font-semibold text-white truncate max-w-[220px]">
                        {youth.activity_type}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[220px] mt-0.5">
                        {youth.specialty || youth.education}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                      {youth.last_updated}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProfile(youth);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white font-semibold text-xs transition-all border border-slate-700"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredYouth.map(youth => (
            <div
              key={youth.id}
              onClick={() => onOpenProfile(youth)}
              className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/80 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between hover:translate-y-[-2px] shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-base font-bold text-white hover:text-cyan-300 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{youth.makhalla}</span>
                      <span>•</span>
                      <span>{youth.age} лет</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(youth.employment_status, youth.is_neet)}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 my-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                  <div>
                    <span className="text-slate-400">Сфера:</span>{' '}
                    <strong className="text-white">{youth.activity_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Образование:</span>{' '}
                    <strong className="text-slate-200">{youth.education}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">{youth.last_updated}</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  Подробнее →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredYouth.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 border border-slate-700/60">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <p className="text-base font-bold text-white">Ничего не найдено</p>
          <p className="text-xs text-slate-400 mt-1">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
        </div>
      )}

    </div>
  );
};
