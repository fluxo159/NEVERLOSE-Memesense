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
      if (m.riskLevel === 'high') return 'fill-rose-600/60 stroke-rose-400 hover:fill-rose-500/80';
      if (m.riskLevel === 'medium') return 'fill-amber-600/60 stroke-amber-400 hover:fill-amber-500/80';
      return 'fill-emerald-600/50 stroke-emerald-400 hover:fill-emerald-500/80';
    } else if (mapMetric === 'employment') {
      if (m.employmentRate >= 90) return 'fill-emerald-600/60 stroke-emerald-400 hover:fill-emerald-500/80';
      if (m.employmentRate >= 83) return 'fill-cyan-600/60 stroke-cyan-400 hover:fill-cyan-500/80';
      return 'fill-amber-600/60 stroke-amber-400 hover:fill-amber-500/80';
    } else {
      return 'fill-gov-600/50 stroke-cyan-400 hover:fill-gov-500/80';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Map Context Info */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {lang === 'ru' 
                ? 'Интерактивная ГИС-карта занятости Мирзо-Улугбекского района' 
                : 'Мирзо Улуғбек тумани бандлик ГИС-харитаси'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {lang === 'ru'
              ? 'Агрегированная пространственная визуализация без персональных адресов. Нажмите на махаллю на схеме для детального анализа и фильтрации.'
              : 'Шахсий маълумотларсиз умумлаштирилган харитавий таҳлил.'}
          </p>
        </div>

        {/* Heatmap Metric Selector */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'Слой:' : 'Қатлам:'}</span>
          </span>
          <button
            onClick={() => setMapMetric('neet')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mapMetric === 'neet' ? 'bg-rose-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚠️ NEET (Зона риска)
          </button>
          <button
            onClick={() => setMapMetric('employment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mapMetric === 'employment' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ✓ Уровень занятости
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: SVG Map Visualizer */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-[#0c1626] relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          
          {/* Map Controls & Legends Header */}
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              Ташкент | Мирзо-Улугбекский район (8 пилотных секторов)
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Норма</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Внимание</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Высокий риск NEET</span>
            </div>
          </div>

          {/* Interactive SVG District Scheme */}
          <div className="relative my-4 flex items-center justify-center">
            <svg viewBox="0 0 540 440" className="w-full max-w-[500px] h-auto filter drop-shadow-2xl">
              
              {/* Background Grid Lines */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connecting District Roads/Boulevards */}
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
                <text x="110" y="110" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Дархон</text>
                <text x="110" y="125" fill="#94a3b8" fontSize="9" textAnchor="middle">95.7% банд</text>
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
                <text x="255" y="95" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Б. Ипак Йўли</text>
                <text x="255" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle">91.3% банд</text>
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
                <text x="415" y="110" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Феруза</text>
                <text x="415" y="125" fill="#fca5a5" fontSize="9" textAnchor="middle">28 NEET кутмоқда</text>
              </g>

              {/* Mahalla Polygon 4: Олий Ҳиммат (Высокий фокус NEET) */}
              <g 
                onClick={() => setSelectedMahallaId('m_oliy_himmat')}
                className="cursor-pointer transition-all duration-300"
              >
                <polygon 
                  points="100,180 210,160 220,260 120,270" 
                  className={`${getMahallaColor(MAKHALLAS_LIST.find(m => m.id === 'm_oliy_himmat')!)} ${selectedMahallaId === 'm_oliy_himmat' ? 'stroke-white stroke-[3px] filter drop-shadow(0 0 12px rgba(244,63,94,0.9))' : 'stroke-[2px]'}`}
                />
                <text x="160" y="215" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Олий Ҳиммат</text>
                <text x="160" y="230" fill="#fecdd3" fontSize="9" fontWeight="bold" textAnchor="middle">⚠️ 34 NEET на проверке</text>
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
                <text x="285" y="205" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Шаҳриобод</text>
                <text x="285" y="220" fill="#94a3b8" fontSize="9" textAnchor="middle">90.3% банд</text>
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
                <text x="420" y="225" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Қорасув</text>
                <text x="420" y="240" fill="#fecdd3" fontSize="9" fontWeight="bold" textAnchor="middle">39 NEET на проверке</text>
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
                <text x="190" y="325" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Авайхон</text>
                <text x="190" y="340" fill="#94a3b8" fontSize="9" textAnchor="middle">84.3% банд</text>
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
                <text x="340" y="330" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Ҳумо</text>
                <text x="340" y="345" fill="#94a3b8" fontSize="9" textAnchor="middle">91.5% банд</text>
              </g>

            </svg>
          </div>

          <div className="text-center text-xs text-slate-400 z-10">
            💡 Нажмите на любой сектор махалли для просмотра паспорта занятости
          </div>
        </div>

        {/* Right: Makhalla Passport & Detail Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 flex flex-col justify-between space-y-4">
          
          <div>
            {/* Header with Name */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">Паспорт территории:</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">Маҳалла «{currentMahalla.name}»</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Мирзо-Улугбекский район</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentMahalla.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {currentMahalla.riskLevel === 'high' ? 'Высокая концентрация NEET' : 'Благополучная зона'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => onSelectMakhalla(currentMahalla.name)}
                className="px-3 py-1.5 bg-gov-600 hover:bg-gov-500 text-white text-xs font-semibold rounded-xl transition-all shadow flex items-center gap-1"
                title="Отфильтровать всю систему по этой махалле"
              >
                <span>Выбрать</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70">
                <div className="text-[11px] text-slate-400">Всего молодёжи 18–30</div>
                <div className="text-xl font-bold text-white mt-1">{currentMahalla.totalYouth} <span className="text-xs font-normal text-slate-400">чел.</span></div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70">
                <div className="text-[11px] text-slate-400">Уровень занятости</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{currentMahalla.employmentRate}%</div>
              </div>

              <div className="bg-rose-950/30 p-3 rounded-2xl border border-rose-500/30">
                <div className="text-[11px] text-rose-300">Кандидаты NEET (на проверке)</div>
                <div className="text-xl font-bold text-rose-400 mt-1">{currentMahalla.neetPending} <span className="text-xs font-normal text-rose-300">чел.</span></div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70">
                <div className="text-[11px] text-slate-400">Охвачено субсидиями</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">{currentMahalla.supportedCount} <span className="text-xs font-normal text-slate-400">чел.</span></div>
              </div>
            </div>

            {/* Responsible Mahalla Leader */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Ответственный «Ёшлар етакчиси» (Лидер молодёжи):</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold">{currentMahalla.leaderName}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentMahalla.leaderPhone}</span>
              </div>
            </div>

            {/* Sample Demographics in this Mahalla */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Профили молодёжи в этой махалле ({youthInCurrent.length}):</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {youthInCurrent.map(y => (
                  <div key={y.id} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="text-white font-medium truncate max-w-[180px]">{y.full_name_demo}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      y.is_neet ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {y.is_neet ? 'NEET риск' : y.employment_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                onSelectMakhalla(currentMahalla.name);
                onNavigateRegistry();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-gov-600 to-cyan-600 hover:from-gov-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Посмотреть полный реестр махалли «{currentMahalla.name}»</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
