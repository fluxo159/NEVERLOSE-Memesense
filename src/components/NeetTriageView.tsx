import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle, XCircle, Search, UserCheck, 
  MapPin, GraduationCap, Sparkles, Check, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { YouthProfile, UserRole, SupportProgram } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';

interface NeetTriageViewProps {
  youthList: YouthProfile[];
  supportPrograms: SupportProgram[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onVerifyNeet: (youthId: string, isConfirmed: boolean, comment: string) => void;
  onOpenProfile: (youth: YouthProfile) => void;
  onRouteProgram: (youth: YouthProfile) => void;
}

export const NeetTriageView: React.FC<NeetTriageViewProps> = ({
  youthList,
  supportPrograms,
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
  const [isSuccessAnimating, setIsSuccessAnimating] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; isConfirmed: boolean } | null>(null);

  // Success Toast Banner State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

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

  const handleStartVerify = (youth: YouthProfile) => {
    setVerifyingId(youth.id);
    setIsSuccessAnimating(false);
    setVerificationComment(youth.notes || 'По результатам личного подворового обхода инспектором махалли.');
  };

  const handleConfirmAction = (isNeetConfirmed: boolean) => {
    if (!verifyingId) return;

    const targetYouth = youthList.find(y => y.id === verifyingId);
    const youthName = targetYouth?.full_name_demo || 'Человек';

    setIsSuccessAnimating(true);
    setSuccessInfo({ name: youthName, isConfirmed: isNeetConfirmed });

    setTimeout(() => {
      onVerifyNeet(verifyingId, isNeetConfirmed, verificationComment);
      setIsSuccessAnimating(false);
      setVerifyingId(null);
      setVerificationComment('');

      setToastMessage({
        title: isNeetConfirmed ? '✓ Статус подтверждён: Нуждается в помощи' : '✓ Статус обновлён: Работает',
        desc: `Данные гражданина «${youthName}» зафиксированы и перенесены в соответствующий список.`
      });

      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-4 rounded-2xl bg-surface-1 border border-emerald-500/50 shadow-surface-modal flex items-start gap-3.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{toastMessage.title}</span>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-slate-400 hover:text-white text-xs ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {toastMessage.desc}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterVerification('verified');
                    setToastMessage(null);
                  }}
                  className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Посмотреть подтверждённых</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human-Centered Header Banner */}
      <div className="bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card bg-gradient-to-r from-surface-1 via-surface-2 to-surface-1">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Молодёжь, требующая проверки' : 'Текширув кутаётган ёшлар'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
              {lang === 'ru'
                ? 'Список молодых людей, у которых более 6 месяцев нет налоговых отчислений или записей об учёбе. Проведите личный опрос, чтобы подтвердить статус или помочь с работой.'
                : 'Солиқ ёки таълим базасида 6 ойдан ортиқ маълумоти бўлмаган ёшлар рўйхати.'}
            </p>
          </div>

          {/* Quick Metric Chips */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-surface-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-center min-w-[120px]">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'ru' ? 'Ожидают обхода' : 'Кутмоқда'}</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">{pendingCount} чел.</div>
            </div>
            <div className="flex-1 sm:flex-initial bg-surface-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-center min-w-[120px]">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'ru' ? 'Опрошены' : 'Текширилган'}</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{verifiedCount} чел.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md bg-surface-2 border border-white/[0.08] rounded-lg focus-within:border-indigo-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Поиск по ФИО, специальности, махалле...' : 'Ф.И.Ш. ёки маҳалла бўйича излаш...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Verification Status Tabs */}
        <div className="flex items-center p-1 bg-surface-2 border border-white/[0.08] rounded-xl text-[11px] font-semibold">
          <button
            onClick={() => setFilterVerification('pending')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterVerification === 'pending' 
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'ru' ? 'Нужен визит' : 'Кўрик'}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterVerification === 'pending' ? 'bg-indigo-500/40 text-indigo-200' : 'bg-surface-3'}`}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilterVerification('verified')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterVerification === 'verified' 
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-300 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'ru' ? 'Опрошены' : 'Тасдиқланган'}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterVerification === 'verified' ? 'bg-indigo-500/40 text-indigo-200' : 'bg-surface-3'}`}>
              {verifiedCount}
            </span>
          </button>
          <button
            onClick={() => setFilterVerification('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors border ${
              filterVerification === 'all' 
                ? 'bg-surface-3 text-white border-white/[0.12]' 
                : 'text-slate-400 hover:text-slate-300 border-transparent'
            }`}
          >
            {lang === 'ru' ? 'Все' : 'Барчаси'}
          </button>
        </div>

        {/* Makhalla Quick Filter */}
        <div className="flex items-center gap-2 bg-surface-2 border border-white/[0.08] rounded-lg px-2.5 py-1">
          <select
            value={filterMakhalla}
            onChange={(e) => setFilterMakhalla(e.target.value)}
            className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full py-1 pr-4"
          >
            <option value="all" className="bg-surface-2">{lang === 'ru' ? 'Все 8 махаллей' : 'Барча маҳаллалар'}</option>
            {MAKHALLAS_LIST.map(m => (
              <option key={m.id} value={m.name} className="bg-surface-2">{m.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Verification Modal with Linear/Raycast Dark Theme */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-1 w-full max-w-lg rounded-2xl border border-white/[0.14] shadow-surface-modal p-6 overflow-hidden">
            
            {/* SUCCESS ANIMATION SCREEN */}
            {isSuccessAnimating ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {successInfo?.isConfirmed ? 'Статус подтверждён: Нуждается в помощи' : 'Статус обновлён: Работает'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Данные по гражданину «<strong className="text-white">{successInfo?.name}</strong>» зафиксированы инспектором махалли.
                  </p>
                </div>
                <div className="w-40 h-1 bg-surface-3 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            ) : (
              /* REGULAR VERIFY FORM */
              <>
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {lang === 'ru' ? 'Результат подворового опроса' : 'Суҳбат натижаси'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'ru' ? 'Фиксация реального статуса занятости' : 'Бандлик ҳолатини қайд этиш'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVerifyingId(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-surface-3 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const target = youthList.find(y => y.id === verifyingId);
                  if (!target) return null;

                  return (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-surface-2 rounded-xl border border-white/[0.08] space-y-1.5">
                        <div className="text-sm font-bold text-white">{target.full_name_demo}</div>
                        <div className="text-xs text-slate-300 flex items-center gap-3">
                          <span>📍 Махалля: <strong className="text-white">{target.makhalla}</strong></span>
                          <span>•</span>
                          <span>Возраст: <strong className="text-white">{target.age} лет</strong></span>
                        </div>
                        <div className="text-xs text-slate-300 pt-0.5">
                          Образование: <strong className="text-indigo-400">{target.education} ({target.specialty})</strong>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                          {lang === 'ru' ? 'Заметка инспектора по итогам беседы:' : 'Инспектор хулосаси:'}
                        </label>
                        <textarea
                          value={verificationComment}
                          onChange={(e) => setVerificationComment(e.target.value)}
                          rows={3}
                          className="w-full bg-surface-2 border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder={lang === 'ru' ? 'Например: не работает, желает пройти курсы в Моноцентре...' : 'Хулоса ёзинг...'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button
                          onClick={() => handleConfirmAction(true)}
                          className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-brand transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'ru' ? 'Нуждается в помощи' : 'Ёрдамга муҳтож'}</span>
                        </button>

                        <button
                          onClick={() => handleConfirmAction(false)}
                          className="py-2.5 px-3.5 bg-surface-3 hover:bg-surface-card text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'ru' ? 'Работает / Занят' : 'Банд (ишлайди)'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {neetCandidates.map(youth => {
          const isPending = youth.neet_verification === 'pending_verification';
          const firstProg = supportPrograms.find(p => p.id === youth.support_recommendation[0]);

          return (
            <div
              key={youth.id}
              className="bg-surface-1 p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between shadow-surface-card"
            >
              <div className="space-y-2.5">
                
                {/* Header: Name + Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">
                      {youth.full_name_demo}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        {youth.makhalla}
                      </span>
                      <span>•</span>
                      <span>{youth.age} лет</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isPending ? <Clock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                    <span>{isPending ? (lang === 'ru' ? 'Ожидает визита' : 'Текширувда') : (lang === 'ru' ? 'Опрошен' : 'Тасдиқланган')}</span>
                  </span>
                </div>

                {/* Education & Situation Summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="font-medium text-white">{youth.education}</span>
                    {youth.specialty && youth.specialty !== '—' && (
                      <span className="text-slate-400 truncate">({youth.specialty})</span>
                    )}
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 bg-surface-2/80 p-2 rounded-lg border border-white/[0.06]">
                    {youth.notes || 'Отсутствуют налоговые отчисления более 6 месяцев.'}
                  </p>
                </div>

                {/* Recommended Program */}
                {firstProg && (
                  <div className="pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">
                        {firstProg.title.split('—')[0]}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenProfile(youth)}
                  className="h-8 px-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/[0.08] flex items-center justify-center"
                >
                  {lang === 'ru' ? 'Анкета' : 'Анкета'}
                </button>

                {isPending ? (
                  <button
                    onClick={() => handleStartVerify(youth)}
                    className="flex-1 h-8 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Провести опрос' : 'Суҳбат ўтказиш'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRouteProgram(youth)}
                    className="flex-1 h-8 px-3.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Направить на обучение' : 'Ўқишга йўналтириш'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {neetCandidates.length === 0 && (
        <div className="bg-surface-1 rounded-2xl p-12 text-center text-slate-400 border border-white/[0.08]">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-90" />
          <h3 className="text-sm font-bold text-white mb-1">
            {lang === 'ru' ? 'Все визиты завершены!' : 'Барча суҳбатлар ўтказилган'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {lang === 'ru' 
              ? 'В выбранной махалле нет неработающей молодёжи, ожидающей проверки.' 
              : 'Ушбу маҳаллада текширув кутаётган ёшлар қолмади.'}
          </p>
        </div>
      )}

    </div>
  );
};
