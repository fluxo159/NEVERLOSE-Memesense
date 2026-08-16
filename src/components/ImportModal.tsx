import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { YouthProfile, EmploymentStatus, Gender, EducationLevel } from '../types';
import { t } from '../data/translations';

interface ImportModalProps {
  onClose: () => void;
  onImportProfiles: (profiles: YouthProfile[]) => void;
  lang: 'ru' | 'uz';
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onImportProfiles,
  lang
}) => {
  const tr = t[lang];
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileContent(text);

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length > 1) {
          setPreviewCount(lines.length - 1);
        } else {
          setPreviewCount(0);
        }
      } catch (err) {
        setError(lang === 'ru' ? 'Ошибка при чтении файла' : 'Faylni o‘qishda xatolik');
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!fileContent) return;

    try {
      const lines = fileContent.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        setError(lang === 'ru' ? 'Файл пуст или содержит только заголовки' : 'Fayl bo‘sh yoki faqat sarlavhalardan iborat');
        return;
      }

      const separator = lines[0].includes(';') ? ';' : ',';
      const parsedProfiles: YouthProfile[] = [];
      const today = new Date().toISOString().split('T')[0];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(separator).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3) {
          const rawName = cols[1] || cols[0] || (lang === 'ru' ? `Импортированный Профиль ${i}` : `Import qilingan profil ${i}`);
          const cleanName = rawName.replace(/\s*\(Демо\)$/i, '');
          const makhalla = cols[2] || 'Олий Ҳиммат';
          const age = parseInt(cols[3], 10) || 22;
          const gender: Gender = (cols[4] && (cols[4].includes('Жен') || cols[4].includes('Ayol'))) ? 'Женский' : 'Мужской';
          const status: EmploymentStatus = (cols[5] as EmploymentStatus) || 'безработный';
          const activity = cols[6] || (lang === 'ru' ? 'нет деятельности' : 'faoliyatsiz');
          const education: EducationLevel = (cols[7] as EducationLevel) || 'Средне-специальное';
          const specialty = cols[8] || '—';
          const isNeet = Boolean(status === 'безработный' || status === 'не уточнено' || (cols[9] && (cols[9].toUpperCase() === 'ДА' || cols[9].toUpperCase() === 'HA')));
          const neetVerification = cols[10] === 'verified' ? 'verified' : cols[10] === 'rejected' ? 'rejected' : 'pending_verification';

          parsedProfiles.push({
            id: `y_imp_${Date.now().toString().slice(-4)}_${i}`,
            full_name_demo: `${cleanName}`,
            makhalla,
            age,
            gender,
            phone_demo: `+998 (90) ${100 + (i % 800)}-${String(i).padStart(2, '0')}-00`,
            employment_status: status,
            activity_type: activity,
            education,
            specialty,
            skills: [lang === 'ru' ? 'Импортированные навыки' : 'Import qilingan ko‘nikmalar'],
            is_neet: isNeet,
            neet_verification: isNeet ? neetVerification : 'rejected',
            needs_support: isNeet,
            support_recommendation: ['prog_ishga_marhamat_tech', 'prog_district_job_fair'],
            last_updated: cols[12] || today,
            notes: lang === 'ru' ? 'Импортировано из внешней таблицы' : 'Tashqi jadvaldan import qilindi',
            status_history: [
              {
                date: cols[12] || today,
                status,
                comment: lang === 'ru' ? 'Импорт из реестра' : 'Reyestrdan import'
              }
            ]
          });
        }
      }

      if (parsedProfiles.length > 0) {
        onImportProfiles(parsedProfiles);
        onClose();
      } else {
        setError(lang === 'ru' ? 'Не удалось распознать строки таблицы' : 'Jadval qatorlarini aniqlab bo‘lmadi');
      }
    } catch (e: any) {
      setError(e.message || (lang === 'ru' ? 'Ошибка обработки данных' : 'Ma’lumotlarni qayta ishlashda xatolik'));
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-md rounded-2xl border border-white/[0.12] shadow-2xl p-5 space-y-4 cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {tr.importModalTitle}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {tr.importModalSubtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Dropzone */}
        <label className="group block p-6 rounded-2xl border border-dashed border-white/[0.16] hover:border-indigo-500/60 bg-surface-2/60 hover:bg-surface-2 text-center cursor-pointer transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2 text-indigo-400 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white block">
            {fileName ? fileName : tr.importDropzoneText}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tr.importDropzoneHint}
          </span>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {previewCount > 0 && (
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr.importCountRecognized}</span>
            </span>
            <strong className="text-white font-bold bg-indigo-500/20 px-2 py-0.5 rounded-md">
              {previewCount} {lang === 'ru' ? 'записей' : 'ta yozuv'}
            </strong>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
          <button
            disabled={previewCount === 0}
            onClick={handleProcessImport}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-indigo-400/30 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>{tr.importBtnSubmit}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl font-medium text-xs transition-all flex items-center justify-center"
          >
            {tr.importBtnCancel}
          </button>
        </div>

      </div>
    </div>
  );
};
