import React, { useState } from 'react';
import { 
  X, MapPin, Phone, GraduationCap, Calendar, 
  Sparkles, CheckCircle2, History, ArrowRight, ShieldCheck, 
  Printer, Wrench, Code, Gift, TrendingUp, Briefcase
} from 'lucide-react';
import { YouthProfile, EmploymentStatus, UserRole, SupportProgram } from '../types';
import { SUPPORT_PROGRAMS } from '../data/supportPrograms';

interface YouthModalCardProps {
  youth: YouthProfile;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: EmploymentStatus, comment: string) => void;
  onAssignProgram: (id: string, program: SupportProgram) => void;
  userRole: UserRole;
  lang: 'ru' | 'uz';
}

export const YouthModalCard: React.FC<YouthModalCardProps> = ({
  youth,
  onClose,
  onUpdateStatus,
  onAssignProgram,
  userRole,
  lang
}) => {
  const [newStatus, setNewStatus] = useState<EmploymentStatus>(youth.employment_status);
  const [statusComment, setStatusComment] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'recommendations'>('overview');

  const handleSaveStatus = () => {
    if (newStatus !== youth.employment_status || statusComment) {
      onUpdateStatus(youth.id, newStatus, statusComment || 'Обновление статуса в системе');
      setIsUpdatingStatus(false);
      setStatusComment('');
    }
  };

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'Code': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Gift': return <Gift className="w-5 h-5 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-400" />;
      default: return <Briefcase className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-gov-950/80 via-slate-900 to-gov-950/80 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-gov-700 p-0.5 shadow-lg shadow-cyan-900/30 flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                {youth.full_name_demo.split(' ')[0][0]}{youth.full_name_demo.split(' ')[1] ? youth.full_name_demo.split(' ')[1][0] : ''}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-extrabold text-white">{youth.full_name_demo}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
                  {youth.id}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-slate-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {youth.makhalla}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">{youth.age} лет ({youth.gender})</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {youth.phone_demo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Печать"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/70 px-6 text-xs font-bold text-slate-400 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            📋 Общие сведения
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'border-cyan-400 text-cyan-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>История ({youth.status_history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'recommendations' ? 'border-emerald-400 text-emerald-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Маршрутизация & Госпрограммы</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Status Box */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Текущий статус занятости:</div>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-lg font-bold text-white capitalize">{youth.employment_status}</span>
                    {youth.is_neet && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold whitespace-nowrap">
                        ⚠️ NEET ({youth.neet_verification === 'verified' ? 'Подтверждён' : 'На проверке'})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Сфера: <strong className="text-white">{youth.activity_type}</strong>
                  </div>
                </div>

                <div>
                  {!isUpdatingStatus ? (
                    <button
                      onClick={() => setIsUpdatingStatus(true)}
                      className="px-4 py-2 bg-gov-600 hover:bg-gov-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      ✏️ Изменить статус
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
                        className="bg-slate-900 border border-cyan-500 rounded-xl text-xs text-white px-3 py-1.5 focus:outline-none"
                      >
                        <option value="занят">Занят (найм)</option>
                        <option value="предприниматель">Бизнес / ИП</option>
                        <option value="обучается">Обучается (ВУЗ)</option>
                        <option value="направлен на обучение">Направлен на обучение</option>
                        <option value="безработный">Безработный</option>
                        <option value="не уточнено">Не уточнено</option>
                      </select>
                      <button
                        onClick={handleSaveStatus}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => setIsUpdatingStatus(false)}
                        className="px-2.5 py-1.5 bg-slate-700 text-slate-300 rounded-xl text-xs"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>Образование & Специальность</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div>Уровень: <strong className="text-white">{youth.education}</strong></div>
                    {youth.specialty && <div>Специальность: <strong className="text-slate-200">{youth.specialty}</strong></div>}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Навыки и компетенции</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {youth.skills.map((skill, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-200 border border-slate-600/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leader Notes */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Заметки выездного опроса («Ёшлар етакчиси»)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                  {youth.notes || 'Записи по выездным опросам отсутствуют.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-semibold">
                Хронологический трекер жизненного цикла:
              </div>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {youth.status_history.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white capitalize text-sm">{hist.status}</span>
                        <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {hist.date}
                        </span>
                      </div>
                      {hist.comment && (
                        <p className="text-xs text-slate-300 mt-1">{hist.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SMART RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {SUPPORT_PROGRAMS.map(prog => {
                  const isRecommended = youth.support_recommendation.includes(prog.id);
                  const isCurrentAssigned = youth.assigned_program?.id === prog.id;

                  return (
                    <div
                      key={prog.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentAssigned
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : isRecommended
                          ? 'border-cyan-500/40 bg-slate-800/90'
                          : 'border-slate-700/60 bg-slate-850/50 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0">
                            {getProgramIcon(prog.iconName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{prog.title}</h5>
                              {isRecommended && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold whitespace-nowrap">
                                  ★ Рекомендовано
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                              {prog.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span>Срок: <strong className="text-white">{prog.duration}</strong></span>
                              <span>Стипендия/Грант: <strong className="text-emerald-400">{prog.stipend}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isCurrentAssigned ? (
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Направлен
                            </span>
                          ) : (
                            <button
                              onClick={() => onAssignProgram(youth.id, prog)}
                              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
                            >
                              Направить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Синтетический демо-профиль NEXUS30 | Персональные данные защищены</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
