import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const hasAnyIcon = options.some(o => o.icon !== undefined);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-3 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none transition-all text-xs font-medium shadow-sm ${
          isOpen ? 'border-indigo-500/50 bg-surface-3' : ''
        }`}
      >
        <span className="truncate pr-2 flex items-center gap-1.5 text-slate-200">
          {selectedOption?.icon && (
            <span className="flex items-center justify-center flex-shrink-0">
              {selectedOption.icon}
            </span>
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-[220px] max-h-[300px] overflow-y-auto no-scrollbar mt-1.5 bg-[#151922] border border-white/[0.14] rounded-xl shadow-2xl shadow-black/80 py-1.5 dropdown-animate">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                value === option.value 
                  ? 'text-indigo-300 bg-indigo-500/20 font-semibold' 
                  : 'text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {hasAnyIcon && (
                  <span className={`flex items-center justify-center w-4 flex-shrink-0 ${value === option.value ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {option.icon}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
              </div>
              {value === option.value && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
