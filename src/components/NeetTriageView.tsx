import React, { useState } from 'react';
import { 
  AlertOctagon, CheckCircle, XCircle, Search, 
  MapPin, ShieldAlert, Sparkles, UserCheck, Phone, ArrowRight, Eye, GraduationCap, Briefcase
} from 'lucide-react';
import { YouthProfile, UserRole } from '../types';
import { SUPPORT_PROGRAMS } from '../data/supportPrograms';

interface NeetTriageViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onVerifyNeet: (id: string, isNeet: boolean, comment: string) => void;
  onOpenProfile: (youth: YouthProfile) => void;
  onRouteProgram: (youth: YouthProfile) => void;
}

export const NeetTriageView: React.FC<NeetTriageViewProps> = ({
  youthList,
  selectedMakhalla,
  userRole,
  lang,
  onVerifyNeet,
  onOpenProfile,
  onRouteProgram
}) => {
  const [filterMakhalla, setFilterMakhalla] = useState<string>(selectedMakhalla !== 'all' ? selectedMakhalla : 'all');
  const [filterVerification, setFilterVerification] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for inline verification dialog
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationComment, setVerificationComment] = useState<string>('');

  const neetCandidates = youthList.filter(youth => {
    if (!youth.is_neet && youth.neet_verification !== 'verified') return false;
    if (filterMakhalla !== 'all' && youth.makhalla !== filterMakhalla) return false;

    if (filterVerification === 'pending' && youth.neet_verification !== 'pending_verification') return false;
    if (filterVerification === 'verified' && youth.neet_verification !== 'verified') return false;
    if (filterVerification === 'rejected' && youth.neet_verification !== 'rejected') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        youth.full_name_demo.toLowerCase().includes(q) ||
        youth.makhalla.toLowerCase().includes(q) ||
        youth.education.toLowerCase().includes(q) ||
        (youth.specialty && youth.specialty.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const pendingCount = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const verifiedCount = youthList.filter(y => y.is_neet && y.neet_verification === 'verified').length;
  const totalCount = youthList.filter(y => y.is_neet || y.neet_verification === 'verified').length;

  const handleStartVerify = (youth: YouthProfile) => {
    setVerifyingId(youth.id);
    setVerificationComment(youth.notes || 'По результатам выездного обследования сотрудника махалли');
  };

  const handleConfirmAction = (isNeetConfirmed: boolean) => {
    if (verifyingId) {
      onVerifyNeet(verifyingId, isNeetConfirmed, verificationComment);
      setVerifyingId(null);
      setVerificationComment('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Calm & Clear Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Верификация группы внимания (NEET)' : 'NEET ёшлар текшируви'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold whitespace-nowrap">
                {lang === 'ru' ? 'Личный обход махалли' : 'Маҳалла кўриги'}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {lang === 'ru'
                ? 'Система автоматически выделяет молодых людей без официальной работы или учёбы. Уполномоченный сотрудник подтверждает статус после личного визита и подбирает меры господдержки.'
                : 'Тизим ишсиз ёшларни аниқлайди. Маҳалла етакчиси суҳбат асосида мақомни тасдиқлайди ва ёрдам беради.'}
            </p>
          </div>

          {/* Clean Quick Metric Chips */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700/80 text-center min-w-[130px]">
              <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'На проверке' : 'Кутмоқда'}</div>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{pendingCount}</div>
            </div>
            <div className="flex-1 sm:flex-initial bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700/80 text-center min-w-[130px]">
              <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Подтверждено' : 'Тасдиқланган'}</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{verifiedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Control Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Поиск по имени, специальности, махалле...' : 'Ф.И.Ш. ёки маҳалла бўйича излаш...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Clean Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterVerification('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterVerification === 'pending'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>⏳ {lang === 'ru' ? 'Требуют проверки' : 'Текширувда'}</span>
            <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">{pendingCount}</span>
          </button>

          <button
            onClick={() => setFilterVerification('verified')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterVerification === 'verified'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>✅ {lang === 'ru' ? 'Подтверждённые NEET' : 'Тасдиқланган'}</span>
            <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">{verifiedCount}</span>
          </button>

          <button
            onClick={() => setFilterVerification('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterVerification === 'all'
                ? 'bg-gov-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {lang === 'ru' ? 'Все' : 'Барчаси'} ({totalCount})
          </button>
        </div>

      </div>

      {/* Verification Protocol Modal */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  {lang === 'ru' ? 'Протокол верификации статуса' : 'Мақомни тасдиқлаш баённомаси'}
                </h3>
              </div>
              <button 
                onClick={() => setVerifyingId(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const target = youthList.find(y => y.id === verifyingId);
              if (!target) return null;

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="text-base font-bold text-white">{target.full_name_demo}</div>
                    <div className="text-xs text-slate-300 flex items-center gap-3">
                      <span>📍 Махалля: <strong className="text-white">{target.makhalla}</strong></span>
                      <span>•</span>
                      <span>Возраст: <strong className="text-white">{target.age} лет</strong></span>
                    </div>
                    <div className="text-xs text-slate-300 pt-1">
                      Образование: <strong className="text-cyan-400">{target.education} ({target.specialty})</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === 'ru' ? 'Заключение лидера молодёжи по итогам выездного визита:' : 'Маҳалла етакчиси хулосаси:'}
                    </label>
                    <textarea
                      value={verificationComment}
                      onChange={(e) => setVerificationComment(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder={lang === 'ru' ? 'Укажите причину подтверждения (нуждается в работе/курсах) или факт неофициальной занятости...' : 'Хулоса ёзинг...'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleConfirmAction(true)}
                      className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{lang === 'ru' ? 'Подтвердить NEET' : 'NEET деб тасдиқлаш'}</span>
                    </button>

                    <button
                      onClick={() => handleConfirmAction(false)}
                      className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{lang === 'ru' ? 'Отклонить (Занят)' : 'Рад этиш (Банд)'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Human-Centric Clean Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {neetCandidates.map(youth => {
          const isPending = youth.neet_verification === 'pending_verification';
          const isVerified = youth.neet_verification === 'verified';
          const firstProg = SUPPORT_PROGRAMS.find(p => p.id === youth.support_recommendation[0]);

          return (
            <div
              key={youth.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-xl ${
                isPending
                  ? 'border-rose-500/30 bg-slate-900/90 hover:border-rose-400/70'
                  : isVerified
                  ? 'border-emerald-500/30 bg-slate-900/90 hover:border-emerald-400/70'
                  : 'border-slate-700/60 bg-slate-900/80'
              }`}
            >
              <div className="space-y-3.5">
                
                {/* Person Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-400 flex-shrink-0">
                      {youth.age}
                    </div>
                    <div>
                      <h3 
                        onClick={() => onOpenProfile(youth)}
                        className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors leading-tight"
                      >
                        {youth.full_name_demo}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{youth.makhalla}</span>
                        <span>•</span>
                        <span>{youth.gender}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge with whitespace-nowrap */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border flex-shrink-0 ${
                    isPending
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isVerified
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isPending 
                      ? (lang === 'ru' ? '⚠️ На проверке' : '⚠️ Текширувда')
                      : isVerified
                      ? (lang === 'ru' ? '✓ NEET подтверждён' : '✓ Тасдиқланган')
                      : (lang === 'ru' ? 'Отклонён' : 'Рад этилган')}
                  </span>
                </div>

                {/* Education & Situation Summary */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <GraduationCap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="font-medium text-white">{youth.education}</span>
                    {youth.specialty && youth.specialty !== '—' && (
                      <span className="text-slate-400 truncate">({youth.specialty})</span>
                    )}
                  </div>

                  {/* Clean Human Note */}
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                    {youth.notes || 'Отсутствуют налоговые отчисления более 6 месяцев.'}
                  </p>
                </div>

                {/* Single Clear Recommendation Pill */}
                {firstProg && (
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">
                        {firstProg.title.split('—')[0]}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenProfile(youth)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all border border-slate-700/60"
                >
                  {lang === 'ru' ? 'Карточка' : 'Профиль'}
                </button>

                {isPending ? (
                  <button
                    onClick={() => handleStartVerify(youth)}
                    className="flex-1 py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/30 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{lang === 'ru' ? 'Верифицировать' : 'Текшириш'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRouteProgram(youth)}
                    className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'ru' ? 'Направить в программу' : 'Дастурга йўналтириш'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {neetCandidates.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 border border-slate-700/60">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-white mb-1">
            {lang === 'ru' ? 'Все профили в выбранной категории верифицированы' : 'Барча профиллар текширилган'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {lang === 'ru' 
              ? 'Нет ожидающих проверки записей в данной выборке.' 
              : 'Текширув кутаётган ёшлар қолмади.'}
          </p>
        </div>
      )}

    </div>
  );
};
