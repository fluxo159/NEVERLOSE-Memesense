import React from 'react';
import { Shield, MapPin, Globe, Building, User, Briefcase, Sparkles } from 'lucide-react';
import { UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { CustomSelect } from './ui/CustomSelect';
import { t } from '../data/translations';

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-brand-linear to-cyan-500 shadow-glow-brand flex-shrink-0 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {tr.appName}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full tracking-wide">
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
                ...MAKHALLAS_LIST.map((m) => ({ value: m.name, label: m.name, icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> }))
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-brand-linear to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-glow-brand border border-indigo-400/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{tr.pitchGuideBtn}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
