import React, { useState } from 'react';
import { 
  AlertOctagon, CheckCircle, XCircle, Search, Filter, ArrowRight, 
  MapPin, ShieldAlert, Sparkles, UserCheck, Phone, FileEdit, Clock
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
    // Has NEET flag
    if (!youth.is_neet && youth.neet_verification !== 'verified') return false;

    // Filter by Makhalla
    if (filterMakhalla !== 'all' && youth.makhalla !== filterMakhalla) return false;

    // Filter by verification status
    if (filterVerification === 'pending' && youth.neet_verification !== 'pending_verification') return false;
    if (filterVerification === 'verified' && youth.neet_verification !== 'verified') return false;
    if (filterVerification === 'rejected' && youth.neet_verification !== 'rejected') return false;

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        youth.full_name_demo.toLowerCase().includes(q) ||
        youth.makhalla.toLowerCase().includes(q) ||
        youth.education.toLowerCase().includes(q)
      );
    }

    return true;
  });

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
    <div className="space-y-6">
      
      {/* Alert / Explanatory Header */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-900/80 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {lang === 'ru' 
                    ? 'Модуль триажа и верификации NEET-молодёжи' 
                    : 'NEET ёшларни текширув ва верификация модули'}
                </h2>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {lang === 'ru'
                  ? 'Алгоритм системы автоматически фиксирует отсутствие официальной работы, учёбы или статуса ИП (по данным межведомственной интеграции). Статус «NEET» присваивается ТОЛЬКО после личной верификации уполномоченным сотрудником («Ёшлар етакчиси»).'
                  : 'Тизим алгоритми расмий иш, ўқиш ёки якка тартибдаги тадбиркорлик мавжуд эмаслигини аниқлайди. Якуний «NEET» мақоми фақат маҳалла етакчиси томонидан тасдиқланади.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 text-center">
              <div className="text-xs text-slate-400">{lang === 'ru' ? 'На проверке' : 'Текширувда'}</div>
              <div className="text-xl font-bold text-rose-400">
                {youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length}
              </div>
            </div>
            <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 text-center">
              <div className="text-xs text-slate-400">{lang === 'ru' ? 'Верифицировано' : 'Тасдиқланган'}</div>
              <div className="text-xl font-bold text-emerald-400">
                {youthList.filter(y => y.is_neet && y.neet_verification === 'verified').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Поиск по ФИО или махалле...' : 'Ф.И.Ш. ёки маҳалла бўйича излаш...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          
          <button
            onClick={() => setFilterVerification('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterVerification === 'pending'
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-900/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            ⏳ {lang === 'ru' ? 'Требуют проверки' : 'Текширув кутмоқда'}
          </button>

          <button
            onClick={() => setFilterVerification('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterVerification === 'verified'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            ✅ {lang === 'ru' ? 'Подтверждённые NEET' : 'Тасдиқланганлар'}
          </button>

          <button
            onClick={() => setFilterVerification('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterVerification === 'all'
                ? 'bg-gov-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            {lang === 'ru' ? 'Все' : 'Барчаси'}
          </button>
        </div>

      </div>

      {/* Verification Modal / Drawer when inspecting a candidate */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                    <div className="text-sm font-bold text-white">{target.full_name_demo}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>📍 Махалля: <strong className="text-slate-200">{target.makhalla}</strong></span>
                      <span>Возраст: <strong className="text-slate-200">{target.age} лет</strong></span>
                    </div>
                    <div className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded border border-slate-700/50">
                      <strong>Автоматический триггер:</strong> {target.notes || 'Отсутствие записей в базах Soliq.uz и Mehnat.uz более 6 месяцев.'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === 'ru' ? 'Заключение лидера молодёжи / инспектора:' : 'Маҳалла етакчиси хулосаси:'}
                    </label>
                    <textarea
                      value={verificationComment}
                      onChange={(e) => setVerificationComment(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder={lang === 'ru' ? 'Укажите причину подтверждения или факт наличия неофициальной занятости / обучения...' : 'Хулоса ёзинг...'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleConfirmAction(true)}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/40 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{lang === 'ru' ? 'Подтвердить NEET (Нуждается в помощи)' : 'NEET деб тасдиқлаш'}</span>
                    </button>

                    <button
                      onClick={() => handleConfirmAction(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{lang === 'ru' ? 'Отклонить (Занят/Учится)' : 'Рад этиш (Банд)'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Candidates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {neetCandidates.map(youth => {
          const isPending = youth.neet_verification === 'pending_verification';
          const isVerified = youth.neet_verification === 'verified';

          return (
            <div
              key={youth.id}
              className={`glass-panel rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                isPending
                  ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900/90 hover:border-rose-400'
                  : isVerified
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-900/90 hover:border-emerald-400'
                  : 'border-slate-700/60 bg-slate-900/70'
              }`}
            >
              <div>
                
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {youth.age}
                      </span>
                      <h3 
                        onClick={() => onOpenProfile(youth)}
                        className="text-sm font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors"
                      >
                        {youth.full_name_demo}
                      </h3>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{youth.makhalla}</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    isPending
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
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

                {/* Details */}
                <div className="bg-slate-800/60 rounded-xl p-2.5 text-xs text-slate-300 space-y-1.5 mb-3 border border-slate-700/50">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Образование:</span>
                    <span className="font-medium text-white">{youth.education}</span>
                  </div>
                  {youth.specialty && youth.specialty !== '—' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Специальность:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[170px]">{youth.specialty}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                    <span className="text-rose-400 font-medium">Маркер:</span> {youth.notes || 'Нет сведений о занятости.'}
                  </div>
                </div>

                {/* Recommended Support Badges */}
                <div className="mb-3">
                  <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{lang === 'ru' ? 'Рекомендованная траектория:' : 'Тавсия этилган дастур:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {youth.support_recommendation.map(progId => {
                      const prog = SUPPORT_PROGRAMS.find(p => p.id === progId);
                      return (
                        <span 
                          key={progId} 
                          className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 truncate max-w-full"
                        >
                          {prog ? prog.title.split('—')[0] : 'Госпрограмма'}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenProfile(youth)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  {lang === 'ru' ? 'Карточка' : 'Профиль'}
                </button>

                <div className="flex items-center gap-1.5">
                  {isPending ? (
                    <button
                      onClick={() => handleStartVerify(youth)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shadow-rose-900/30 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Верифицировать' : 'Текшириш'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onRouteProgram(youth)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-900/30 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Маршрутизировать' : 'Йўналтириш'}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {neetCandidates.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-slate-700/60">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white mb-1">
            {lang === 'ru' ? 'Все профили в выбранной категории верифицированы' : 'Барча профиллар текширилган'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {lang === 'ru' 
              ? 'Нет ожидающих проверки записей. Выберите другой фильтр или махаллю для продолжения работы.' 
              : 'Текширув кутаётган ёшлар қолмади.'}
          </p>
        </div>
      )}

    </div>
  );
};
