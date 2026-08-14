import React, { useState } from 'react';
import { Map, Users, Briefcase, AlertOctagon, Phone, UserCheck, ArrowRight, Eye, Upload } from 'lucide-react';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { YouthProfile } from '../types';

interface DistrictMapViewProps {
  youthList: YouthProfile[];
  onSelectMakhalla: (makhalla: string) => void;
  lang: 'ru' | 'uz';
  onNavigateRegistry: () => void;
}

// Exact hotspot coordinates matching the painted district map
const MAP_HOTSPOTS: { [key: string]: { x: number; y: number; label: string; color: string } } = {
  'm_darxon': { x: 21.5, y: 63.5, label: 'Дархон', color: '#10B981' },
  'm_buyuk_ipak': { x: 21.5, y: 36.5, label: 'Буюк Ипак Йўли', color: '#10B981' },
  'm_shahriobod': { x: 30.5, y: 31.0, label: 'Шаҳриобод', color: '#10B981' },
  'm_oliy_himmat': { x: 48.0, y: 22.0, label: 'Олий Ҳиммат', color: '#F43F5E' },
  'm_feruza': { x: 55.0, y: 25.0, label: 'Феруза', color: '#F59E0B' },
  'm_avaykhon': { x: 47.0, y: 43.0, label: 'Авайхон', color: '#F59E0B' },
  'm_qorasuv': { x: 54.0, y: 67.0, label: 'Қорасув', color: '#F43F5E' },
  'm_humo': { x: 71.5, y: 61.0, label: 'Ҳумо', color: '#10B981' },
};

export const DistrictMapView: React.FC<DistrictMapViewProps> = ({
  youthList,
  onSelectMakhalla,
  lang,
  onNavigateRegistry
}) => {
  const [selectedMahallaId, setSelectedMahallaId] = useState<string>('m_oliy_himmat');
  const [customMapUrl, setCustomMapUrl] = useState<string>('/images/painted_district_map.png?v=4');

  const currentMahalla = MAKHALLAS_LIST.find(m => m.id === selectedMahallaId) || MAKHALLAS_LIST[0];
  const youthInCurrent = youthList.filter(y => y.makhalla === currentMahalla.name);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomMapUrl(url);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Map Context Info */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Map className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'ru' 
                ? 'Реальная ГИС-карта махаллей (Мирзо-Улугбекский район)' 
                : 'Мирзо Улуғбек тумани маҳаллалари реал харитаси'}
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Точная географическая карта с границами 8 махаллей района и цветовой индикацией зон риска NEET. Кликните по махалле для открытия паспорта.'
              : '8 та маҳалланинг аниқ чегаралари ва хавф даражалари кўрсатилган интерактив харита.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Custom image upload button */}
          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'Загрузить другую карту' : 'Бошқа харита юклаш'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Real Painted District Map with Interactive Hotspots */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-4 border border-slate-700/60 bg-[#07111f] relative overflow-hidden flex flex-col justify-between shadow-xl">
          
          <div className="flex items-center justify-between z-10 flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold text-cyan-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              Мирзо-Улугбекский район (8 пилотных махаллей)
            </span>
            <div className="flex items-center gap-3 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Норма</span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Внимание</span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Зона риска NEET</span>
            </div>
          </div>

          {/* Real Map Frame */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-white flex items-center justify-center p-2">
            
            {/* Painted Map Image */}
            <img
              src={customMapUrl}
              alt="Mirzo-Ulugbek District Painted Map"
              className="w-full h-auto object-contain select-none rounded-xl"
            />

            {/* Interactive Clickable Hotspots overlay right over the map labels */}
            {MAKHALLAS_LIST.map((m) => {
              const hotspot = MAP_HOTSPOTS[m.id] || { x: 50, y: 50, label: m.name, color: '#10B981' };
              const isSelected = m.id === selectedMahallaId;
              const isHighRisk = m.riskLevel === 'high';

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMahallaId(m.id)}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  aria-label={`Выбрать махаллю ${m.name}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all duration-300 hover:scale-115 focus:outline-none"
                >
                  {/* Outer Ripple Animation for Selected or High-Risk */}
                  {isSelected && (
                    <div 
                      className="absolute inset-0 rounded-2xl animate-ping opacity-75 pointer-events-none"
                      style={{ backgroundColor: isHighRisk ? '#f43f5e' : '#0284c7', transform: 'scale(1.4)' }}
                    />
                  )}

                  {/* Active Selection Glow Box */}
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-xl ${
                      isSelected
                        ? 'bg-slate-900 text-white border-2 border-cyan-400 scale-110 shadow-cyan-500/50 ring-4 ring-cyan-400/40'
                        : isHighRisk
                        ? 'bg-rose-900/90 text-white border border-rose-400 hover:bg-rose-800'
                        : 'bg-slate-900/85 text-white border border-slate-600 hover:border-cyan-400 hover:bg-slate-800'
                    }`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isHighRisk ? '#f43f5e' : isSelected ? '#38bdf8' : hotspot.color }}
                    />
                    <span className="text-xs">{m.name}</span>
                  </div>
                </button>
              );
            })}

          </div>

          <div className="text-center text-xs text-slate-400 z-10 font-medium pt-3">
            💡 Кликните по любой махалле на карте для открытия паспорта территории
          </div>
        </div>

        {/* Right: Makhalla Passport Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Паспорт территории:</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">Маҳалла «{currentMahalla.name}»</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    currentMahalla.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {currentMahalla.riskLevel === 'high' ? '⚠️ Высокий риск NEET' : '✓ Стабильная зона'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectMakhalla(currentMahalla.name)}
                className="px-4 py-2 bg-gov-600 hover:bg-gov-500 text-white text-xs font-bold rounded-xl transition-all shadow"
              >
                Выбрать
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                <div className="text-xs text-slate-400 font-medium">Молодёжь (18–30)</div>
                <div className="text-2xl font-black text-white mt-1">{currentMahalla.totalYouth} чел.</div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                <div className="text-xs text-slate-400 font-medium">Уровень занятости</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{currentMahalla.employmentRate}%</div>
              </div>

              <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/30">
                <div className="text-xs text-rose-300 font-medium">Кандидаты NEET</div>
                <div className="text-2xl font-black text-rose-400 mt-1">{currentMahalla.neetPending} чел.</div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                <div className="text-xs text-slate-400 font-medium">Господдержка</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{currentMahalla.supportedCount} чел.</div>
              </div>
            </div>

            {/* Responsible Leader */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Ответственный «Ёшлар етакчиси» (Лидер молодёжи):</span>
              </div>
              <div className="text-sm text-white font-bold">{currentMahalla.leaderName}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentMahalla.leaderPhone}</span>
              </div>
            </div>

            {/* Youth in this Mahalla */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">
                Профили молодёжи в этой махалле ({youthInCurrent.length}):
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {youthInCurrent.slice(0, 4).map(y => (
                  <div key={y.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="text-white font-semibold truncate max-w-[180px]">{y.full_name_demo}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      y.is_neet ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {y.is_neet ? 'NEET риск' : y.employment_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <button
            onClick={() => {
              onSelectMakhalla(currentMahalla.name);
              onNavigateRegistry();
            }}
            className="w-full py-3 bg-gradient-to-r from-gov-600 to-cyan-600 hover:from-gov-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Открыть реестр молодёжи махалли «{currentMahalla.name}»</span>
          </button>

        </div>

      </div>

    </div>
  );
};
