import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  Users, 
  Briefcase, 
  AlertOctagon, 
  Phone, 
  UserCheck, 
  Eye, 
  Upload, 
  Layers, 
  Building2, 
  Sparkles, 
  Navigation2, 
  GraduationCap, 
  Award, 
  RotateCcw,
  CheckCircle2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAKHALLAS_LIST, DISTRICT_POI_LIST } from '../data/mahallasData';
import { YouthProfile, InfrastructurePOI } from '../types';

interface DistrictMapViewProps {
  youthList: YouthProfile[];
  onSelectMakhalla: (makhalla: string) => void;
  lang: 'ru' | 'uz';
  onNavigateRegistry: () => void;
}

type MapMode = 'leaflet_gis' | 'raster_scheme';
type ActiveLayer = 'neet' | 'employment';

// Precise coordinates of the circular dots on the user's map image (in percentages x%, y%)
const MAP_CIRCLE_PINS: { [key: string]: { x: number; y: number; label: string; risk: 'low' | 'medium' | 'high' } } = {
  'm_darxon': { x: 17.5, y: 64.2, label: 'Дархон', risk: 'low' },
  'm_buyuk_ipak': { x: 29.8, y: 36.5, label: 'Буюк Ипак Йўли', risk: 'low' },
  'm_shahriobod': { x: 36.2, y: 30.8, label: 'Шаҳриобод', risk: 'low' },
  'm_oliy_himmat': { x: 48.2, y: 24.5, label: 'Олий Ҳиммат', risk: 'high' },
  'm_feruza': { x: 50.2, y: 25.0, label: 'Феруза', risk: 'medium' },
  'm_avaykhon': { x: 41.8, y: 43.0, label: 'Авайхон', risk: 'medium' },
  'm_qorasuv': { x: 48.8, y: 67.5, label: 'Қорасув', risk: 'high' },
  'm_humo': { x: 67.2, y: 61.0, label: 'Ҳумо', risk: 'low' },
};

const DISTRICT_CENTER: [number, number] = [41.3385, 69.3450];

