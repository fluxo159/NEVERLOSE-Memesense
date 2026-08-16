import React from 'react';
import { Download, FileSpreadsheet, FileCode, Shield } from 'lucide-react';
import { YouthProfile } from '../types';
import { t } from '../data/translations';

interface ExportModalProps {
  youthList: YouthProfile[];
  onClose: () => void;
  lang: 'ru' | 'uz';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  youthList,
  onClose,
  lang
}) => {
  const tr = t[lang];

  const exportToCSV = () => {
    const BOM = "\uFEFF";
    const headers = lang === 'ru' ? [
      "ID",
      "ФИО",
      "Махалля",
      "Возраст",
      "Пол",
      "Статус занятости",
      "Сфера деятельности",
      "Образование",
      "Специальность",
      "NEET признак",
      "Верификация NEET",
      "Направлен на программу",
      "Дата обновления"
    ] : [
      "ID",
      "F.I.Sh.",
      "Mahalla",
      "Yoshi",
      "Jinsi",
      "Bandlik holati",
      "Faoliyat sohasi",
      "Ma’lumoti",
      "Mutaxassisligi",
      "NEET belgisi",
      "NEET verifikatsiyasi",
      "Biriktirilgan dastur",
      "Yangilangan sana"
    ];

    const rows = youthList.map(y => [
      `"${y.id}"`,
      `"${y.full_name_demo}"`,
      `"${y.makhalla}"`,
      y.age,
      `"${y.gender}"`,
      `"${y.employment_status}"`,
      `"${y.activity_type}"`,
      `"${y.education}"`,
      `"${y.specialty || '-'}"`,
      y.is_neet ? (lang === 'ru' ? '"ДА"' : '"HA"') : (lang === 'ru' ? '"НЕТ"' : '"YO‘Q"'),
      `"${y.neet_verification}"`,
      `"${y.assigned_program ? y.assigned_program.title : '-'}"`,
      `"${y.last_updated}"`
    ]);

    const csvContent = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Yoshlar_Bandligi_MirzoUlugbek_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(youthList, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Yoshlar_Dataset_Demo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-md rounded-2xl border border-white/[0.14] shadow-surface-modal p-5 space-y-3.5 cursor-default"
      >
        
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {tr.exportModalTitle}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-surface-3 transition-colors">✕</button>
        </div>

        <p className="text-xs text-slate-400">
          {tr.exportModalSubtitle}
        </p>

        <div className="space-y-2.5 pt-1">
          
          <button
            onClick={exportToCSV}
            className="w-full p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-emerald-500/40 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Microsoft Excel (.CSV)</div>
                <div className="text-[10px] text-slate-500">{tr.exportCsvDesc}</div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={exportToJSON}
            className="w-full p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-indigo-500/40 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">JSON (.JSON)</div>
                <div className="text-[10px] text-slate-500">{tr.exportJsonDesc}</div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          </button>

        </div>

        <div className="p-2.5 bg-surface-2/60 rounded-xl border border-white/[0.06] text-[10px] text-slate-500 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>{lang === 'ru' ? 'Все экспортируемые записи являются синтетическими демо-данными хакатона.' : 'Barcha eksport qilinadigan yozuvlar xakaton uchun demo ma’lumotlardir.'}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-surface-3 hover:bg-surface-card text-slate-300 border border-white/[0.08] rounded-xl text-xs font-semibold transition-colors"
        >
          {tr.exportBtnCancel}
        </button>

      </div>
    </div>
  );
};
