import React, { useState } from 'react';
import { BookOpen, Briefcase, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {lang === 'ru' ? 'Добавить новую вакансию / программу' : 'Янги вакансия / дастур қўшиш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Категория:' : 'Категория:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportProgram['category'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="трудоустройство">{lang === 'ru' ? 'Трудоустройство (Работа)' : 'Ишга жойлашиш'}</option>
                <option value="обучение">{lang === 'ru' ? 'Обучение / Курсы' : 'Ўқитиш / Курслар'}</option>
                <option value="it_стажировка">{lang === 'ru' ? 'IT Стажировка' : 'IT Стажировка'}</option>
                <option value="субсидия">{lang === 'ru' ? 'Субсидия / Грант' : 'Субсидия / Грант'}</option>
                <option value="предпринимательство">{lang === 'ru' ? 'Предпринимательство' : 'Тадбиркорлик'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'ru' ? 'Иконка:' : 'Иконка:'}
              </label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Briefcase">{lang === 'ru' ? 'Портфель (Работа)' : 'Портфел'}</option>
                <option value="Code">{lang === 'ru' ? 'Код (IT)' : 'Код (IT)'}</option>
                <option value="GraduationCap">{lang === 'ru' ? 'Шапка (Обучение)' : 'Шапка (Таълим)'}</option>
                <option value="Gift">{lang === 'ru' ? 'Подарок (Субсидия)' : 'Совға (Субсидия)'}</option>
                <option value="Wrench">{lang === 'ru' ? 'Ключ (Ремесло)' : 'Калит (Ҳунармандчилик)'}</option>
              </select>
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Добавить' : 'Қўшиш'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор қилиш'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
