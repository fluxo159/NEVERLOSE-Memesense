import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, MapPin, Phone, GraduationCap, Calendar, 
  Route, CheckCircle2, History, ArrowRight, ShieldCheck, 
  Printer, Wrench, Code, Gift, TrendingUp, Briefcase, User, AlertCircle,
  Search, Check, Sparkles, Filter
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, UserRole, SupportProgram } from '../types';
import { CustomSelect } from './ui/CustomSelect';
import { t, getMahallaName, getEducationName } from '../data/translations';

interface YouthModalCardProps {
  youth: YouthProfile;
  supportPrograms: SupportProgram[];
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: EmploymentStatus, comment: string) => void;
  onAssignProgram: (id: string, program: SupportProgram) => void;
  userRole?: UserRole;
  lang: 'ru' | 'uz';
}

export const YouthModalCard: React.FC<YouthModalCardProps> = ({
  youth,
  supportPrograms,
  onClose,
  onUpdateStatus,
  onAssignProgram,
  lang
}) => {
  const tr = t[lang];
  const [newStatus, setNewStatus] = useState<EmploymentStatus>(youth.employment_status);
  const [statusComment, setStatusComment] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'recommendations'>('overview');
  const [programFilter, setProgramFilter] = useState<'all' | 'recommended' | 'training' | 'finance' | 'employment'>('all');
  const [programSearch, setProgramSearch] = useState<string>('');

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSaveStatus = () => {
    if (newStatus !== youth.employment_status || statusComment) {
      onUpdateStatus(youth.id, newStatus, statusComment || (lang === 'ru' ? 'Обновление статуса в системе' : 'Tizimda holat yangilandi'));
      setIsUpdatingStatus(false);
      setStatusComment('');
    }
  };

  const statusOptions = [
    { value: 'безработный', label: tr.registryFilterUnemployed },
    { value: 'занят', label: tr.registryFilterEmployed },
    { value: 'предприниматель', label: tr.registryFilterBusiness },
    { value: 'обучается', label: tr.registryFilterStudying },
    { value: 'направлен на обучение', label: tr.registryFilterCourses },
    { value: 'не уточнено', label: lang === 'ru' ? 'Не уточнено' : 'Aniqlanmagan' }
  ];

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'Code': return <Code className="w-4 h-4 text-cyan-400" />;
      case 'Gift': return <Gift className="w-4 h-4 text-indigo-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-3xl rounded-2xl border border-white/[0.12] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default overscroll-contain"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] bg-surface-2/80 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-sm shadow-indigo-500/20 flex-shrink-0">
              <div className="w-full h-full bg-surface-1 rounded-[10px] flex items-center justify-center text-base font-bold text-white">
                {youth.full_name_demo.split(' ')[0][0]}{youth.full_name_demo.split(' ')[1] ? youth.full_name_demo.split(' ')[1][0] : ''}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">{youth.full_name_demo}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-bold">
                  {youth.id}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {getMahallaName(youth.makhalla, lang)}
                </span>
                <span>•</span>
                <span className="text-slate-400">{youth.age} {lang === 'ru' ? 'лет' : 'yosh'} ({youth.gender === 'Мужской' ? tr.registryFilterMale : tr.registryFilterFemale})</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {youth.phone_demo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-surface-2 text-slate-400 hover:text-white border border-white/[0.08] hover:bg-surface-3 transition-colors"
              title={tr.profileCardBtnPrint}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-2 text-slate-400 hover:text-white border border-white/[0.08] hover:bg-surface-3 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-white/[0.08] bg-surface-2/40 px-5 text-xs font-semibold text-slate-400 gap-5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'border-indigo-400 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>{tr.profileCardTabOverview}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'border-indigo-400 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>{tr.profileCardTabHistory} ({youth.status_history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'recommendations' ? 'border-indigo-400 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-indigo-400" />
            <span>{tr.profileCardTabRouting}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5 view-transition">
              
              {/* Status Box */}
              <div className="p-4 rounded-xl bg-surface-2 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {tr.registryThStatus}:
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-white capitalize">{youth.employment_status}</span>
                    {youth.is_neet && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-3 text-slate-300 border border-white/[0.08] text-xs font-medium whitespace-nowrap">
                        <span className={`w-1.5 h-1.5 rounded-full ${youth.neet_verification === 'verified' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                        <span>NEET ({youth.neet_verification === 'verified' ? tr.triageCardVerifiedBadge : tr.triageTabPending})</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {tr.profileCardActivity} <strong className="text-slate-200">{youth.activity_type}</strong>
                  </div>
                </div>

                <div>
                  {!isUpdatingStatus ? (
                    <button
                      onClick={() => setIsUpdatingStatus(true)}
                      className="px-3 py-1.5 bg-surface-3 hover:bg-surface-2 border border-white/[0.12] text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      {tr.profileCardChangeStatus}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <CustomSelect
                        value={newStatus}
                        onChange={(val) => setNewStatus(val as EmploymentStatus)}
                        options={statusOptions}
                        className="min-w-[170px]"
                      />
                      <button
                        onClick={handleSaveStatus}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-indigo-500/25"
                      >
                        {tr.verifBtnSave}
                      </button>
                      <button
                        onClick={() => setIsUpdatingStatus(false)}
                        className="px-2.5 py-1.5 bg-surface-3 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
                      >
                        {tr.profileCardBtnCancelStatus}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{tr.profileCardEducation} & {tr.profileCardSpecialty}</span>
                  </div>
                  <div className="text-xs space-y-0.5 text-slate-300">
                    <div>{lang === 'ru' ? 'Уровень:' : 'Darajasi:'} <strong className="text-white">{getEducationName(youth.education, lang)}</strong></div>
                    {youth.specialty && <div>{tr.profileCardSpecialty}: <strong className="text-slate-300">{youth.specialty}</strong></div>}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr.profileCardSkills}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {youth.skills.map((skill, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-3 text-slate-300 border border-white/[0.06]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leader Notes */}
              <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/[0.06] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{tr.profileCardNotes} ({lang === 'ru' ? '«Ёшлар етакчиси»' : '«Yoshlar yetakchisi»'})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-1/80 p-2.5 rounded-lg border border-white/[0.04]">
                  {youth.notes || (lang === 'ru' ? 'Записи по выездным опросам отсутствуют.' : 'Xonadonbay o‘rganish bo‘yicha yozuvlar mavjud emas.')}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-3 view-transition">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
                {lang === 'ru' ? 'Хронологический трекер жизненного цикла:' : 'Holatlar xronologiyasi:'}
              </div>

              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-3">
                {youth.status_history.map((hist, idx) => (
                  <div 
                    key={idx} 
                    style={{ animationDelay: `${idx * 60}ms` }}
                    className="relative animate-row-slide"
                  >
                    <div className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-surface-1 border-2 border-indigo-400 flex items-center justify-center ${
                      idx === youth.status_history.length - 1 ? 'animate-timeline-node ring-2 ring-indigo-400/40' : ''
                    }`}>
                      <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.06] space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white capitalize">{hist.status}</span>
                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          {hist.date}
                        </span>
                      </div>
                      {hist.comment && (
                        <p className="text-xs text-slate-300 mt-0.5">{hist.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SMART RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3 view-transition">
              
              {/* Search & Category Filter Toolbar */}
              <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    placeholder={lang === 'ru' ? 'Поиск программы поддержки...' : 'Yordam dasturlarini qidirish...'}
                    className="w-full bg-surface-1 border border-white/[0.08] focus:border-indigo-500/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  {programSearch && (
                    <button
                      onClick={() => setProgramSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <button
                    onClick={() => setProgramFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap border text-xs ${
                      programFilter === 'all'
                        ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                        : 'bg-surface-1 text-slate-400 border-white/[0.06] hover:bg-surface-3 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Все' : 'Barchasi'} ({supportPrograms.length})
                  </button>

                  <button
                    onClick={() => setProgramFilter('recommended')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap border text-xs flex items-center gap-1.5 ${
                      programFilter === 'recommended'
                        ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                        : 'bg-surface-1 text-slate-400 border-white/[0.06] hover:bg-surface-3 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>{lang === 'ru' ? 'Рекомендованные' : 'Tavsiya etilgan'}</span>
                    <span className="text-[10px] text-slate-400">({youth.support_recommendation.length})</span>
                  </button>

                  <button
                    onClick={() => setProgramFilter('training')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap border text-xs ${
                      programFilter === 'training'
                        ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                        : 'bg-surface-1 text-slate-400 border-white/[0.06] hover:bg-surface-3 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Обучение & Курсы' : 'Ta’lim va kurslar'}
                  </button>

                  <button
                    onClick={() => setProgramFilter('finance')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap border text-xs ${
                      programFilter === 'finance'
                        ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                        : 'bg-surface-1 text-slate-400 border-white/[0.06] hover:bg-surface-3 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Субсидии & Кредиты' : 'Subsidiya & Kredit'}
                  </button>

                  <button
                    onClick={() => setProgramFilter('employment')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap border text-xs ${
                      programFilter === 'employment'
                        ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                        : 'bg-surface-1 text-slate-400 border-white/[0.06] hover:bg-surface-3 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Трудоустройство' : 'To‘g‘ridan bandlik'}
                  </button>
                </div>
              </div>

              {/* Filtered Programs List */}
              <div className="space-y-2.5">
                {(() => {
                  const filtered = supportPrograms.filter(prog => {
                    const isRecommended = youth.support_recommendation.includes(prog.id);
                    if (programFilter === 'recommended' && !isRecommended) return false;
                    if (programFilter === 'training' && !['prog_mono', 'prog_it_park'].includes(prog.id)) return false;
                    if (programFilter === 'finance' && !['prog_daftari', 'prog_credit'].includes(prog.id)) return false;
                    if (programFilter === 'employment' && !['prog_job_fair'].includes(prog.id)) return false;

                    if (programSearch.trim()) {
                      const q = programSearch.toLowerCase();
                      const titleRu = prog.title.toLowerCase();
                      const titleUz = (prog.titleUz || '').toLowerCase();
                      const descRu = prog.description.toLowerCase();
                      const descUz = (prog.descriptionUz || '').toLowerCase();
                      const prov = prog.provider.toLowerCase();
                      return titleRu.includes(q) || titleUz.includes(q) || descRu.includes(q) || descUz.includes(q) || prov.includes(q);
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center bg-surface-2/40 rounded-xl border border-white/[0.06] space-y-1.5">
                        <Route className="w-6 h-6 text-slate-500 mx-auto" />
                        <div className="text-xs font-semibold text-slate-300">
                          {lang === 'ru' ? 'Программы не найдены' : 'Dasturlar topilmadi'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'ru' ? 'Попробуйте изменить параметры поиска или фильтра' : 'Qidiruv parametrlarini o‘zgartirib ko‘ring'}
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((prog, idx) => {
                    const isRecommended = youth.support_recommendation.includes(prog.id);
                    const isCurrentAssigned = youth.assigned_program?.id === prog.id;
                    const title = (lang === 'uz' && prog.titleUz) ? prog.titleUz : prog.title;
                    const description = (lang === 'uz' && prog.descriptionUz) ? prog.descriptionUz : prog.description;
                    const duration = (lang === 'uz' && prog.durationUz) ? prog.durationUz : prog.duration;
                    const stipend = (lang === 'uz' && prog.stipendUz) ? prog.stipendUz : prog.stipend;

                    return (
                      <div
                        key={prog.id}
                        style={{ animationDelay: `${idx * 35}ms` }}
                        className={`animate-card-cascade p-3.5 rounded-xl border transition-all ${
                          isCurrentAssigned
                            ? 'border-emerald-500/30 bg-surface-2 shadow-sm'
                            : isRecommended
                            ? 'border-indigo-500/30 bg-surface-2 hover:border-indigo-500/50'
                            : 'border-white/[0.08] bg-surface-2/60 hover:bg-surface-2 hover:border-white/[0.14]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-surface-3 border border-white/[0.08] text-slate-300 flex-shrink-0">
                              {getProgramIcon(prog.iconName)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-white">{title}</h5>
                                {isRecommended && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-3 text-slate-300 border border-white/[0.08] text-[10px] font-medium whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                    <span>{lang === 'ru' ? 'Рекомендовано' : 'Tavsiya'}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                {description}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 flex-wrap">
                                <span>{tr.routingModalDuration} <strong className="text-white">{duration}</strong></span>
                                <span>{tr.routingModalStipend} <strong className="text-emerald-400">{stipend}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {isCurrentAssigned ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap shadow-sm">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>{lang === 'ru' ? 'Направлен' : 'Biriktirilgan'}</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => onAssignProgram(youth.id, prog)}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all whitespace-nowrap shadow-sm active:scale-[0.98]"
                              >
                                {tr.profileCardBtnAssign}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-surface-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Синтетический демо-профиль NEXUS30 | Персональные данные защищены</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-surface-3 hover:bg-surface-card text-slate-200 border border-white/[0.08] rounded-lg font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
