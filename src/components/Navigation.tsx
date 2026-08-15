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
      badge: neetPendingCount > 0 ? `${neetPendingCount}` : null
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
          <div className="flex items-center p-1 bg-surface-2 border border-white/[0.08] rounded-xl w-full shadow-inner gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-3 border border-transparent font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0 flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.id === 'triage' && neetPendingCount > 0
                          ? 'bg-surface-3 text-slate-300 border border-white/[0.08]'
                          : 'bg-surface-3 text-slate-400 border border-white/[0.06]'
                      }`}
                    >
                      {tab.id === 'triage' && neetPendingCount > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-rose-400/80'}`} />
                      )}
                      <span>{tab.badge}</span>
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
