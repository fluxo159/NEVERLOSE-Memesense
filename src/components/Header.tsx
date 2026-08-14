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
    <header className="bg-[#0b162c] border-b border-slate-700/60 shadow-lg">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-gov-950 via-slate-900 to-gov-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex justify-between items-center text-slate-400">
        <div className="flex items-center space-x-2 truncate">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
          <span className="truncate">Ўзбекистон Республикаси | Мирзо Улуғбек тумани ҳокимлиги</span>
          <span className="hidden sm:inline bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20">
            NEXUS30 GovTech
          </span>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="text-slate-400 hidden md:inline text-[11px]">
            Пилотный проект: Единая база учёта молодёжи (18–30 лет)
          </span>
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-xs"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'RU' : 'O\'Z'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-gov-700 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#0d1c33] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Ёшлар Бандлиги
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'ru' 
                  ? 'Система мониторинга занятости и маршрутизации молодёжи' 
                  : 'Ёшлар бандлиги мониторинги ва йўналтириш тизими'}
              </p>
            </div>
          </div>

          {/* Selectors & Pitch Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Makhalla Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 flex-shrink-0" />
              <select
                aria-label="Фильтр по махалле"
                value={selectedMakhalla}
                onChange={(e) => onSelectMakhalla(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-800 text-white">
                  {lang === 'ru' ? 'Весь район (8 махаллей)' : 'Барча маҳаллалар'}
                </option>
                {MAKHALLAS_LIST.map((m) => (
                  <option key={m.id} value={m.name} className="bg-slate-800 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 mx-1 flex-shrink-0" />
              <select
                aria-label="Выбор роли пользователя"
                value={selectedRole}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-slate-900 text-cyan-300 font-medium px-2 py-1 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="district_officer" className="bg-slate-900 text-white">
                  🏛️ {lang === 'ru' ? 'Хокимият' : 'Ҳокимлик'}
                </option>
                <option value="mahalla_leader" className="bg-slate-900 text-white">
                  👤 {lang === 'ru' ? 'Лидер Махалли' : 'Маҳалла етакчиси'}
                </option>
                <option value="employment_center" className="bg-slate-900 text-white">
                  💼 {lang === 'ru' ? 'Центр занятости' : 'Бандлик маркази'}
                </option>
              </select>
            </div>

            {/* Pitch Button */}
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-gov-700 hover:from-cyan-500 hover:to-gov-600 text-white text-xs font-semibold rounded-xl shadow-md border border-cyan-400/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{lang === 'ru' ? 'Питч-гид' : 'Питч-гид'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
