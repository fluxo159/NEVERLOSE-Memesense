import React, { useState } from 'react';
import { 
  X, User, MapPin, Phone, Briefcase, GraduationCap, Calendar, 
  Sparkles, CheckCircle2, AlertOctagon, History, ArrowRight, ShieldCheck, 
  Share2, Printer, PlusCircle, Wrench, Code, Gift, TrendingUp
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-gov-950/80 via-slate-900 to-gov-950/80 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-gov-700 p-0.5 shadow-lg shadow-cyan-900/30 flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                {youth.full_name_demo.split(' ')[0][0]}{youth.full_name_demo.split(' ')[1] ? youth.full_name_demo.split(' ')[1][0] : ''}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">{youth.full_name_demo}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  ID: {youth.id}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {youth.makhalla}
                </span>
                <span>•</span>
                <span>{youth.age} лет ({youth.gender})</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {youth.phone_demo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Печать карточки"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 text-xs font-semibold text-slate-400 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            📋 Общие сведения & Статус
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'border-cyan-400 text-cyan-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История статусов ({youth.status_history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'recommendations' ? 'border-emerald-400 text-emerald-300' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Маршрутизация & Господдержка</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Status & NEET Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-850 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Текущий статус занятости:</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-white capitalize">{youth.employment_status}</span>
                    {youth.is_neet && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                        ⚠️ NEET ({youth.neet_verification === 'verified' ? 'Подтверждён' : 'На проверке'})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Сфера: <strong className="text-slate-200">{youth.activity_type}</strong>
                  </div>
                </div>

                <div>
                  {!isUpdatingStatus ? (
                    <button
                      onClick={() => setIsUpdatingStatus(true)}
                      className="px-3.5 py-1.5 bg-gov-600 hover:bg-gov-500 text-white rounded-xl text-xs font-semibold transition-all shadow"
                    >
                      ✏️ Изменить статус
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
                        className="bg-slate-900 border border-cyan-500 rounded-lg text-xs text-white px-2 py-1"
                      >
                        <option value="занят">Занят (найм)</option>
                        <option value="предприниматель">Предприниматель / ИП</option>
                        <option value="обучается">Обучается (ВУЗ)</option>
                        <option value="направлен на обучение">Направлен на обучение</option>
                        <option value="безработный">Безработный</option>
                        <option value="не уточнено">Не уточнено</option>
                      </select>
                      <button
                        onClick={handleSaveStatus}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => setIsUpdatingStatus(false)}
                        className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid: Education & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Education */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>Образование & Квалификация</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Уровень:</span>
                      <span className="font-medium text-white">{youth.education}</span>
                    </div>
                    {youth.specialty && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Специальность:</span>
                        <span className="font-medium text-slate-200">{youth.specialty}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Ключевые навыки & Компетенции</span>
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

              {/* Leader Notes & Inspection Log */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Заметки уполномоченного сотрудника («Ёшлар етакчиси»)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  {youth.notes || 'Записи по выездным опросам отсутствуют.'}
                </p>
              </div>

              {/* Active Program Assignment if exists */}
              {youth.assigned_program && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Текущая государственная программа поддержки</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Направлен: {youth.assigned_at || youth.last_updated}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-200">{youth.assigned_program.title}</div>
                  <div className="text-[11px] text-slate-300 mt-1">{youth.assigned_program.description}</div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Хронологическая история изменений статуса занятости и маршрутных мероприятий:
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {youth.status_history.map((hist, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white capitalize">{hist.status}</span>
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-400" />
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

          {/* TAB 3: SMART RECOMMENDATIONS & ROUTING */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Рекомендованные меры содействия (Smart Routing Engine)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Система подобрала наиболее эффективные направления на основе возраста, образования и навыков:
                  </p>
                </div>
              </div>

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
                          ? 'border-cyan-500/40 bg-slate-800/90 hover:border-cyan-400'
                          : 'border-slate-700/60 bg-slate-850/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                            {getProgramIcon(prog.iconName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-white">{prog.title}</h5>
                              {isRecommended && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                                  ★ Рекомендовано
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Провайдер: <span className="text-slate-300 font-medium">{prog.provider}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                              {prog.description}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                              <span>⏱ Срок: <strong className="text-slate-200">{prog.duration}</strong></span>
                              <span>💰 Стипендия/субсидия: <strong className="text-emerald-400">{prog.stipend}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isCurrentAssigned ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Направлен
                            </span>
                          ) : (
                            <button
                              onClick={() => onAssignProgram(youth.id, prog)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gov-600 to-cyan-600 hover:from-gov-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all flex items-center gap-1"
                            >
                              <span>Направить</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
