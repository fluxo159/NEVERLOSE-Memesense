import React, { useState, useEffect, useRef } from 'react';
import { Map, MapPin, Users, Briefcase, AlertOctagon, Phone, UserCheck, ArrowRight, Layers, Eye, Navigation2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  const [selectedMahallaId, setSelectedMahallaId] = useState<string>('m_oliy_himmat');
  const [mapMetric, setMapMetric] = useState<'neet' | 'employment'>('neet');
  const [viewType, setViewType] = useState<'real_gis' | 'schematic'>('real_gis');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const currentMahalla = MAKHALLAS_LIST.find(m => m.id === selectedMahallaId) || MAKHALLAS_LIST[0];
  const youthInCurrent = youthList.filter(y => y.makhalla === currentMahalla.name);

  const getColor = (m: typeof MAKHALLAS_LIST[0]) => {
    if (mapMetric === 'neet') {
      if (m.riskLevel === 'high') return '#f43f5e'; // rose-500
      if (m.riskLevel === 'medium') return '#f59e0b'; // amber-500
      return '#10b981'; // emerald-500
    } else {
      if (m.employmentRate >= 90) return '#10b981';
      if (m.employmentRate >= 83) return '#06b6d4';
      return '#f59e0b';
    }
  };

  // Initialize and Update Leaflet Real GIS Map
  useEffect(() => {
    if (viewType !== 'real_gis' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [41.3360, 69.3380], // Center of Mirzo-Ulugbek district
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Dark Matter CartoDB tiles for gorgeous GovTech dark aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (map && layerGroup) {
      layerGroup.clearLayers();

      MAKHALLAS_LIST.forEach(m => {
        const color = getColor(m);
        const isSelected = m.id === selectedMahallaId;

        // Render Mahalla Geographical Polygon
        const polygon = L.polygon(m.geoPolygon, {
          color: isSelected ? '#38bdf8' : color,
          weight: isSelected ? 4 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 0.6 : 0.35
        });

        polygon.on('click', () => {
          setSelectedMahallaId(m.id);
        });

        // Custom HTML Marker Pin
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: ${color};
              color: #ffffff;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: bold;
              white-space: nowrap;
              border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'};
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              cursor: pointer;
              transform: translate(-50%, -50%);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${m.name}</span>
              <span style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 10px; font-size: 10px;">
                ${mapMetric === 'neet' ? `${m.neetPending} NEET` : `${m.employmentRate}%`}
              </span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const marker = L.marker(m.geoCenter, { icon: customIcon });
        marker.on('click', () => {
          setSelectedMahallaId(m.id);
        });

        layerGroup.addLayer(polygon);
        layerGroup.addLayer(marker);
      });
    }
  }, [viewType, selectedMahallaId, mapMetric]);

  // Center on selected mahalla when changed
  useEffect(() => {
    if (mapInstanceRef.current && currentMahalla && viewType === 'real_gis') {
      mapInstanceRef.current.panTo(currentMahalla.geoCenter, { animate: true, duration: 0.8 });
    }
  }, [selectedMahallaId, viewType]);

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
                ? 'Реальная ГИС-карта занятости (Мирзо-Улугбекский район)' 
                : 'Мирзо Улуғбек тумани реал ГИС-харитаси'}
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Настоящая географическая карта Ташкента с реальными улицами (Буюк Ипак Йули, Паркентская, ТТЗ, Карасу) и тепловой окраской махаллей.'
              : 'Тошкент шаҳрининг реал кўчалари ва маҳаллалари акс этган ГИС-харита.'}
          </p>
        </div>

        {/* View Mode & Heatmap Metric Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Map Type Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setViewType('real_gis')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                viewType === 'real_gis' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ {lang === 'ru' ? 'Реальная карта (OpenStreetMap)' : 'Реал харита'}
            </button>
            <button
              onClick={() => setViewType('schematic')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                viewType === 'schematic' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              📊 {lang === 'ru' ? 'Схема секторов' : 'Схема'}
            </button>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setMapMetric('neet')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                mapMetric === 'neet' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              ⚠️ NEET риск
            </button>
            <button
              onClick={() => setMapMetric('employment')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                mapMetric === 'employment' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              ✓ Занятость %
            </button>
          </div>

        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Real GIS Map or Vector Scheme */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 border border-slate-700/60 bg-[#0c1626] relative overflow-hidden flex flex-col justify-between min-h-[520px] shadow-xl">
          
          <div className="flex items-center justify-between z-10 flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold text-cyan-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ташкент: Мирзо-Улугбекский район (8 пилотных секторов)</span>
            </span>
            <div className="flex items-center gap-3 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Норма</span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Внимание</span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold"><span className="w-2 h-2 rounded-full bg-rose-500"></span> NEET риск</span>
            </div>
          </div>

          {/* REAL LEAFLET GIS MAP CONTAINER */}
          {viewType === 'real_gis' ? (
            <div className="w-full flex-1 min-h-[440px] rounded-2xl overflow-hidden border border-slate-700/80 relative shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full min-h-[440px]" style={{ zIndex: 1 }} />
            </div>
          ) : (
            /* SCHEMATIC VECTOR VIEW */
            <div className="relative my-2 flex-1 flex items-center justify-center min-h-[440px]">
              <svg viewBox="0 0 540 440" className="w-full max-w-[500px] h-auto filter drop-shadow-2xl">
                <defs>
                  <pattern id="grid2" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid2)" />

                <path d="M 60 110 Q 260 140 480 130" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 120 110 Q 210 310 290 360" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 260 140 Q 380 260 480 300" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />

                {MAKHALLAS_LIST.map((m, idx) => {
                  const isSelected = selectedMahallaId === m.id;
                  const color = getColor(m);
                  const polys: { [key: string]: string } = {
                    'm_darxon': '50,60 170,50 190,140 100,170 50,120',
                    'm_buyuk_ipak': '180,45 320,55 330,150 200,145 180,110',
                    'm_feruza': '335,60 480,70 490,165 345,160',
                    'm_oliy_himmat': '100,180 210,160 220,260 120,270',
                    'm_shahriobod': '225,165 350,170 340,250 230,255',
                    'm_qorasuv': '360,175 490,180 470,290 350,270',
                    'm_avaykhon': '130,285 240,275 250,370 145,360',
                    'm_humo': '265,275 410,285 390,380 275,385'
                  };

                  return (
                    <g key={m.id} onClick={() => setSelectedMahallaId(m.id)} className="cursor-pointer transition-all duration-300">
                      <polygon 
                        points={polys[m.id] || '50,50 100,50 100,100 50,100'} 
                        fill={color}
                        fillOpacity={isSelected ? 0.8 : 0.45}
                        stroke={isSelected ? '#ffffff' : color}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text x={m.coordinates.x} y={m.coordinates.y - 5} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">{m.name}</text>
                      <text x={m.coordinates.x} y={m.coordinates.y + 12} fill="#e2e8f0" fontSize="10" textAnchor="middle">
                        {mapMetric === 'neet' ? `${m.neetPending} NEET` : `${m.employmentRate}%`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="text-center text-xs text-slate-400 z-10 font-medium pt-2">
            💡 Кликните на любую махаллю или маркер на реальной карте для открытия паспорта
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
                    currentMahalla.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
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
