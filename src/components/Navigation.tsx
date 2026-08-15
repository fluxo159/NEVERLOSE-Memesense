import React from 'react';
import { LayoutDashboard, AlertCircle, Users, Map, BookOpen, UserPlus } from 'lucide-react';

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
      label: lang === 'ru' ? 'Главная / Обзор' : 'Бош саҳифа',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'triage' as ActiveTab,
      label: lang === 'ru' ? 'Требуют проверки' : 'Текширув кутмоқда',
      icon: AlertCircle,
      badge: neetPendingCount > 0 ? `${neetPendingCount}` : null,
      badgeColor: 'bg-rose-600 text-white font-bold'
    },
    {
      id: 'registry' as ActiveTab,
      label: lang === 'ru' ? 'Список молодёжи' : 'Ёшлар рўйхати',
      icon: Users,
      badge: `${totalYouthCount}`
    },
    {
      id: 'map' as ActiveTab,
      label: lang === 'ru' ? 'Карта махаллей' : 'Маҳаллалар харитаси',
      icon: Map,
      badge: null
    },
    {
      id: 'programs' as ActiveTab,
      label: lang === 'ru' ? 'Программы помощи' : 'Ёрдам дастурлари',
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <nav className="bg-[#0b1426]/95 backdrop-blur-md border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4 overflow-hidden w-full">
          
          {/* Main Tabs Container (Segmented Control Style) */}
          <div className="flex-1 flex items-center p-1.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl min-w-0 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${
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

        </div>
      </div>
    </nav>
  );
};
