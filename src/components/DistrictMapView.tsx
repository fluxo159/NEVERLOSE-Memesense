import React, { useState } from 'react';
import { Map, MapPin, Users, Briefcase, AlertOctagon, Phone, UserCheck, ArrowRight, Layers, Eye } from 'lucide-react';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { YouthProfile } from '../types';

interface DistrictMapViewProps {
  youthList: YouthProfile[];
  onSelectMakhalla: (makhalla: string) => void;
  lang: 'ru' | 'uz';
  onNavigateRegistry: () => void;
}

export const DistrictMapView: React.FC<DistrictMapViewProps> = ({
  youthList,
  onSelectMakhalla,
  lang,
  onNavigateRegistry
}) => {
  const [selectedMahallaId, setSelectedMahallaId] = useState<string>(MAKHALLAS_LIST[0].id);
  const [mapMetric, setMapMetric] = useState<'employment' | 'neet' | 'total'>('neet');

  const currentMahalla = MAKHALLAS_LIST.find(m => m.id === selectedMahallaId) || MAKHALLAS_LIST[0];
  const youthInCurrent = youthList.filter(y => y.makhalla === currentMahalla.name);

  const getMahallaColor = (m: typeof MAKHALLAS_LIST[0]) => {
    if (mapMetric === 'neet') {
      if (m.riskLevel === 'high') return 'fill-rose-600/70 stroke-rose-400 hover:fill-rose-500/90';
      if (m.riskLevel === 'medium') return 'fill-amber-600/70 stroke-amber-400 hover:fill-amber-500/90';
      return 'fill-emerald-600/60 stroke-emerald-400 hover:fill-emerald-500/90';
    } else if (mapMetric === 'employment') {
      if (m.employmentRate >= 90) return 'fill-emerald-600/70 stroke-emerald-400 hover:fill-emerald-500/90';
      if (m.employmentRate >= 83) return 'fill-cyan-600/70 stroke-cyan-400 hover:fill-cyan-500/90';
      return 'fill-amber-600/70 stroke-amber-400 hover:fill-amber-500/90';
    } else {
      return 'fill-gov-600/60 stroke-cyan-400 hover:fill-gov-500/90';
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
                ? 'Интерактивная ГИС-карта занятости района' 
                : 'Туман бандлик ГИС-харитаси'}
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Пространственная тепловая визуализация состояния занятости по 8 секторам Мирзо-Улугбекского района без раскрытия персональных адресов.'
              : 'Шахсий манзилларсиз умумлаштирилган харитавий таҳлил.'}
          </p>
        </div>

        {/* Heatmap Metric Selector */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setMapMetric('neet')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              mapMetric === 'neet' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚠️ NEET (Зона риска)
          </button>
          <button
            onClick={() => setMapMetric('employment')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              mapMetric === 'employment' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            ✓ Уровень занятости
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: SVG Map Visualizer */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-[#0c1626] relative overflow-hidden flex flex-col justify-between min-h-[480px] shadow-xl">
          
          <div className="flex items-center justify-between z-10 flex-wrap gap-2">
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-xl border border-cyan-500/30">
              Мирзо-Улугбекский район (8 секторов)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Норма</span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Внимание</span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold"><span className="w-2 h-2 rounded-full bg-rose-500"></span> NEET риск</span>
            </div>
          </div>

          {/* Interactive SVG District Scheme */}
          <div className="relative my-4 flex items-center justify-center">
            <svg viewBox="0 0 540 440" className="w-full max-w-[500px] h-auto filter drop-shadow-2xl">
              
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <path d="M 60 110 Q 260 140 480 130" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 120 110 Q 210 310 290 360" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 260 140 Q 380 260 480 300" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />

              {/* Mahalla Polygon 1: Дархон */}
              <g 
                onClick={() => setSelectedMahallaId('m_darxon')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="50,60 170,50 190,140 100,170 50,120" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_darxon')!)} ${selectedMahallaId === 'm_darxon' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="110" y="110" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Дархон</text>
                <text x="110" y="127" fill="#cbd5e1" fontSize="10" textAnchor="middle">95.7% банд</text>
              </g>

              {/* Mahalla Polygon 2: Буюк Ипак Йўли */}
              <g 
                onClick={() => setSelectedMahallaId('m_buyuk_ipak')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="180,45 320,55 330,150 200,145 180,110" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_buyuk_ipak')!)} ${selectedMahallaId === 'm_buyuk_ipak' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="255" y="95" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Б. Ипак Йўли</text>
                <text x="255" y="112" fill="#cbd5e1" fontSize="10" textAnchor="middle">91.3% банд</text>
              </g>

              {/* Mahalla Polygon 3: Феруза */}
              <g 
                onClick={() => setSelectedMahallaId('m_feruza')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="335,60 480,70 490,165 345,160" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_feruza')!)} ${selectedMahallaId === 'm_feruza' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="415" y="110" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Феруза</text>
                <text x="415" y="127" fill="#fecdd3" fontSize="10" textAnchor="middle">28 NEET</text>
              </g>

              {/* Mahalla Polygon 4: Олий Ҳиммат */}
              <g 
                onClick={() => setSelectedMahallaId('m_oliy_himmat')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="100,180 210,160 220,260 120,270" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_oliy_himmat')!)} ${selectedMahallaId === 'm_oliy_himmat' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 12px rgba(244,63,94,0.9))' : 'stroke-[2px]'}`}
                />
                <text x="160" y="215" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Олий Ҳиммат</text>
                <text x="160" y="232" fill="#ffe4e6" fontSize="10" fontWeight="bold" textAnchor="middle">⚠️ 34 NEET</text>
              </g>

              {/* Mahalla Polygon 5: Шаҳриобод */}
              <g 
                onClick={() => setSelectedMahallaId('m_shahriobod')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="225,165 350,170 340,250 230,255" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_shahriobod')!)} ${selectedMahallaId === 'm_shahriobod' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="285" y="205" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Шаҳриобод</text>
                <text x="285" y="222" fill="#cbd5e1" fontSize="10" textAnchor="middle">90.3% банд</text>
              </g>

              {/* Mahalla Polygon 6: Қорасув */}
              <g 
                onClick={() => setSelectedMahallaId('m_qorasuv')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="360,175 490,180 470,290 350,270" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_qorasuv')!)} ${selectedMahallaId === 'm_qorasuv' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(244,63,94,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="420" y="225" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Қорасув</text>
                <text x="420" y="242" fill="#ffe4e6" fontSize="10" fontWeight="bold" textAnchor="middle">39 NEET</text>
              </g>

              {/* Mahalla Polygon 7: Авайхон */}
              <g 
                onClick={() => setSelectedMahallaId('m_avaykhon')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="130,285 240,275 250,370 145,360" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_avaykhon')!)} ${selectedMahallaId === 'm_avaykhon' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="190" y="325" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Авайхон</text>
                <text x="190" y="342" fill="#cbd5e1" fontSize="10" textAnchor="middle">84.3% банд</text>
              </g>

              {/* Mahalla Polygon 8: Ҳумо */}
              <g 
                onClick={() => setSelectedMahallaId('m_humo')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="265,275 410,285 390,380 275,385" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_humo')!)} ${selectedMahallaId === 'm_humo' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 10px rgba(6,182,212,0.8))' : 'stroke-[1.5px]'}`}
                />
                <text x="340" y="330" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Ҳумо</text>
                <text x="340" y="347" fill="#cbd5e1" fontSize="10" textAnchor="middle">91.5% банд</text>
              </g>

            </svg>
          </div>

          <div className="text-center text-xs text-slate-400 z-10 font-medium">
            💡 Нажмите на сектор махалли на схеме для открытия паспорта территории
          </div>
        </div>

        {/* Right: Makhalla Passport */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Паспорт территории:</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">Маҳалла «{currentMahalla.name}»</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentMahalla.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {currentMahalla.riskLevel === 'high' ? '⚠️ Высокий риск NEET' : '✓ Стабильная зона'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectMakhalla(currentMahalla.name)}
                className="px-3.5 py-2 bg-gov-600 hover:bg-gov-500 text-white text-xs font-bold rounded-xl transition-all shadow"
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
