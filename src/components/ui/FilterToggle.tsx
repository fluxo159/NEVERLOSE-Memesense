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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        checked 
          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-sm' 
          : 'bg-surface-2 text-slate-400 border-white/[0.08] hover:bg-surface-3 hover:text-slate-200'
      }`}
    >
      <div className={`relative flex items-center justify-center w-3.5 h-3.5 transition-colors ${checked ? 'text-rose-400' : 'text-slate-500'}`}>
        {checked ? <AlertCircle className="w-full h-full" /> : <X className="w-full h-full opacity-50" />}
      </div>
      {label}
    </button>
  );
};
