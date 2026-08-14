import React from 'react';
import { LayoutDashboard, AlertTriangle, Users, Map, BookOpen, UserPlus } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'triage' | 'registry' | 'map' | 'programs';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  neetPendingCount: number;
  totalYouthCount: number;
  onOpenNewYouth: () => void;
  lang: 'ru' | 'uz';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  neetPendingCount,
  totalYouthCount,
  onOpenNewYouth,
  lang
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: lang === 'ru' ? 'Сводный Дашборд' : 'Умумий Дашборд',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'triage' as ActiveTab,
      label: lang === 'ru' ? 'NEET Триаж & Верификация' : 'NEET Текширув',
      icon: AlertTriangle,
      badge: neetPendingCount > 0 ? `${neetPendingCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'registry' as ActiveTab,
      label: lang === 'ru' ? 'Реестр Молодёжи' : 'Ёшлар Реестри',
      icon: Users,
      badge: `${totalYouthCount}`
    },
    {
      id: 'map' as ActiveTab,
      label: lang === 'ru' ? 'ГИС-Карта Махаллей' : 'ГИС-Харита',
      icon: Map,
      badge: null
    },
    {
      id: 'programs' as ActiveTab,
      label: lang === 'ru' ? 'Госпрограммы' : 'Давлат дастурлари',
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <nav className="bg-[#0e1e36]/95 backdrop-blur-md border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 gap-3">
          
          {/* Main Tabs */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        tab.badgeColor
                          ? tab.badgeColor
                          : isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Profile Button */}
          <button
            onClick={onOpenNewYouth}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === 'ru' ? 'Добавить профиль' : 'Қўшиш'}
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};
