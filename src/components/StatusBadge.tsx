import React from 'react';
import { AlertCircle, CheckCircle2, Briefcase, GraduationCap, Sparkles, Clock, HelpCircle } from 'lucide-react';
import { EmploymentStatus } from '../types';

interface StatusBadgeProps {
  status: EmploymentStatus;
  isNeet: boolean;
  lang: 'ru' | 'uz';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isNeet, lang }) => {
  if (isNeet) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
        <span>{lang === 'ru' ? 'Без работы/учёбы' : 'Ishsiz / NEET'}</span>
      </span>
    );
  }

  switch (status) {
    case 'занят':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Работает (найм)' : 'Ishlaydi (rasmiy)'}</span>
        </span>
      );
    case 'предприниматель':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Свой бизнес / ИП' : 'Tadbirkor / YaTT'}</span>
        </span>
      );
    case 'обучается':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
          <GraduationCap className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Учится (ВУЗ)' : 'O‘qimoqda (OTM)'}</span>
        </span>
      );
    case 'направлен на обучение':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Курсы Моноцентра' : 'Monomarkaz kurslarida'}</span>
        </span>
      );
    case 'безработный':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Ищет работу' : 'Ish qidirmoqda (ABM)'}</span>
        </span>
      );
    case 'не уточнено':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-2 border border-white/[0.08] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Не уточнено' : 'Aniqlanmagan'}</span>
        </span>
      );
  }
};
