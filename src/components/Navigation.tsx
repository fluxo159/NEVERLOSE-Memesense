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
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
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
    <nav className="relative z-40 bg-surface-1/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-3">
          
          {/* Segmented Tab Strip */}
          <div className="flex items-center bg-canvas-pure/60 p-1 rounded-xl border border-white/[0.06] space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-surface-3 text-white shadow-sm border border-white/[0.12]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        tab.badgeColor
                          ? tab.badgeColor
                          : isActive
                          ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                          : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
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
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 text-xs font-semibold rounded-lg transition-all shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] flex-shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">
              {lang === 'ru' ? '+ Добавить человека' : '+ Янги ёш киритиш'}
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};
