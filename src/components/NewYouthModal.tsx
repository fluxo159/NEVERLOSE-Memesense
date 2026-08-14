import React, { useState } from 'react';
import { X, UserPlus, MapPin, Phone, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { YouthProfile, EmploymentStatus, Gender, EducationLevel } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { SUPPORT_PROGRAMS } from '../data/supportPrograms';

interface NewYouthModalProps {
  onClose: () => void;
  onAddYouth: (youth: YouthProfile) => void;
  selectedMakhalla: string;
  lang: 'ru' | 'uz';
}

export const NewYouthModal: React.FC<NewYouthModalProps> = ({
  onClose,
  onAddYouth,
  selectedMakhalla,
  lang
}) => {
  const [fullName, setFullName] = useState('');
  const [makhalla, setMakhalla] = useState(selectedMakhalla !== 'all' ? selectedMakhalla : MAKHALLAS_LIST[0].name);
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<Gender>('Мужской');
  const [phone, setPhone] = useState('+998 (90) 000-00-00');
  const [status, setStatus] = useState<EmploymentStatus>('безработный');
  const [activity, setActivity] = useState('нет деятельности');
  const [education, setEducation] = useState<EducationLevel>('Средне-специальное');
  const [specialty, setSpecialty] = useState('');
  const [skills, setSkills] = useState('Водительские права, Базовый ПК');
  const [notes, setNotes] = useState('Первичное внесение через опрос «Ёшлар етакчиси»');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const isNeet = (status === 'безработный' || status === 'не уточнено');

    const newProfile: YouthProfile = {
      id: `y_${Date.now().toString().slice(-4)}`,
      full_name_demo: `${fullName.trim()} (Демо)`,
      makhalla,
      age: Number(age),
      gender,
      phone_demo: phone,
      employment_status: status,
      activity_type: activity,
      education,
      specialty: specialty || '—',
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      is_neet: isNeet,
      neet_verification: isNeet ? 'pending_verification' : 'rejected',
      needs_support: isNeet,
      support_recommendation: ['prog_ishga_marhamat_tech', 'prog_district_job_fair'],
      last_updated: new Date().toISOString().split('T')[0],
      notes,
      status_history: [
        {
          date: new Date().toISOString().split('T')[0],
          status,
          comment: 'Первичная регистрация в реестре махалли'
        }
      ]
    };

    onAddYouth(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-surface-1 w-full max-w-lg rounded-2xl border border-white/[0.14] shadow-surface-modal p-5 space-y-3.5">
        
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {lang === 'ru' ? 'Добавить молодого человека в реестр' : 'Реестрга янги ёш киритиш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-surface-3 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Ф.И.О. (демо-профиль):</label>
            <input
              type="text"
              required
              placeholder="Например: Каримов Жасур Бахтиёрович"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Махалля:</label>
              <select
                value={makhalla}
                onChange={(e) => setMakhalla(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {MAKHALLAS_LIST.map(m => (
                  <option key={m.id} value={m.name} className="bg-surface-1">{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Возраст (18–30):</label>
              <input
                type="number"
                min={18}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Пол:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Мужской" className="bg-surface-1">Мужской</option>
                <option value="Женский" className="bg-surface-1">Женский</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Статус занятости:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="безработный" className="bg-surface-1">Безработный (NEET риск)</option>
                <option value="занят" className="bg-surface-1">Занят (официальный найм)</option>
                <option value="предприниматель" className="bg-surface-1">Предприниматель / ИП</option>
                <option value="обучается" className="bg-surface-1">Обучается (ВУЗ/Колледж)</option>
                <option value="не уточнено" className="bg-surface-1">Не уточнено</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Образование:</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value as EducationLevel)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Среднее" className="bg-surface-1">Среднее</option>
                <option value="Средне-специальное" className="bg-surface-1">Средне-специальное</option>
                <option value="Неоконченное высшее" className="bg-surface-1">Неоконченное высшее</option>
                <option value="Высшее" className="bg-surface-1">Высшее</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Специальность:</label>
              <input
                type="text"
                placeholder="Электрик, бухгалтер и т.д."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Навыки (через запятую):</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">Заметка инспектора:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="submit"
              className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Зарегистрировать</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 bg-surface-3 hover:bg-surface-card text-slate-300 border border-white/[0.08] rounded-lg font-semibold text-xs transition-all"
            >
              Отмена
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
