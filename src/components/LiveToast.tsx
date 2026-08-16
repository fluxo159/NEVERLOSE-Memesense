import React, { useEffect, useState } from 'react';
import { Radio, CheckCircle, UserPlus, GraduationCap, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: string;
  timestamp: string;
  mahalla: string;
  author: string;
  messageRu: string;
  messageUz: string;
}

interface Props {
  toast: ToastMessage | null;
  lang: 'ru' | 'uz';
  onClose: () => void;
}

export const LiveToast: React.FC<Props> = ({ toast, lang, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'NEW_YOUTH':
        return <UserPlus className="w-5 h-5 text-emerald-400" />;
      case 'PROGRAM_ASSIGNED':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'TRIAGE_VERIFIED':
        return <CheckCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />;
    }
  };

  const message = lang === 'uz' ? toast.messageUz : toast.messageRu;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div className="bg-slate-900/95 border border-cyan-500/40 backdrop-blur-xl rounded-xl p-4 shadow-2xl shadow-cyan-500/10 flex items-start space-x-3 text-slate-100 ring-1 ring-white/10">
        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                {lang === 'uz' ? 'Жонли синхронизация (Telegram)' : 'Live Sync (Telegram)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-100 mt-1 leading-snug">
            {message}
          </p>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-800/80">
            <span className="truncate">
              📍 <strong className="text-slate-300">{toast.mahalla}</strong>
            </span>
            <span className="text-slate-500 shrink-0 text-[11px]">
              {toast.author}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
