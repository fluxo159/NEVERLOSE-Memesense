import React from 'react';
import { X, Download, FileSpreadsheet, FileCode, CheckCircle2, Shield } from 'lucide-react';
import { YouthProfile } from '../types';

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
  const exportToCSV = () => {
    // UTF-8 BOM for proper Cyrillic in Excel
    const BOM = "\uFEFF";
    const headers = [
      "ID",
      "ФИО (Демо)",
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
      y.is_neet ? '"ДА"' : '"НЕТ"',
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {lang === 'ru' ? 'Выгрузка реестра молодёжи' : 'Реестр маълумотларини юклаб олиш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <p className="text-xs text-slate-300">
          {lang === 'ru' 
            ? 'Экспорт текущей выборки данных с сохранением фильтров и истории маршрутизации.'
            : 'Жорий маълумотларни Excel (CSV) ёки JSON форматда юклаб олиш.'}
        </p>

        <div className="space-y-3 pt-2">
          
          <button
            onClick={exportToCSV}
            className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Таблица Microsoft Excel (.CSV)</div>
                <div className="text-[11px] text-slate-400">Формат с разделителями (UTF-8 BOM для кириллицы)</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={exportToJSON}
            className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Структурированный JSON (.JSON)</div>
                <div className="text-[11px] text-slate-400">Для межведомственного обмена по API</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Все экспортируемые записи являются синтетическими демо-данными хакатона.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
        >
          Закрыть
        </button>

      </div>
    </div>
  );
};
