import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SupportProgram } from '../types';

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
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SupportProgram['category']>('трудоустройство');
  const [provider, setProvider] = useState('');
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Briefcase');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !provider.trim()) return;

    const newProgram: SupportProgram = {
      id: `prog_custom_${Date.now()}`,
      title: title.trim(),
      category,
      provider: provider.trim(),
      description: description.trim(),
      duration: duration.trim() || (lang === 'ru' ? 'Не указано' : 'Кўрсатилмаган'),
      stipend: stipend.trim() || (lang === 'ru' ? 'По договоренности' : 'Келишув асосида'),
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
              {lang === 'ru' ? 'Добавить новую вакансию / программу' : 'Янги вакансия / дастур қўшиш'}
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
              {lang === 'ru' ? 'Название (Должность):' : 'Номи (Лавозим):'}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'ru' ? 'Например: Senior Frontend Developer' : 'Масалан: Senior Frontend Developer'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Категория:' : 'Категория:'}
              </label>
              <div className="bg-surface-2 border border-white/[0.08] rounded-xl px-2.5 py-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportProgram['category'])}
                  className="w-full bg-transparent text-white focus:outline-none cursor-pointer py-1 text-xs"
                >
                  <option value="трудоустройство" className="bg-surface-1">{lang === 'ru' ? 'Трудоустройство (Работа)' : 'Ишга жойлашиш'}</option>
                  <option value="обучение" className="bg-surface-1">{lang === 'ru' ? 'Обучение / Курсы' : 'Ўқитиш / Курслар'}</option>
                  <option value="it_стажировка" className="bg-surface-1">{lang === 'ru' ? 'IT Стажировка' : 'IT Стажировка'}</option>
                  <option value="субсидия" className="bg-surface-1">{lang === 'ru' ? 'Субсидия / Грант' : 'Субсидия / Грант'}</option>
                  <option value="предпринимательство" className="bg-surface-1">{lang === 'ru' ? 'Предпринимательство' : 'Тадбиркорлик'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Иконка:' : 'Иконка:'}
              </label>
              <div className="bg-surface-2 border border-white/[0.08] rounded-xl px-2.5 py-1">
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none cursor-pointer py-1 text-xs"
                >
                  <option value="Briefcase" className="bg-surface-1">{lang === 'ru' ? 'Портфель (Работа)' : 'Портфел'}</option>
                  <option value="Code" className="bg-surface-1">{lang === 'ru' ? 'Код (IT)' : 'Код (IT)'}</option>
                  <option value="GraduationCap" className="bg-surface-1">{lang === 'ru' ? 'Шапка (Обучение)' : 'Шапка (Таълим)'}</option>
                  <option value="Gift" className="bg-surface-1">{lang === 'ru' ? 'Подарок (Субсидия)' : 'Совға (Субсидия)'}</option>
                  <option value="Wrench" className="bg-surface-1">{lang === 'ru' ? 'Ключ (Ремесло)' : 'Калит (Ҳунармандчилик)'}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {lang === 'ru' ? 'Провайдер / Компания:' : 'Провайдер / Компания:'}
            </label>
            <input
              type="text"
              required
              placeholder="OOO 'SuperCompany' / IT-Park"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Зарплата / Стипендия:' : 'Маош / Стипендия:'}
              </label>
              <input
                type="text"
                placeholder="от 5 000 000 сум"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Длительность:' : 'Давомийлиги:'}
              </label>
              <input
                type="text"
                placeholder="Полный день / 6 месяцев"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {lang === 'ru' ? 'Описание:' : 'Тавсиф:'}
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glow-brand transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Добавить' : 'Қўшиш'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-slate-300 rounded-xl font-semibold border border-white/[0.08] transition-all"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор қилиш'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
