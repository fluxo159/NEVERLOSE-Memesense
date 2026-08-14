import React from 'react';
import { Shield, UserCheck, Sparkles, MapPin, Globe } from 'lucide-react';
import { UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';

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
  return (
    <header className="bg-surface-1/95 border-b border-white/[0.08] backdrop-blur-xl">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-brand-linear to-cyan-500 p-[1px] shadow-glow-brand flex-shrink-0">
              <div className="w-full h-full bg-surface-1 rounded-[11px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Ёшлар Бандлиги
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full tracking-wide">
                  GovTech 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {lang === 'ru' 
                  ? 'Платформа мониторинга занятости и маршрутизации молодёжи' 
                  : 'Ёшлар бандлиги мониторинги ва йўналтириш тизими'}
              </p>
            </div>
          </div>

          {/* Selectors & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Makhalla Selector */}
            <div className="flex items-center bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1.5 flex-shrink-0" />
              <select
                aria-label="Фильтр по махалле"
                value={selectedMakhalla}
                onChange={(e) => onSelectMakhalla(e.target.value)}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="bg-surface-2 text-white">
                  {lang === 'ru' ? 'Весь район (8 махаллей)' : 'Барча маҳаллалар'}
                </option>
                {MAKHALLAS_LIST.map((m) => (
                  <option key={m.id} value={m.name} className="bg-surface-2 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-2 py-1 text-xs transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 mx-1 flex-shrink-0" />
              <select
                aria-label="Выбор роли пользователя"
                value={selectedRole}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-surface-3 text-slate-200 font-medium px-2 py-1 rounded-lg border border-white/[0.08] focus:outline-none cursor-pointer text-xs"
              >
                <option value="district_officer" className="bg-surface-2 text-white">
                  🏛️ {lang === 'ru' ? 'Хокимият' : 'Ҳокимлик'}
                </option>
                <option value="mahalla_leader" className="bg-surface-2 text-white">
                  👤 {lang === 'ru' ? 'Лидер Махалли' : 'Маҳалла етакчиси'}
                </option>
                <option value="employment_center" className="bg-surface-2 text-white">
                  💼 {lang === 'ru' ? 'Центр занятости' : 'Бандлик маркази'}
                </option>
              </select>
            </div>

            {/* Language Switch */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] font-bold text-xs transition-all"
              title="Переключить язык (RU / O'Z)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'RU' : 'O\'Z'}</span>
            </button>

            {/* Pitch Button */}
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-brand-linear to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-glow-brand border border-indigo-400/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{lang === 'ru' ? 'Питч-гид' : 'Питч-гид'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
