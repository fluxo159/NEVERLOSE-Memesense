import React from 'react';
import { Shield, MapPin, Globe, Building, User, Briefcase, Sparkles } from 'lucide-react';
import { UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { CustomSelect } from './ui/CustomSelect';
import { t, getMahallaName } from '../data/translations';

interface HeaderProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  selectedMakhalla: string;
  onSelectMakhalla: (makhalla: string) => void;
  onOpenPitchGuide: () => void;
  lang: 'ru' | 'uz';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRole,
  onSelectRole,
  selectedMakhalla,
  onSelectMakhalla,
  onOpenPitchGuide,
  lang,
  onToggleLang
}) => {
  const tr = t[lang];

  return (
    <header className="bg-surface-1/95 border-b border-white/[0.08] backdrop-blur-xl relative z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-white/[0.12] flex-shrink-0 flex items-center justify-center relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
              <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" fill="none">
                <path 
                  d="M4.5 4.5L12 13L19.5 4.5" 
                  stroke="url(#govtech-logo-grad)" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M12 13V20" 
                  stroke="url(#govtech-logo-grad)" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                />
                <circle cx="12" cy="13" r="2" fill="#818CF8" />
                <defs>
                  <linearGradient id="govtech-logo-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {tr.appName}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-surface-2 text-slate-300 border border-white/[0.08] rounded-md tracking-wider font-mono">
                  {tr.appBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {tr.appSubtitle}
              </p>
            </div>
          </div>

          {/* Selectors & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Makhalla Selector */}
            <CustomSelect
              value={selectedMakhalla}
              onChange={onSelectMakhalla}
              options={[
                { value: 'all', label: tr.allMakhallas, icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> },
                ...MAKHALLAS_LIST.map((m) => ({ value: m.name, label: getMahallaName(m.name, lang), icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> }))
              ]}
              className="min-w-[170px]"
            />

            {/* Role Switcher */}
            <CustomSelect
              value={selectedRole}
              onChange={(val) => onSelectRole(val as UserRole)}
              options={[
                { value: 'district_officer', label: tr.roleHokimiyat, icon: <Building className="w-3.5 h-3.5 text-indigo-400" /> },
                { value: 'mahalla_leader', label: tr.roleLeader, icon: <User className="w-3.5 h-3.5 text-emerald-400" /> },
                { value: 'employment_center', label: tr.roleEmployment, icon: <Briefcase className="w-3.5 h-3.5 text-purple-400" /> }
              ]}
              className="min-w-[150px]"
            />

            {/* Language Switch */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] font-bold text-xs transition-all"
              title="Tilni o‘zgartirish / Сменить язык (RU / O‘Z)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'RU' : 'O‘Z'}</span>
            </button>

            {/* Pitch Button */}
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-indigo-500/30 hover:border-indigo-500/60 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.pitchGuideBtn}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