export const DistrictMapView: React.FC<DistrictMapViewProps> = ({
  youthList,
  onSelectMakhalla,
  lang,
  onNavigateRegistry
}) => {
  const [mapMode, setMapMode] = useState<MapMode>('leaflet_gis');
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('neet');
  const [showPoi, setShowPoi] = useState<boolean>(true);
  const [selectedMahallaId, setSelectedMahallaId] = useState<string>('m_oliy_himmat');
  const [selectedPoi, setSelectedPoi] = useState<InfrastructurePOI | null>(null);
  const [customMapUrl, setCustomMapUrl] = useState<string>('/images/painted_district_map.png?v=5');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const poiGroupRef = useRef<L.FeatureGroup | null>(null);

  const currentMahalla = MAKHALLAS_LIST.find(m => m.id === selectedMahallaId) || MAKHALLAS_LIST[0];

  // Dynamic statistics from youthList scoped to current mahalla
  const youthInCurrent = youthList.filter(y => y.makhalla === currentMahalla.name);
  const totalInCurrent = youthInCurrent.length;
  const employedInCurrent = youthInCurrent.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studyingInCurrent = youthInCurrent.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const neetPendingInCurrent = youthInCurrent.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const supportedInCurrent = youthInCurrent.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const dynamicEmploymentRate = totalInCurrent > 0 
    ? Math.round(((employedInCurrent + studyingInCurrent) / totalInCurrent) * 100) 
    : 0;

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapMode !== 'leaflet_gis' || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: DISTRICT_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const polyGroup = L.featureGroup().addTo(map);
    const poiGroup = L.featureGroup().addTo(map);
    polygonsGroupRef.current = polyGroup;
    poiGroupRef.current = poiGroup;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapMode]);

  // Update Polygons & Layers
  useEffect(() => {
    if (mapMode !== 'leaflet_gis' || !mapInstanceRef.current || !polygonsGroupRef.current) return;

    const map = mapInstanceRef.current;
    const polyGroup = polygonsGroupRef.current;
    polyGroup.clearLayers();

    MAKHALLAS_LIST.forEach(mahalla => {
      const isSelected = mahalla.id === selectedMahallaId;
      const mahallaYouth = youthList.filter(y => y.makhalla === mahalla.name);
      const neetCount = mahallaYouth.filter(y => y.is_neet).length;
      const empRate = mahallaYouth.length > 0
        ? Math.round(((mahallaYouth.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель' || y.employment_status === 'обучается').length) / mahallaYouth.length) * 100)
        : 85;

      let fillColor = '#10b981';
      let strokeColor = '#34d399';

      if (activeLayer === 'neet') {
        if (mahalla.riskLevel === 'high' || neetCount >= 3) {
          fillColor = '#f43f5e';
          strokeColor = '#fb7185';
        } else if (mahalla.riskLevel === 'medium' || neetCount >= 2) {
          fillColor = '#f59e0b';
          strokeColor = '#fbbf24';
        } else {
          fillColor = '#10b981';
          strokeColor = '#34d399';
        }
      } else {
        if (empRate >= 90) {
          fillColor = '#06b6d4';
          strokeColor = '#38bdf8';
        } else if (empRate >= 80) {
          fillColor = '#10b981';
          strokeColor = '#4ade80';
        } else {
          fillColor = '#f97316';
          strokeColor = '#fb923c';
        }
      }

      const polygon = L.polygon(mahalla.geoPolygon, {
        color: isSelected ? '#38bdf8' : strokeColor,
        weight: isSelected ? 3.5 : 1.5,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : 0.35,
        dashArray: isSelected ? undefined : '4, 4'
      });

      const tooltipContent = `
        <div style="font-family: inherit; padding: 4px 6px; background: #0f172a; border-radius: 8px; color: #fff;">
          <div style="font-weight: 800; font-size: 12px; color: #38bdf8; margin-bottom: 2px;">
            Маҳалла «${mahalla.name}»
          </div>
          <div style="font-size: 11px; color: #cbd5e1; display: flex; gap: 8px;">
            <span>Молодёжь: <b>${mahallaYouth.length} чел.</b></span>
            <span>NEET: <b style="color: ${neetCount > 0 ? '#f43f5e' : '#10b981'};">${neetCount}</b></span>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top'
      });

      polygon.on('click', () => {
        setSelectedMahallaId(mahalla.id);
        setSelectedPoi(null);
        map.flyTo(mahalla.geoCenter, 14, { duration: 0.8 });
      });

      polygon.addTo(polyGroup);

      // Mahalla Label Icon
      const centerIcon = L.divIcon({
        className: 'custom-mahalla-label',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            background: ${isSelected ? 'rgba(14, 165, 233, 0.95)' : 'rgba(15, 23, 42, 0.85)'};
            border: 1px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)'};
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: ${fillColor};"></span>
            ${mahalla.name}
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker(mahalla.geoCenter, { icon: centerIcon }).addTo(polyGroup);
    });
  }, [mapMode, activeLayer, selectedMahallaId, youthList]);

  // Update POI Layer
  useEffect(() => {
    if (mapMode !== 'leaflet_gis' || !mapInstanceRef.current || !poiGroupRef.current) return;

    const poiGroup = poiGroupRef.current;
    poiGroup.clearLayers();

    if (!showPoi) return;

    DISTRICT_POI_LIST.forEach(poi => {
      const isSelected = selectedPoi?.id === poi.id;

      let iconBg = '#0284c7';
      let iconEmoji = '🏛️';

      if (poi.category === 'monocenter') {
        iconBg = '#f59e0b';
        iconEmoji = '🎓';
      } else if (poi.category === 'it_park') {
        iconBg = '#06b6d4';
        iconEmoji = '💻';
      } else if (poi.category === 'youth_center') {
        iconBg = '#8b5cf6';
        iconEmoji = '🚀';
      } else if (poi.category === 'employment_center') {
        iconBg = '#10b981';
        iconEmoji = '🏢';
      }

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            border-radius: 12px;
            background: ${iconBg};
            border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'};
            box-shadow: 0 0 16px ${isSelected ? 'rgba(56, 189, 248, 0.9)' : 'rgba(0,0,0,0.5)'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${iconEmoji}
          </div>
        `,
        iconSize: [32, 32]
      });

      const marker = L.marker(poi.coordinates, { icon: poiIcon });
      marker.on('click', () => {
        setSelectedPoi(poi);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(poi.coordinates, 15, { duration: 0.8 });
        }
      });

      marker.addTo(poiGroup);
    });
  }, [mapMode, showPoi, selectedPoi]);

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
              <MapIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'ru' 
                ? 'Интерактивная ГИС-карта занятости (Мирзо-Улугбекский район)' 
                : 'Мирзо Улуғбек тумани ГИС-харитаси'}
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Пространственный мониторинг махаллей, зон риска NEET и ключевых центров господдержки (Моноцентр, IT-Park, ЦЗН).'
              : 'Маҳаллалар кесимида бандлик, NEET хавфи ва давлат марказларининг интерактив харитаси.'}
          </p>
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Map Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setMapMode('leaflet_gis')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                mapMode === 'leaflet_gis' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ {lang === 'ru' ? 'ГИС-Вектор' : 'ГИС'}
            </button>
            <button
              onClick={() => setMapMode('raster_scheme')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                mapMode === 'raster_scheme' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🖼️ {lang === 'ru' ? 'Схема махаллей' : 'Схема'}
            </button>
          </div>

          {/* Layer Controls for Leaflet */}
          {mapMode === 'leaflet_gis' && (
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveLayer('neet')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeLayer === 'neet' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                ⚠️ NEET
              </button>
              <button
                onClick={() => setActiveLayer('employment')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeLayer === 'employment' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                ✓ Занятость
              </button>
              <button
                onClick={() => setShowPoi(!showPoi)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  showPoi ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏛️ Госцентры ({DISTRICT_POI_LIST.length})
              </button>
            </div>
          )}

          {mapMode === 'raster_scheme' && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'Загрузить карту' : 'Харита юклаш'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}

        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Map Container */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-4 border border-slate-700/60 bg-[#07111f] relative overflow-hidden flex flex-col justify-between min-h-[500px] shadow-xl">
          
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

          {/* Map Body: Leaflet GIS or Raster Scheme */}
          {mapMode === 'leaflet_gis' ? (
            <div className="w-full flex-1 min-h-[440px] rounded-2xl overflow-hidden border border-slate-700/80 relative shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full min-h-[440px]" style={{ zIndex: 1 }} />
            </div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-white flex items-center justify-center p-2">
              <img
                src={customMapUrl}
                alt="Mirzo-Ulugbek District Painted Map"
                className="w-full h-auto object-contain select-none rounded-xl"
              />

              {/* Interactive Target Rings on Painted Map */}
              {MAKHALLAS_LIST.map((m) => {
                const pin = MAP_CIRCLE_PINS[m.id] || { x: 50, y: 50, label: m.name, risk: 'low' };
                const isSelected = m.id === selectedMahallaId && !selectedPoi;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMahallaId(m.id);
                      setSelectedPoi(null);
                    }}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    aria-label={`Выбрать махаллю ${m.name}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-2 focus:outline-none"
                    title={`Кликните для выбора: ${m.name}`}
                  >
                    {isSelected && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-80 pointer-events-none"
                        style={{ 
                          backgroundColor: pin.risk === 'high' ? '#f43f5e' : '#06b6d4',
                          transform: 'scale(1.8)'
                        }}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-4 border-cyan-400 bg-cyan-400/30 scale-125 shadow-lg shadow-cyan-400/80 ring-4 ring-cyan-500/50'
                          : 'border-2 border-transparent hover:border-white/80 hover:scale-120'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-center text-xs text-slate-400 z-10 font-medium pt-3">
            💡 Кликните по махалле или государственному центру для открытия детального паспорта
          </div>
        </div>

        {/* Right: Makhalla / POI Passport Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4">
          
          {selectedPoi ? (
            /* POI INFRASTRUCTURE INSPECTOR */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                    Государственный объект поддержки:
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedPoi.name}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedPoi.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPoi(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Профиль деятельности:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'ru' ? selectedPoi.descriptionRu : selectedPoi.descriptionUz}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">Активных программ</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{selectedPoi.servicesCount} курсов</div>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">Контакты / Горячая линия</div>
                  <div className="text-xs font-bold text-emerald-400 mt-2 font-mono">{selectedPoi.phone}</div>
                </div>
              </div>

              <button
                onClick={onNavigateRegistry}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Направить безработную молодёжь в этот центр</span>
              </button>
            </div>
          ) : (
            /* REGULAR MAKAHLLA PASSPORT */
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

              {/* Dynamic Real Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">Молодёжь (в реестре)</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {totalInCurrent} <span className="text-xs text-slate-400 font-normal">чел.</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">Уровень занятости</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {dynamicEmploymentRate}%
                  </div>
                </div>

                <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/30">
                  <div className="text-xs text-rose-300 font-medium">Кандидаты NEET (проверка)</div>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    {neetPendingInCurrent} <span className="text-xs text-rose-300 font-normal">чел.</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">Охвачено программами</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {supportedInCurrent} <span className="text-xs text-slate-400 font-normal">чел.</span>
                  </div>
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

              {/* Youth list in this Mahalla */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">
                  Профили молодёжи в махалле ({totalInCurrent} чел.):
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
          )}

        </div>

      </div>

    </div>
  );
};
