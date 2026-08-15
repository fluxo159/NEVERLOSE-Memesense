import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Wrench, Code, Gift, TrendingUp, GraduationCap, Briefcase } from 'lucide-react';
import { YouthProfile, SupportProgram } from '../types';

interface SupportProgramRoutingModalProps {
  youth: YouthProfile;
  supportPrograms: SupportProgram[];
  onClose: () => void;
  onConfirmRouting: (youthId: string, program: SupportProgram, notes: string) => void;
  lang: 'ru' | 'uz';
}

export const SupportProgramRoutingModal: React.FC<SupportProgramRoutingModalProps> = ({
  youth,
  supportPrograms,
  onClose,
  onConfirmRouting,
  lang
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    youth.support_recommendation[0] || supportPrograms[0]?.id || ''
  );
  const [routingNotes, setRoutingNotes] = useState<string>('Направление выдано в рамках районной программы содействия занятости молодёжи');

  const selectedProg = supportPrograms.find(p => p.id === selectedProgramId) || supportPrograms[0];

  const handleConfirm = () => {
    onConfirmRouting(youth.id, selectedProg, routingNotes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base font-bold text-white">
              {lang === 'ru' ? 'Маршрутизация в программу господдержки' : 'Давлат дастурига йўналтириш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Candidate Summary */}
        <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
          <div className="text-sm font-bold text-white">{youth.full_name_demo}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {youth.makhalla} • {youth.age} лет • {youth.education}
          </div>
          {youth.specialty && (
            <div className="text-xs text-slate-300 mt-1">
              Специальность: <span className="font-semibold text-cyan-400">{youth.specialty}</span>
            </div>
          )}
        </div>

        {/* Program Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Выберите траекторию поддержки:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {supportPrograms.map(prog => {
              const isSelected = prog.id === selectedProgramId;
              const isRecommended = youth.support_recommendation.includes(prog.id);

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 shadow'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{prog.title}</span>
                      {isRecommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          AI Match
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{prog.provider}</div>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center">
                    {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Program Perks */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs space-y-1">
          <div className="text-slate-400">Стипендия / Условия: <strong className="text-emerald-400">{selectedProg.stipend}</strong></div>
          <div className="text-slate-400">Длительность: <strong className="text-white">{selectedProg.duration}</strong></div>
        </div>

        {/* Action Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Комментарий к направлению (для лидера махалли):
          </label>
          <textarea
            value={routingNotes}
            onChange={(e) => setRoutingNotes(e.target.value)}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleConfirm}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Направить и обновить статус</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
          >
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
};
