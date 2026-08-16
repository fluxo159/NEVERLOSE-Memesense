import React, { useState } from 'react';
import { Plus, X, Briefcase, Code, GraduationCap, Gift, Wrench, Building2 } from 'lucide-react';
import { SupportProgram } from '../types';
import { CustomSelect } from './ui/CustomSelect';
import { t } from '../data/translations';

interface NewProgramModalProps {
  onClose: () => void;
  onAddProgram: (program: SupportProgram) => void;
  lang: 'ru' | 'uz';
}

export const NewProgramModal: React.FC<NewProgramModalProps> = ({
  onClose,
  onAddProgram,
  lang
}) => {
  const tr = t[lang];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SupportProgram['category']>('трудоустройство');
  const [provider, setProvider] = useState('');
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Briefcase');

  const categoryOptions = [
    { value: 'трудоустройство', label: lang === 'ru' ? 'Трудоустройство (Работа)' : 'Ishga joylashish', icon: <Briefcase className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'обучение', label: lang === 'ru' ? 'Обучение / Курсы' : 'Kasbga o‘qitish / Kurslar', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'it_стажировка', label: lang === 'ru' ? 'IT Стажировка' : 'IT Amaliyot (Stajirovka)', icon: <Code className="w-3.5 h-3.5 text-cyan-400" /> },
    { value: 'субсидия', label: lang === 'ru' ? 'Субсидия / Грант' : 'Subsidiya / Grant', icon: <Gift className="w-3.5 h-3.5 text-emerald-400" /> },
    { value: 'предпринимательство', label: lang === 'ru' ? 'Предпринимательство' : 'Tadbirkorlik / Biznes', icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  const iconOptions = [
    { value: 'Briefcase', label: lang === 'ru' ? 'Портфель (Работа)' : 'Portfel (Ish)', icon: <Briefcase className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'Code', label: lang === 'ru' ? 'Код (IT)' : 'Kod (IT)', icon: <Code className="w-3.5 h-3.5 text-cyan-400" /> },
    { value: 'GraduationCap', label: lang === 'ru' ? 'Шапка (Обучение)' : 'Shapka (Ta’lim)', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'Gift', label: lang === 'ru' ? 'Подарок (Субсидия)' : 'Sovg‘a (Subsidiya)', icon: <Gift className="w-3.5 h-3.5 text-emerald-400" /> },
    { value: 'Wrench', label: lang === 'ru' ? 'Ключ (Ремесло)' : 'Kalit (Hunarmandchilik)', icon: <Wrench className="w-3.5 h-3.5 text-amber-400" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !provider.trim()) return;

    const newProgram: SupportProgram = {
      id: `prog_custom_${Date.now()}`,
      title: title.trim(),
      category,
      provider: provider.trim(),
      description: description.trim(),
      duration: duration.trim() || (lang === 'ru' ? 'Не указано' : 'Ko‘rsatilmadi'),
      stipend: stipend.trim() || (lang === 'ru' ? 'По договоренности' : 'Kelishuv asosida'),
      iconName
    };

    onAddProgram(newProgram);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-lg rounded-2xl border border-white/[0.14] shadow-surface-modal p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {tr.newProgModalTitle}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tr.newProgName}
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
              <input
                type="text"
                required
                placeholder={tr.newProgNamePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {tr.newProgCategory}
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as SupportProgram['category'])}
                options={categoryOptions}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {tr.newProgIcon}
              </label>
              <CustomSelect
                value={iconName}
                onChange={setIconName}
                options={iconOptions}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tr.newProgProvider}
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
              <input
                type="text"
                required
                placeholder="OOO 'SuperCompany' / IT-Park"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {tr.newProgStipend}
              </label>
              <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
                <input
                  type="text"
                  placeholder={tr.newProgStipendPlaceholder}
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {tr.newProgDuration}
              </label>
              <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
                <input
                  type="text"
                  placeholder={tr.newProgDurationPlaceholder}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tr.newProgDesc}
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl p-3 transition-all shadow-sm">
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glow-brand transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{tr.newProgBtnSubmit}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-slate-300 rounded-xl font-semibold border border-white/[0.08] transition-all"
            >
              {tr.newProgBtnCancel}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
