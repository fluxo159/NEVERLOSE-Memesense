import React from 'react';
import { LayoutDashboard, AlertCircle, Users, Map, BookOpen } from 'lucide-react';
import { t } from '../data/translations';

export type ActiveTab = 'dashboard' | 'triage' | 'registry' | 'map' | 'programs';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  neetPendingCount: number;
  totalYouthCount: number;
  lang: 'ru' | 'uz';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  neetPendingCount,
  totalYouthCount,
  lang
}) => {
  const tr = t[lang];

  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: tr.tabDashboard,
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'triage' as ActiveTab,
      label: tr.tabTriage,
      icon: AlertCircle,
      badge: neetPendingCount > 0 ? `${neetPendingCount}` : null,
      badgeColor: 'bg-rose-600 text-white font-bold'
    },
    {
      id: 'registry' as ActiveTab,
      label: tr.tabRegistry,
      icon: Users,
      badge: `${totalYouthCount}`
    },
    {
      id: 'map' as ActiveTab,
      label: tr.tabMap,
      icon: Map,
      badge: null
    },
    {
      id: 'programs' as ActiveTab,
      label: tr.tabPrograms,
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <nav className="relative z-40 bg-surface-1/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2.5">
          {/* Main Tabs Container (Segmented Control Style) */}
          <div className="flex items-center p-1.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl w-full shadow-inner gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
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
