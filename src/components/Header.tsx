import React from 'react';
import { Shield, Building2, UserCheck, Sparkles, MapPin, Globe, Award, HelpCircle } from 'lucide-react';
import { UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';

interface HeaderProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  selectedMakhalla: string; // 'all' or makhalla name
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
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'district_officer':
        return lang === 'ru' ? 'Хокимият Района (Мирзо-Улугбек)' : 'Туман Ҳокимлиги (Мирзо-Улуғбек)';
      case 'mahalla_leader':
        return lang === 'ru' ? '«Ёшлар етакчиси» (Лидер Махалли)' : '«Ёшлар етакчиси» (Маҳалла)';
      case 'employment_center':
        return lang === 'ru' ? 'Центр содействия занятости (АБВКМ)' : 'Бандликка кўмаклашиш маркази';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c192c]/90 backdrop-blur-md border-b border-slate-700/60 shadow-xl">
      {/* Top micro-bar with state emblem badge & district context */}
      <div className="bg-gradient-to-r from-gov-900/60 via-slate-900/80 to-gov-900/60 px-4 py-1 border-b border-slate-800 text-xs flex justify-between items-center text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>Ўзбекистон Республикаси | Тошкент шаҳри Мирзо Улуғбек тумани ҳокимлиги</span>
          <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20">
            NEXUS30 GovTech MVP
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
            Пилотный проект: Единая база учёта молодёжи (18–30 лет)
          </span>
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'ru' ? 'RU / O\'Z' : 'O\'Z / RU'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-gov-600 to-emerald-600 p-[2px] shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full bg-[#0d1c33] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight font-sans">
                  Ёшлар Бандлиги
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Система мониторинга занятости и маршрутизации молодёжи' 
                  : 'Ёшлар бандлиги мониторинги ва йўналтириш тизими'}
              </p>
            </div>
          </div>

          {/* Territory and Role Selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Makhalla Quick Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 flex-shrink-0" />
              <span className="text-slate-400 mr-2">{lang === 'ru' ? 'Махалля:' : 'Маҳалла:'}</span>
              <select
                aria-label="Фильтр по махалле"
                value={selectedMakhalla}
                onChange={(e) => onSelectMakhalla(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-800 text-white">
                  {lang === 'ru' ? 'Весь Мирзо-Улугбекский район (8 махаллей)' : 'Барча туман маҳаллалари'}
                </option>
                {MAKHALLAS_LIST.map((m) => (
                  <option key={m.id} value={m.name} className="bg-slate-800 text-white">
                    {m.name} ({m.totalYouth} чел.)
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg p-1 text-xs">
              <div className="flex items-center px-2 py-1 text-slate-400 gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{lang === 'ru' ? 'Роль:' : 'Роль:'}</span>
              </div>
              <select
                aria-label="Выбор роли пользователя"
                value={selectedRole}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-slate-900 text-cyan-300 font-medium px-2 py-1 rounded border border-slate-700/80 focus:outline-none cursor-pointer"
              >
                <option value="district_officer" className="bg-slate-900 text-white">
                  🏛️ {lang === 'ru' ? 'Хокимият Района' : 'Туман Ҳокимлиги'}
                </option>
                <option value="mahalla_leader" className="bg-slate-900 text-white">
                  👤 {lang === 'ru' ? '«Ёшлар етакчиси»' : 'Маҳалла етакчиси'}
                </option>
                <option value="employment_center" className="bg-slate-900 text-white">
                  💼 {lang === 'ru' ? 'Центр занятости (ЦЗН)' : 'Бандлик маркази'}
                </option>
              </select>
            </div>

            {/* Pitch Guide / Hackathon Demo Button */}
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-gov-700 hover:from-cyan-500 hover:to-gov-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-900/30 border border-cyan-400/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{lang === 'ru' ? 'Питч-гид (Демо жюри)' : 'Ҳакамлар гиди'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
