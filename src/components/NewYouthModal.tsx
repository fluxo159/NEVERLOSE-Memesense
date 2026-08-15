import React, { useState } from 'react';
import { 
  X, UserPlus, MapPin, Calendar, User, Briefcase, GraduationCap, 
  Sparkles, FileText, Wrench, AlertTriangle, Building2
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, Gender, EducationLevel } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { CustomSelect } from './ui/CustomSelect';

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

  const makhallaOptions = MAKHALLAS_LIST.map(m => ({
    value: m.name,
    label: m.name,
    icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" />
  }));

  const genderOptions = [
    { value: 'Мужской', label: lang === 'ru' ? 'Мужской' : 'Эркак', icon: <User className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'Женский', label: lang === 'ru' ? 'Женский' : 'Аёл', icon: <User className="w-3.5 h-3.5 text-rose-400" /> }
  ];

  const statusOptions = [
    { value: 'безработный', label: lang === 'ru' ? 'Безработный (NEET риск)' : 'Ишсиз (NEET хавфи)', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { value: 'занят', label: lang === 'ru' ? 'Занят (официальный найм)' : 'Ишлайди (расмий)', icon: <Briefcase className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'предприниматель', label: lang === 'ru' ? 'Предприниматель / ИП' : 'Тадбиркор / ЯТТ', icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> },
    { value: 'обучается', label: lang === 'ru' ? 'Обучается (ВУЗ/Колледж)' : 'Ўқимоқда (ОТМ/Коллеж)', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'не уточнено', label: lang === 'ru' ? 'Не уточнено' : 'Аниқланмаган', icon: <User className="w-3.5 h-3.5 text-slate-400" /> }
  ];

  const educationOptions = [
    { value: 'Среднее', label: lang === 'ru' ? 'Среднее' : 'Ўрта', icon: <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'Средне-специальное', label: lang === 'ru' ? 'Средне-специальное' : 'Ўрта-махсус', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'Неоконченное высшее', label: lang === 'ru' ? 'Неоконченное высшее' : 'Тугалланмаган олий', icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'Высшее', label: lang === 'ru' ? 'Высшее' : 'Олий', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> }
  ];

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
      <div className="bg-surface-1 w-full max-w-lg rounded-2xl border border-white/[0.12] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Добавить молодого человека в реестр' : 'Реестрга янги ёш киритиш'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'ru' ? 'Внесение анкеты в единую базу данных района' : 'Туман ягона маълумотлар базасига киритиш'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Ф.И.О. (демо-профиль)' : 'Ф.И.Ш. (демо-профил)'}</span>
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'ru' ? 'Например: Каримов Жасур Бахтиёрович' : 'Масалан: Каримов Жасур Бахтиёрович'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Makhalla & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Махалля' : 'Маҳалла'}</span>
              </label>
              <CustomSelect
                value={makhalla}
                onChange={setMakhalla}
                options={makhallaOptions}
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Возраст (18–30)' : 'Ёши (18–30)'}</span>
              </label>
              <input
                type="number"
                min={18}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Gender & Employment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Пол' : 'Жинси'}</span>
              </label>
              <CustomSelect
                value={gender}
                onChange={(val) => setGender(val as Gender)}
                options={genderOptions}
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Статус занятости' : 'Бандлик ҳолати'}</span>
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val as EmploymentStatus)}
                options={statusOptions}
              />
            </div>
          </div>

          {/* Education & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Образование' : 'Маълумоти'}</span>
              </label>
              <CustomSelect
                value={education}
                onChange={(val) => setEducation(val as EducationLevel)}
                options={educationOptions}
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ru' ? 'Специальность' : 'Мутахассислиги'}</span>
              </label>
              <input
                type="text"
                placeholder={lang === 'ru' ? 'Электрик, бухгалтер и т.д.' : 'Электрик, бухгалтер ва ҳ.к.'}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Навыки (через запятую)' : 'Кўникмалар (вергул билан)'}</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Заметка инспектора' : 'Инспектор изоҳи'}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-200" />
              <span>{lang === 'ru' ? 'Зарегистрировать' : 'Рўйхатга олиш'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl font-medium text-xs transition-all flex items-center justify-center"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор қилиш'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
