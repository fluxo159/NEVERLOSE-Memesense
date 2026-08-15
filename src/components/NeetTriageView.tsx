import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle, XCircle, Search, UserCheck, 
  MapPin, GraduationCap, Sparkles, Check, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { SUPPORT_PROGRAMS } from '../data/supportPrograms';

interface NeetTriageViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onVerifyNeet: (youthId: string, isConfirmed: boolean, comment: string) => void;
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
    }, 1100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/80 flex items-start gap-3.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>{toastMessage.title}</span>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-slate-400 hover:text-white text-xs ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Молодёжь, требующая проверки' : 'Текширув кутаётган ёшлар'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold whitespace-nowrap">
                {lang === 'ru' ? 'Личный подворовой обход' : 'Маҳалла кўриги'}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {lang === 'ru'
                ? 'Список молодых людей, у которых более 6 месяцев нет налоговых отчислений или записей об учёбе. Проведите личный опрос, чтобы подтвердить статус или помочь с работой.'
                : 'Солиқ ёки таълим базасида 6 ойдан ортиқ маълумоти бўлмаган ёшлар рўйхати.'}
            </p>
          </div>

          {/* Calm Quick Status Summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700/80 text-center min-w-[130px]">
              <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Ожидают обхода' : 'Кутмоқда'}</div>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{pendingCount} чел.</div>
            </div>
            <div className="flex-1 sm:flex-initial bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700/80 text-center min-w-[130px]">
              <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Опрошены' : 'Текширилган'}</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{verifiedCount} чел.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Поиск по ФИО, специальности, махалле...' : 'Ф.И.Ш. ёки маҳалла бўйича излаш...'}
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
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Нужен визит' : 'Текширувда'}</span>
            <span className="px-2 py-0.2 bg-black/25 rounded-full text-[10px] font-bold">{pendingCount}</span>
          </button>

          <button
            onClick={() => setFilterVerification('verified')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterVerification === 'verified'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Опрошены (нужна помощь)' : 'Тасдиқланган'}</span>
            <span className="px-2 py-0.2 bg-black/25 rounded-full text-[10px] font-bold">{verifiedCount}</span>
          </button>

          <button
            onClick={() => setFilterVerification('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterVerification === 'all'
                ? 'bg-gov-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {lang === 'ru' ? 'Все' : 'Барчаси'}
          </button>
        </div>

        {/* Makhalla Quick Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterMakhalla}
            onChange={(e) => setFilterMakhalla(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">{lang === 'ru' ? 'Все махалли района' : 'Барча маҳаллалар'}</option>
            {MAKHALLAS_LIST.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Verification Modal Dialog */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 overflow-hidden">
            
            {/* Success Animation */}
            {isSuccessAnimating ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-90 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    {successInfo?.isConfirmed ? 'Статус подтверждён: Нуждается в помощи' : 'Статус обновлён: Работает'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Данные по гражданину «<strong className="text-white">{successInfo?.name}</strong>» зафиксированы инспектором махалли.
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ width: '100%' }} />
                </div>
              </div>
            ) : (
              /* Dialog Content */
              <>
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {lang === 'ru' ? 'Результат подворового опроса' : 'Суҳбат натижаси'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {lang === 'ru' ? 'Фиксация реального статуса занятости' : 'Бандлик ҳолатини қайд этиш'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVerifyingId(null)}
                    className="text-slate-400 hover:text-white text-lg font-bold p-1"
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
                          {lang === 'ru' ? 'Заметка инспектора по итогам беседы:' : 'Инспектор хулосаси:'}
                        </label>
                        <textarea
                          value={verificationComment}
                          onChange={(e) => setVerificationComment(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder={lang === 'ru' ? 'Например: не работает, желает пройти курсы в Моноцентре или получить субсидию...' : 'Хулоса ёзинг...'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => handleConfirmAction(true)}
                          className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{lang === 'ru' ? 'Нуждается в помощи' : 'Ёрдамга муҳтож'}</span>
                        </button>

                        <button
                          onClick={() => handleConfirmAction(false)}
                          className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
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

      {/* Human-Centric Clean Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {neetCandidates.map(youth => {
          const isPending = youth.neet_verification === 'pending_verification';
          const firstProg = SUPPORT_PROGRAMS.find(p => p.id === youth.support_recommendation[0]);

          return (
            <div
              key={youth.id}
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-lg hover:translate-y-[-2px] ${
                isPending 
                  ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900/90 hover:border-rose-400' 
                  : 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-900/90 hover:border-emerald-400'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header: Name + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight hover:text-cyan-300 transition-colors">
                      {youth.full_name_demo}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        {youth.makhalla}
                      </span>
                      <span>•</span>
                      <span>{youth.age} лет</span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 ${
                      isPending
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isPending ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    <span>{isPending ? (lang === 'ru' ? 'Ожидает визита' : 'Текширувда') : (lang === 'ru' ? 'Опрошен' : 'Тасдиқланган')}</span>
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

                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                    {youth.notes || 'Отсутствуют налоговые отчисления более 6 месяцев.'}
                  </p>
                </div>

                {/* Recommended Support Measure */}
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
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all border border-slate-700/60"
                >
                  {lang === 'ru' ? 'Анкета' : 'Анкета'}
                </button>

                {isPending ? (
                  <button
                    onClick={() => handleStartVerify(youth)}
                    className="flex-1 py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/30 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{lang === 'ru' ? 'Провести опрос' : 'Суҳбат ўтказиш'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRouteProgram(youth)}
                    className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'ru' ? 'Направить на обучение' : 'Ўқишга йўналтириш'}</span>
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
