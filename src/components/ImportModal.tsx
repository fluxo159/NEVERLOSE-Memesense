import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { YouthProfile, EmploymentStatus, Gender, EducationLevel } from '../types';

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
        setError('Ошибка при чтении файла');
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!fileContent) return;

    try {
      const lines = fileContent.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        setError('Файл пуст или содержит только заголовки');
        return;
      }

      const separator = lines[0].includes(';') ? ';' : ',';
      const parsedProfiles: YouthProfile[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(separator).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 4) {
          const id = `y_imp_${Date.now().toString().slice(-4)}_${i}`;
          const fullName = cols[1] || cols[0] || `Импортированный Профиль ${i}`;
          const makhalla = cols[2] || 'Олий Ҳиммат';
          const age = parseInt(cols[3], 10) || 22;
          const gender: Gender = (cols[4] && cols[4].includes('Жен')) ? 'Женский' : 'Мужской';
          const status: EmploymentStatus = (cols[5] as EmploymentStatus) || 'безработный';
          const activity = cols[6] || 'нет деятельности';
          const education: EducationLevel = (cols[7] as EducationLevel) || 'Средне-специальное';
          const isNeet = status === 'безработный' || status === 'не уточнено';

          parsedProfiles.push({
            id,
            full_name_demo: `${fullName} (Демо)`,
            makhalla,
            age,
            gender,
            phone_demo: `+998 (90) ${100 + i}-22-33`,
            employment_status: status,
            activity_type: activity,
            education,
            specialty: cols[8] || '—',
            skills: ['Импортированные навыки'],
            is_neet: isNeet,
            neet_verification: isNeet ? 'pending_verification' : 'rejected',
            needs_support: isNeet,
            support_recommendation: ['prog_ishga_marhamat_tech', 'prog_district_job_fair'],
            last_updated: new Date().toISOString().split('T')[0],
            notes: 'Импортировано из внешней таблицы',
            status_history: [
              {
                date: new Date().toISOString().split('T')[0],
                status,
                comment: 'Импорт из реестра'
              }
            ]
          });
        }
      }

      if (parsedProfiles.length > 0) {
        onImportProfiles(parsedProfiles);
        onClose();
      } else {
        setError('Не удалось распознать строки таблицы');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка обработки данных');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-1 w-full max-w-md rounded-2xl border border-white/[0.14] shadow-surface-modal p-5 space-y-3.5">
        
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {lang === 'ru' ? 'Импорт таблицы данных (CSV/Excel)' : 'Маълумотларни юклаш'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-surface-3 transition-colors">✕</button>
        </div>

        <p className="text-xs text-slate-400">
          {lang === 'ru'
            ? 'Загрузите CSV-файл со списком молодёжи для мгновенного обновления реестра.'
            : 'Маҳалла ёшлари бўйича CSV файлни юкланг.'}
        </p>

        {/* File Dropzone */}
        <label className="block p-5 rounded-xl border border-dashed border-white/[0.16] hover:border-indigo-500/60 bg-surface-2/60 text-center cursor-pointer transition-all">
          <FileSpreadsheet className="w-7 h-7 text-indigo-400 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-white block">
            {fileName ? fileName : (lang === 'ru' ? 'Нажмите для выбора CSV файла' : 'Файлни танланг')}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Поддерживаются файлы .CSV (с разделителями ; или ,)
          </span>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {previewCount > 0 && (
          <div className="p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <span>Распознано строк:</span>
            <strong className="text-white font-bold">{previewCount} записей</strong>
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            disabled={previewCount === 0}
            onClick={handleProcessImport}
            className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Импортировать</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 bg-surface-3 hover:bg-surface-card text-slate-300 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all"
          >
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
};
