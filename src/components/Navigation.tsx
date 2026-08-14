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
      label: lang === 'ru' ? 'NEET Триаж & Верификация' : 'NEET Текширув & Верификация',
      icon: AlertTriangle,
      badge: neetPendingCount > 0 ? `${neetPendingCount} на проверке` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
    },
    {
      id: 'registry' as ActiveTab,
      label: lang === 'ru' ? 'Единый Реестр Молодёжи' : 'Ёшларнинг Ягона Реестри',
      icon: Users,
      badge: `${totalYouthCount}`
    },
    {
      id: 'map' as ActiveTab,
      label: lang === 'ru' ? 'ГИС-Карта Махаллей' : 'Маҳаллалар ГИС-Харитаси',
      icon: Map,
      badge: lang === 'ru' ? 'Гео-срез' : 'Гео-таҳлил'
    },
    {
      id: 'programs' as ActiveTab,
      label: lang === 'ru' ? 'Госпрограммы поддержки' : 'Давлат дастурлари',
      icon: BookOpen,
      badge: '6 программ'
    }
  ];

  return (
    <div className="bg-[#0e1e36] border-b border-slate-700/50 sticky top-[77px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2">
          
          {/* Main Tabs */}
          <div className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-gov-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        tab.badgeColor
                          ? tab.badgeColor
                          : isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenNewYouth}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow border border-emerald-400/30 transition-all flex-shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lang === 'ru' ? '+ Добавить в реестр' : '+ Янги ёш киритиш'}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};
