import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { YouthProfile, SupportProgram } from '../types';
import { t } from '../data/translations';

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
  const tr = t[lang];
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    youth.support_recommendation[0] || supportPrograms[0]?.id || ''
  );
  const [routingNotes, setRoutingNotes] = useState<string>(
    lang === 'ru' 
      ? 'Направление выдано в рамках районной программы содействия занятости молодёжи' 
      : 'Tuman yoshlar bandligiga ko‘maklashish dasturi doirasida yo‘llanma berildi'
  );

  const selectedProg = supportPrograms.find(p => p.id === selectedProgramId) || supportPrograms[0];

  const handleConfirm = () => {
    onConfirmRouting(youth.id, selectedProg, routingNotes);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-xl rounded-2xl border border-white/[0.14] shadow-surface-modal p-5 space-y-3.5 cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-surface-2 text-slate-300 border border-white/[0.08]">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {tr.routingModalTitle}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-surface-3 transition-colors">✕</button>
        </div>

        {/* Candidate Summary */}
        <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08]">
          <div className="text-xs font-bold text-white">{youth.full_name_demo}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {youth.makhalla} • {youth.age} {lang === 'ru' ? 'лет' : 'yosh'} • {youth.education}
          </div>
          {youth.specialty && (
            <div className="text-[11px] text-slate-300 mt-0.5">
              {tr.newYouthSpecialty}: <span className="font-semibold text-indigo-400">{youth.specialty}</span>
            </div>
          )}
        </div>

        {/* Program Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
            {tr.routingModalAvailablePrograms}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {supportPrograms.map(prog => {
              const isSelected = prog.id === selectedProgramId;
              const isRecommended = youth.support_recommendation.includes(prog.id);

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-sm'
                      : 'border-white/[0.06] bg-surface-2/60 hover:bg-surface-2 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{prog.title}</span>
                      {isRecommended && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          AI Match
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{prog.provider}</div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Program Perks */}
        <div className="p-2.5 rounded-xl bg-surface-2 border border-white/[0.06] text-xs space-y-0.5">
          <div className="text-slate-400 text-[11px]">{tr.routingModalStipend} <strong className="text-emerald-400">{selectedProg.stipend}</strong></div>
          <div className="text-slate-400 text-[11px]">{tr.routingModalDuration} <strong className="text-white">{selectedProg.duration}</strong></div>
        </div>

        {/* Action Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wide">
            {lang === 'ru' ? 'Комментарий к направлению:' : 'Yo‘naltirish izohi:'}
          </label>
          <div className="bg-surface-2 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-500/70 rounded-xl p-2">
            <textarea
              value={routingNotes}
              onChange={(e) => setRoutingNotes(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleConfirm}
            className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{tr.routingModalBtnConfirm}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 bg-surface-2 hover:bg-surface-3 text-slate-300 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all"
          >
            {tr.routingModalBtnCancel}
          </button>
        </div>

      </div>
    </div>
  );
};
