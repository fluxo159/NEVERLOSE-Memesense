import React, { useState } from 'react';
import { 
  X, UserPlus, MapPin, Calendar, User, Briefcase, GraduationCap, 
  Sparkles, FileText, Wrench, AlertTriangle, Building2
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, Gender, EducationLevel, SupportProgram } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { CustomSelect } from './ui/CustomSelect';
import { t, getMahallaName } from '../data/translations';

interface NewYouthModalProps {
  onClose: () => void;
  onAddYouth: (youth: YouthProfile) => void;
  supportPrograms: SupportProgram[];
  selectedMakhalla: string;
  lang: 'ru' | 'uz';
}

export const NewYouthModal: React.FC<NewYouthModalProps> = ({
  onClose,
  onAddYouth,
  supportPrograms,
  selectedMakhalla,
  lang
}) => {
  const tr = t[lang];
  const [fullName, setFullName] = useState('');
  const [makhalla, setMakhalla] = useState(selectedMakhalla !== 'all' ? selectedMakhalla : MAKHALLAS_LIST[0].name);
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<Gender>('Мужской');
  const [phone, setPhone] = useState('+998 (90) 000-00-00');
  const [status, setStatus] = useState<EmploymentStatus>('безработный');
  const [activity, setActivity] = useState(lang === 'ru' ? 'нет деятельности' : 'faoliyatsiz');
  const [education, setEducation] = useState<EducationLevel>('Средне-специальное');
  const [specialty, setSpecialty] = useState('');
  const [skills, setSkills] = useState(lang === 'ru' ? 'Водительские права, Базовый ПК' : 'Haydovchilik guvohnomasi, Kompyuter savodxonligi');
  const [notes, setNotes] = useState(lang === 'ru' ? 'Первичное внесение через опрос «Ёшлар етакчиси»' : 'Mahalla yetakchisining xonadonbay so‘rovi orqali kiritildi');

  const makhallaOptions = MAKHALLAS_LIST.map(m => ({
    value: m.name,
    label: getMahallaName(m.name, lang),
    icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" />
  }));

  const genderOptions = [
    { value: 'Мужской', label: tr.registryFilterMale, icon: <User className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'Женский', label: tr.registryFilterFemale, icon: <User className="w-3.5 h-3.5 text-rose-400" /> }
  ];

  const statusOptions = [
    { value: 'безработный', label: tr.registryFilterNeetPending, icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { value: 'занят', label: tr.registryFilterEmployed, icon: <Briefcase className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'предприниматель', label: tr.registryFilterBusiness, icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> },
    { value: 'обучается', label: tr.registryFilterStudying, icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'не уточнено', label: lang === 'ru' ? 'Не уточнено' : 'Aniqlanmagan', icon: <User className="w-3.5 h-3.5 text-slate-400" /> }
  ];

  const educationOptions = [
    { value: 'Среднее', label: lang === 'ru' ? 'Среднее' : 'O‘rta', icon: <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'Средне-специальное', label: lang === 'ru' ? 'Средне-специальное' : 'O‘rta-maxsus', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> },
    { value: 'Неоконченное высшее', label: lang === 'ru' ? 'Неоконченное высшее' : 'Tugallanmagan oliy', icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> },
    { value: 'Высшее', label: lang === 'ru' ? 'Высшее' : 'Oliy', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const isNeet = (status === 'безработный' || status === 'не уточнено');

    const newProfile: YouthProfile = {
      id: `y_${Date.now().toString().slice(-4)}`,
      full_name_demo: `${fullName.trim()}`,
      makhalla,
      age: Number(age),
      gender,
      phone_demo: phone,
      employment_status: status,
      activity_type: activity,
      education,
      specialty: specialty || '—',
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      notes,
      is_neet: isNeet,
      neet_verification: isNeet ? 'pending_verification' : 'verified',
      needs_support: isNeet,
      support_recommendation: isNeet 
        ? ['prog_ishga_marhamat_tech', 'prog_district_job_fair'] 
        : ['prog_it_park_bootcamp', 'prog_micro_credit_biz'],
      status_history: [
        {
          date: new Date().toISOString().split('T')[0],
          status: status,
          comment: lang === 'ru' ? 'Первичное внесение в единую базу молодёжи' : 'Yagona yoshlar bazasiga dastlabki kiritish'
        }
      ],
      last_updated: new Date().toISOString().split('T')[0]
    };

    onAddYouth(newProfile);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-xl rounded-2xl border border-white/[0.14] shadow-surface-modal p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {tr.newYouthModalTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {tr.newYouthModalSubtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.newYouthFullName}</span>
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
              <input
                type="text"
                required
                placeholder={tr.newYouthFullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Makhalla & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{tr.newYouthMakhalla}</span>
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
                <span>{tr.newYouthAge}</span>
              </label>
              <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
                <input
                  type="number"
                  min={18}
                  max={30}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Gender & Employment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{tr.newYouthGender}</span>
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
                <span>{tr.newYouthStatus}</span>
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
                <span>{tr.newYouthEducation}</span>
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
                <span>{tr.newYouthSpecialty}</span>
              </label>
              <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
                <input
                  type="text"
                  placeholder={tr.newYouthSpecialtyPlaceholder}
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.newYouthSkills}</span>
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl px-3 py-2 transition-all shadow-sm">
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.newYouthNotes}</span>
            </label>
            <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl p-2.5 transition-all shadow-sm">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-200" />
              <span>{tr.newYouthBtnSubmit}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl font-medium text-xs transition-all flex items-center justify-center"
            >
              {tr.newYouthBtnCancel}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
