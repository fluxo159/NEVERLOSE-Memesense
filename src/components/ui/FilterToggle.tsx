import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface FilterToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({ checked, onChange, label }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        checked 
          ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm' 
          : 'bg-surface-2 text-slate-400 border-white/[0.08] hover:bg-surface-3 hover:text-slate-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${checked ? 'bg-rose-400' : 'bg-slate-500'}`} />
      <span>{label}</span>
    </button>
  );
};
