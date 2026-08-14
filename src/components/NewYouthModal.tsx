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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {lang === 'ru' ? 'Добавить молодого человека в реестр' : 'Реестрга янги ёш киритиш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ф.И.О. (демо-профиль):</label>
            <input
              type="text"
              required
              placeholder="Например: Каримов Жасур Бахтиёрович"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Махалля:</label>
              <select
                value={makhalla}
                onChange={(e) => setMakhalla(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {MAKHALLAS_LIST.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Возраст (18–30):</label>
              <input
                type="number"
                min={18}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Пол:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Статус занятости:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="безработный">Безработный (NEET риск)</option>
                <option value="занят">Занят (официальный найм)</option>
                <option value="предприниматель">Предприниматель / ИП</option>
                <option value="обучается">Обучается (ВУЗ/Колледж)</option>
                <option value="не уточнено">Не уточнено</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Уровень образования:</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value as EducationLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Среднее">Среднее</option>
                <option value="Средне-специальное">Средне-специальное</option>
                <option value="Неоконченное высшее">Неоконченное высшее</option>
                <option value="Высшее">Высшее</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Специальность (если есть):</label>
              <input
                type="text"
                placeholder="Электрик, бухгалтер и т.д."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ключевые навыки (через запятую):</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Заметка лидера молодёжи:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Зарегистрировать</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
            >
              Отмена
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
