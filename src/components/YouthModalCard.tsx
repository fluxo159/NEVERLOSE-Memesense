import React, { useState } from 'react';
import { 
  X, MapPin, Phone, GraduationCap, Calendar, 
  Sparkles, CheckCircle2, History, ArrowRight, ShieldCheck, 
  Printer, Wrench, Code, Gift, TrendingUp, Briefcase, FileText
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, UserRole, SupportProgram } from '../types';
import { t } from '../data/translations';

interface YouthModalCardProps {
  youth: YouthProfile;
  supportPrograms: SupportProgram[];
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: EmploymentStatus, comment: string) => void;
  onAssignProgram: (id: string, program: SupportProgram) => void;
  userRole: UserRole;
  lang: 'ru' | 'uz';
}

export const YouthModalCard: React.FC<YouthModalCardProps> = ({
  youth,
  supportPrograms,
  onClose,
  onUpdateStatus,
  onAssignProgram,
  userRole,
  lang
}) => {
  const tr = t[lang];
  const [newStatus, setNewStatus] = useState<EmploymentStatus>(youth.employment_status);
  const [statusComment, setStatusComment] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'recommendations'>('overview');

  const handleSaveStatus = () => {
    if (newStatus !== youth.employment_status || statusComment) {
      onUpdateStatus(youth.id, newStatus, statusComment || (lang === 'ru' ? 'Обновление статуса в системе' : 'Тизимда ҳолат янгиланди'));
      setIsUpdatingStatus(false);
      setStatusComment('');
    }
  };

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-slate-400" />;
      case 'Code': return <Code className="w-4 h-4 text-slate-400" />;
      case 'Gift': return <Gift className="w-4 h-4 text-slate-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-slate-400" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-slate-400" />;
      default: return <Briefcase className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-3xl rounded-2xl border border-white/[0.14] shadow-surface-modal overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] bg-surface-2/80 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-brand-linear p-0.5 shadow-glow-brand flex-shrink-0">
              <div className="w-full h-full bg-surface-1 rounded-[10px] flex items-center justify-center text-lg font-bold text-white">
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
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {youth.makhalla}
                </span>
                <span>•</span>
                <span className="text-slate-400">{youth.age} {lang === 'ru' ? 'лет' : 'ёш'} ({youth.gender === 'Мужской' ? tr.registryFilterMale : tr.registryFilterFemale})</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {youth.phone_demo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-surface-2 text-slate-400 hover:text-white border border-white/[0.08] hover:bg-surface-3 transition-colors"
              title={tr.profileCardBtnPrint}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-surface-2 text-slate-400 hover:text-white border border-white/[0.08] hover:bg-surface-3 transition-colors"
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
            <FileText className="w-3.5 h-3.5" />
            <span>{tr.profileCardTabOverview}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'border-indigo-400 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{tr.profileCardTabHistory} ({youth.status_history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'recommendations' ? 'border-indigo-400 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr.profileCardTabRouting}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              
              {/* Status Box */}
              <div className="p-4 rounded-xl bg-surface-2 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{tr.registryThStatus}:</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-base font-bold text-white capitalize">{youth.employment_status}</span>
                    {youth.is_neet && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                        youth.neet_verification === 'verified'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}>
                        ⚠️ NEET ({youth.neet_verification === 'verified' ? tr.triageCardVerifiedBadge : tr.triageTabPending})
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
                      className="px-3 py-1.5 bg-surface-3 hover:bg-surface-card border border-white/[0.12] text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      ✏️ {tr.profileCardChangeStatus}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="bg-surface-1 border border-indigo-500/50 rounded-lg pr-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
                          className="bg-transparent text-xs text-white px-2.5 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="занят" className="bg-surface-1">{tr.registryFilterEmployed}</option>
                          <option value="предприниматель" className="bg-surface-1">{tr.registryFilterBusiness}</option>
                          <option value="обучается" className="bg-surface-1">{tr.registryFilterStudying}</option>
                          <option value="направлен на обучение" className="bg-surface-1">{tr.registryFilterCourses}</option>
                          <option value="безработный" className="bg-surface-1">{tr.registryFilterUnemployed}</option>
                          <option value="не уточнено" className="bg-surface-1">{lang === 'ru' ? 'Не уточнено' : 'Аниқланмаган'}</option>
                        </select>
                      </div>
                      <button
                        onClick={handleSaveStatus}
                        className="px-3 py-1 bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 rounded-lg text-xs font-bold"
                      >
                        {tr.verifBtnSave}
                      </button>
                      <button
                        onClick={() => setIsUpdatingStatus(false)}
                        className="px-2 py-1 bg-surface-3 text-slate-400 hover:text-white rounded-lg text-xs"
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
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tr.profileCardEducation} & {tr.profileCardSpecialty}</span>
                  </div>
                  <div className="text-xs space-y-0.5 text-slate-300">
                    <div>{lang === 'ru' ? 'Уровень:' : 'Даражаси:'} <strong className="text-white">{youth.education}</strong></div>
                    {youth.specialty && <div>{tr.profileCardSpecialty} <strong className="text-slate-300">{youth.specialty}</strong></div>}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
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
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tr.profileCardNotes} («Ёшлар етакчиси»)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-1/80 p-2.5 rounded-lg border border-white/[0.04]">
                  {youth.notes || (lang === 'ru' ? 'Записи по выездным опросам отсутствуют.' : 'Хонадонбай ўрганиш бўйича ёзувлар мавжуд эмас.')}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
                {lang === 'ru' ? 'Хронологический трекер жизненного цикла:' : 'Ҳолатлар хронологияси:'}
              </div>

              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-3">
                {youth.status_history.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-surface-1 border-2 border-slate-500 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.06] space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white capitalize">{hist.status}</span>
                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
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
            <div className="space-y-3">
              {supportPrograms.map(prog => {
                const isRecommended = youth.support_recommendation.includes(prog.id);
                const isCurrentAssigned = youth.assigned_program?.id === prog.id;

                return (
                  <div
                    key={prog.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentAssigned
                        ? 'border-emerald-500/50 bg-emerald-950/15'
                        : isRecommended
                        ? 'border-indigo-500/40 bg-surface-2'
                        : 'border-white/[0.06] bg-surface-2/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-surface-3 border border-white/[0.08] flex-shrink-0">
                          {getProgramIcon(prog.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">{prog.title}</h5>
                            {isRecommended && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold whitespace-nowrap">
                                ★ {lang === 'ru' ? 'Рекомендовано' : 'Тавсия этилган'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {prog.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            <span>{tr.routingModalDuration} <strong className="text-white">{prog.duration}</strong></span>
                            <span>{tr.routingModalStipend} <strong className="text-emerald-400">{prog.stipend}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isCurrentAssigned ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" /> {lang === 'ru' ? 'Направлен' : 'Бириктирилган'}
                          </span>
                        ) : (
                          <button
                            onClick={() => onAssignProgram(youth.id, prog)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all whitespace-nowrap"
                          >
                            {tr.profileCardBtnAssign}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
