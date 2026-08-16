import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertCircle, CheckCircle, XCircle, Search, UserCheck, 
  MapPin, GraduationCap, Sparkles, Check, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { YouthProfile, UserRole, SupportProgram } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { CustomSelect } from './ui/CustomSelect';
import { t, getMahallaName, getEducationName } from '../data/translations';

interface NeetTriageViewProps {
  youthList: YouthProfile[];
  supportPrograms: SupportProgram[];
  selectedMakhalla: string;
  onSelectMakhalla?: (makhalla: string) => void;
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
  onSelectMakhalla,
  lang,
  onVerifyNeet,
  onOpenProfile,
  onRouteProgram
}) => {
  const tr = t[lang];
  const [filterVerification, setFilterVerification] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for inline verification dialog
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationComment, setVerificationComment] = useState<string>('');
  const [isSuccessAnimating, setIsSuccessAnimating] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; isConfirmed: boolean } | null>(null);

  // Success Toast Banner State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const scopedYouthList = selectedMakhalla === 'all'
    ? youthList
    : youthList.filter(y => y.makhalla === selectedMakhalla);

  const neetCandidates = scopedYouthList.filter(youth => {
    if (!youth.is_neet && youth.neet_verification !== 'verified') return false;

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

  const pendingCount = scopedYouthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const verifiedCount = scopedYouthList.filter(y => y.is_neet && y.neet_verification === 'verified').length;

  const handleStartVerify = (youth: YouthProfile) => {
    setVerifyingId(youth.id);
    setIsSuccessAnimating(false);
    setVerificationComment(youth.notes || (lang === 'ru' ? 'По результатам личного подворового обхода инспектором махалли.' : 'Mahalla yetakchisining xonadonbay o‘rganishi asosida.'));
  };

  const handleConfirmAction = (isNeetConfirmed: boolean) => {
    if (!verifyingId) return;

    const targetYouth = youthList.find(y => y.id === verifyingId);
    const youthName = targetYouth?.full_name_demo || (lang === 'ru' ? 'Гражданин' : 'Fuqaro');

    setIsSuccessAnimating(true);
    setSuccessInfo({ name: youthName, isConfirmed: isNeetConfirmed });

    setTimeout(() => {
      onVerifyNeet(verifyingId, isNeetConfirmed, verificationComment);
      setIsSuccessAnimating(false);
      setVerifyingId(null);
      setVerificationComment('');

      setToastMessage({
        title: isNeetConfirmed 
          ? (lang === 'ru' ? '✓ Статус подтверждён: Нуждается в помощи' : '✓ Holat tasdiqlandi: Yordamga muhtoj') 
          : (lang === 'ru' ? '✓ Статус обновлён: Работает' : '✓ Holat yangilandi: Band'),
        desc: lang === 'ru' 
          ? `Данные гражданина «${youthName}» зафиксированы и перенесены в соответствующий список.`
          : `«${youthName}» bo‘yicha ma’lumotlar saqlandi va tegishli ro‘yxatga o‘tkazildi.`
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
                  <span>{tr.triageZeroBtnCheck}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Control & Filter Toolbar */}
      <div className="bg-surface-1 p-4 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface-2 text-slate-300 border border-white/[0.08]">
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{tr.triageTitle}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium bg-surface-2 text-slate-300 border border-white/[0.08] rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
                  <span>{pendingCount} {tr.triagePendingBadge}</span>
                </span>
              </h2>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md bg-surface-2 border border-white/[0.08] rounded-xl focus-within:border-indigo-500/60 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr.triageSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/[0.06] text-xs">
          
          {/* Verification Status Tabs */}
          <div className="flex items-center p-1 bg-surface-2 border border-white/[0.08] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterVerification('pending')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                filterVerification === 'pending' 
                  ? 'bg-indigo-600/90 text-white shadow-sm border border-indigo-500/30 font-semibold' 
                  : 'text-slate-400 hover:text-slate-300 border border-transparent font-medium'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${filterVerification === 'pending' ? 'text-white' : 'text-slate-400'}`} />
              <span>{tr.triageTabPending}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${filterVerification === 'pending' ? 'bg-white/20 text-white' : 'bg-surface-3 text-slate-400'}`}>
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setFilterVerification('verified')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                filterVerification === 'verified' 
                  ? 'bg-indigo-600/90 text-white shadow-sm border border-indigo-500/30 font-semibold' 
                  : 'text-slate-400 hover:text-slate-300 border border-transparent font-medium'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${filterVerification === 'verified' ? 'text-white' : 'text-slate-400'}`} />
              <span>{tr.triageTabVerified}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${filterVerification === 'verified' ? 'bg-white/20 text-white' : 'bg-surface-3 text-slate-400'}`}>
                {verifiedCount}
              </span>
            </button>
            <button
              onClick={() => setFilterVerification('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors border ${
                filterVerification === 'all' 
                  ? 'bg-surface-3 text-white border-white/[0.12] font-semibold' 
                  : 'text-slate-400 hover:text-slate-300 border-transparent font-medium'
              }`}
            >
              {tr.triageTabAll}
            </button>
          </div>

          {/* Makhalla Quick Filter */}
          <CustomSelect
            value={selectedMakhalla}
            onChange={(val) => onSelectMakhalla && onSelectMakhalla(val)}
            options={[
              { value: 'all', label: tr.allMakhallas, icon: <MapPin className="w-3.5 h-3.5 text-slate-400" /> },
              ...MAKHALLAS_LIST.map(m => ({ value: m.name, label: getMahallaName(m.name, lang), icon: <MapPin className="w-3.5 h-3.5 text-slate-400" /> }))
            ]}
          />

          <div className="text-[11px] text-slate-400 ml-auto font-medium">
            {tr.triageDisplayed} <strong className="text-white font-bold">{neetCandidates.length}</strong> {tr.triageProfilesCount}
          </div>

        </div>
      </div>

      {/* Verification Modal portaled to document.body */}
      {verifyingId && createPortal(
        <div 
          onClick={() => setVerifyingId(null)}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-1 w-full max-w-lg rounded-2xl border border-white/[0.14] shadow-surface-modal p-6 overflow-hidden cursor-default my-auto"
          >
            
            {/* SUCCESS ANIMATION SCREEN */}
            {isSuccessAnimating ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {successInfo?.isConfirmed 
                      ? (lang === 'ru' ? 'Статус подтверждён: Нуждается в помощи' : 'Holat tasdiqlandi: Yordamga muhtoj')
                      : (lang === 'ru' ? 'Статус обновлён: Работает' : 'Holat yangilandi: Band')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    {lang === 'ru'
                      ? <>Данные по гражданину «<strong className="text-white">{successInfo?.name}</strong>» зафиксированы инспектором махалли.</>
                      : <>«<strong className="text-white">{successInfo?.name}</strong>» bo‘yicha ma’lumotlar yetakchi tomonidan qayd etildi.</>}
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
                        {lang === 'ru' ? 'Результат подворового опроса' : 'Xonadonbay suhbat natijasi'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'ru' ? 'Фиксация реального статуса занятости' : 'Bandlik holatini qayd etish'}
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
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{getMahallaName(target.makhalla, lang)}</span>
                          </span>
                          <span>•</span>
                          <span>{lang === 'ru' ? 'Возраст:' : 'Yoshi:'} <strong className="text-white">{target.age} {lang === 'ru' ? 'лет' : 'yosh'}</strong></span>
                        </div>
                        <div className="text-xs text-slate-300 pt-0.5">
                          {tr.newYouthEducation}: <strong className="text-slate-200">{getEducationName(target.education, lang)} ({target.specialty})</strong>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                          {tr.verifInspectorComment}
                        </label>
                        <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 rounded-xl p-3">
                          <textarea
                            value={verificationComment}
                            onChange={(e) => setVerificationComment(e.target.value)}
                            rows={3}
                            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                            placeholder={tr.verifCommentPlaceholder}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button
                          onClick={() => handleConfirmAction(true)}
                          className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-brand transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'ru' ? 'Нуждается в помощи' : 'Yordamga muhtoj'}</span>
                        </button>

                        <button
                          onClick={() => handleConfirmAction(false)}
                          className="py-2.5 px-3.5 bg-surface-3 hover:bg-surface-card text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'ru' ? 'Работает / Занят' : 'Band (ishlaydi)'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* Candidates Grid */}
      <div key={filterVerification + selectedMakhalla} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {neetCandidates.map((youth, idx) => {
          const isPending = youth.neet_verification === 'pending_verification';
          const firstProg = supportPrograms.find(p => p.id === youth.support_recommendation[0]);
          const progTitle = firstProg 
            ? ((lang === 'uz' && firstProg.titleUz) ? firstProg.titleUz : firstProg.title) 
            : '';

          return (
            <div
              key={youth.id}
              style={{ animationDelay: `${idx * 45}ms` }}
              className="animate-card-cascade bg-surface-1 p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between shadow-surface-card"
            >
              <div className="space-y-2.5">
                
                {/* Header: Name + Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">
                      {youth.full_name_demo}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        {getMahallaName(youth.makhalla, lang)}
                      </span>
                      <span>•</span>
                      <span>{youth.age} {lang === 'ru' ? 'лет' : 'yosh'}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 text-slate-300 border border-white/[0.08] text-[11px] font-medium whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-400/80' : 'bg-emerald-400/80'}`}></span>
                    <span>{isPending ? tr.triageCardNeetBadge : tr.triageCardVerifiedBadge}</span>
                  </span>
                </div>

                {/* Education & Situation Summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-white">{getEducationName(youth.education, lang)}</span>
                    {youth.specialty && youth.specialty !== '—' && (
                      <span className="text-slate-400 truncate">({youth.specialty})</span>
                    )}
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 bg-surface-2/80 p-2 rounded-lg border border-white/[0.06]">
                    {youth.notes || (lang === 'ru' ? 'Отсутствуют налоговые отчисления более 6 месяцев.' : '6 oydan ortiq rasmiy daromad va soliq to‘lovlari mavjud emas.')}
                  </p>
                </div>

                {/* Recommended Program */}
                {firstProg && (
                  <div className="pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400/80 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">
                        {progTitle.split('—')[0]}
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
                  {tr.triageCardBtnProfile}
                </button>

                {isPending ? (
                  <button
                    onClick={() => handleStartVerify(youth)}
                    className="flex-1 h-8 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{tr.triageCardBtnSurvey}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRouteProgram(youth)}
                    className="flex-1 h-8 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{tr.triageCardBtnRoute}</span>
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
            {tr.triageZeroTitle}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {tr.triageZeroDesc}
          </p>
        </div>
      )}

    </div>
  );
};
