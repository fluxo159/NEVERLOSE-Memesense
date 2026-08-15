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
  ZoomIn, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import L from 'leaflet';
import { MAKHALLAS_LIST, DISTRICT_POI_LIST } from '../data/mahallasData';
import { YouthProfile, InfrastructurePOI } from '../types';
import { getMahallaName } from '../data/translations';

interface DistrictMapViewProps {
  youthList: YouthProfile[];
  onSelectMakhalla: (makhalla: string) => void;
  lang: 'ru' | 'uz';
  onNavigateRegistry: () => void;
}

type MapMode = 'leaflet_gis' | 'raster_scheme';
type ActiveLayer = 'neet' | 'employment' | 'poi';

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

  // Initialize and manage Leaflet map
  useEffect(() => {
    if (mapMode !== 'leaflet_gis' || !mapContainerRef.current) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with dark theme settings
    const map = L.map(mapContainerRef.current, {
      center: DISTRICT_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Feature groups for polygons and POIs
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

  // Update Polygons & Layers when dependencies change
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

      // Color computation based on active layer
      let fillColor = '#10b981'; // Green
      let strokeColor = '#34d399';

      if (activeLayer === 'neet') {
        if (mahalla.riskLevel === 'high' || neetCount >= 4) {
          fillColor = '#f43f5e'; // Rose / Red
          strokeColor = '#fb7185';
        } else if (mahalla.riskLevel === 'medium' || neetCount >= 2) {
          fillColor = '#f59e0b'; // Amber
          strokeColor = '#fbbf24';
        } else {
          fillColor = '#10b981'; // Emerald
          strokeColor = '#34d399';
        }
      } else if (activeLayer === 'employment') {
        if (empRate >= 90) {
          fillColor = '#06b6d4'; // Cyan
          strokeColor = '#38bdf8';
        } else if (empRate >= 80) {
          fillColor = '#10b981'; // Emerald
          strokeColor = '#4ade80';
        } else {
          fillColor = '#f97316'; // Orange
          strokeColor = '#fb923c';
        }
      } else {
        fillColor = isSelected ? '#0ea5e9' : '#334155';
        strokeColor = '#0284c7';
      }

      const polygon = L.polygon(mahalla.geoPolygon, {
        color: isSelected ? '#38bdf8' : strokeColor,
        weight: isSelected ? 3.5 : 1.5,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : 0.35,
        dashArray: isSelected ? undefined : '4, 4'
      });

      // Interactive Tooltip
      const mahallaDisplayName = getMahallaName(mahalla.name, lang);
      const tooltipContent = `
        <div style="font-family: inherit; padding: 2px 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #38bdf8; margin-bottom: 2px;">
            ${lang === 'ru' ? `Махалля «${mahalla.name}»` : `«${mahallaDisplayName}» mahallasi`}
          </div>
          <div style="font-size: 11px; color: #cbd5e1; display: flex; gap: 8px;">
            <span>${lang === 'ru' ? 'Молодёжь' : 'Yoshlar'}: <b style="color: #ffffff;">${mahallaYouth.length}</b></span>
            <span>NEET: <b style="color: ${neetCount > 0 ? '#f43f5e' : '#10b981'};">${neetCount}</b></span>
            <span>${lang === 'ru' ? 'Занятость' : 'Bandlik'}: <b style="color: #38bdf8;">${empRate}%</b></span>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        className: 'leaflet-tooltip-dark',
        sticky: true,
        direction: 'top'
      });

      // Click Event
      polygon.on('click', () => {
        setSelectedMahallaId(mahalla.id);
        setSelectedPoi(null);
        map.flyTo(mahalla.geoCenter, 14, { duration: 0.8 });
      });

      // Hover glow effects
      polygon.on('mouseover', function (this: L.Polygon) {
        this.setStyle({
          fillOpacity: 0.75,
          weight: 3.5,
          color: '#ffffff'
        });
      });

      polygon.on('mouseout', function (this: L.Polygon) {
        this.setStyle({
          fillOpacity: isSelected ? 0.65 : 0.35,
          weight: isSelected ? 3.5 : 1.5,
          color: isSelected ? '#38bdf8' : strokeColor
        });
      });

      polygon.addTo(polyGroup);

      // Add center label marker
      const centerIcon = L.divIcon({
        className: 'custom-mahalla-label',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            background: ${isSelected ? 'rgba(14, 165, 233, 0.9)' : 'rgba(15, 23, 42, 0.85)'};
            border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.2)'};
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
            ${mahallaDisplayName}
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker(mahalla.geoCenter, { icon: centerIcon, interactive: false }).addTo(polyGroup);
    });

  }, [mapMode, activeLayer, selectedMahallaId, youthList]);

  // Update POI Infrastructure Markers
  useEffect(() => {
    if (mapMode !== 'leaflet_gis' || !mapInstanceRef.current || !poiGroupRef.current) return;

    const poiGroup = poiGroupRef.current;
    poiGroup.clearLayers();

    if (!showPoi) return;

    DISTRICT_POI_LIST.forEach(poi => {
      let iconColor = '#06b6d4';
      let badge = '🏛️';

      if (poi.category === 'monocenter') {
        iconColor = '#10b981';
        badge = '🎓';
      } else if (poi.category === 'it_park') {
        iconColor = '#8b5cf6';
        badge = '💻';
      } else if (poi.category === 'employment_center') {
        iconColor = '#f59e0b';
        badge = '💼';
      } else if (poi.category === 'youth_center') {
        iconColor = '#ec4899';
        badge = '🚀';
      }

      const customPoiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${iconColor};
            border: 2px solid #ffffff;
            box-shadow: 0 0 16px ${iconColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s;
          " class="hover:scale-125">
            ${badge}
          </div>
        `,
        iconSize: [32, 32]
      });

      const marker = L.marker(poi.coordinates, { icon: customPoiIcon });

      marker.on('click', () => {
        setSelectedPoi(poi);
      });

      marker.addTo(poiGroup);
    });
  }, [mapMode, showPoi]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomMapUrl(url);
    }
  };

  const handleResetMapPosition = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(DISTRICT_CENTER, 13, { duration: 0.8 });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Controls Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {lang === 'ru' 
                  ? 'Интерактивная ГИС-карта махаллей (Мирзо-Улугбекский район)' 
                  : 'Mirzo Ulug‘bek tumani interaktiv GIS xaritasi'}
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  GIS v2.0
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Геоинформационный мониторинг распределения молодёжи, тепловых зон риска NEET и центров государственной поддержки.'
              : 'Yoshlar taqsimoti, NEET xavf zonalari va davlat qo‘llab-quvvatlash markazlarining geoaaxborot monitoringi.'}
          </p>
        </div>

        {/* Mode Switcher & Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* GIS vs Scheme Tab Toggle */}
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center shadow-inner">
            <button
              onClick={() => setMapMode('leaflet_gis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'leaflet_gis'
                  ? 'bg-gradient-to-r from-gov-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation2 className="w-3.5 h-3.5" />
              <span>GIS (Leaflet)</span>
            </button>
            <button
              onClick={() => setMapMode('raster_scheme')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'raster_scheme'
                  ? 'bg-gradient-to-r from-gov-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Схема района' : 'Tuman sxemasi'}</span>
            </button>
          </div>

          {mapMode === 'raster_scheme' && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'Загрузить схему' : 'Yuklash'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}

          {mapMode === 'leaflet_gis' && (
            <button
              onClick={handleResetMapPosition}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
              title={lang === 'ru' ? 'Сбросить масштаб к центру района' : 'Tuman markaziga qaytarish'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

        </div>

      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Map Container View */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-4 border border-slate-700/60 bg-[#07111f] relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[560px]">
          
          {/* Layer Filter Toolbar (Only in GIS mode) */}
          {mapMode === 'leaflet_gis' && (
            <div className="flex items-center justify-between z-10 flex-wrap gap-2 mb-3">
              
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">{lang === 'ru' ? 'Слой:' : 'Qatlam:'}</span>
                
                <button
                  onClick={() => setActiveLayer('neet')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeLayer === 'neet'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔴 {lang === 'ru' ? 'Риск NEET' : 'NEET xavfi'}
                </button>

                <button
                  onClick={() => setActiveLayer('employment')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeLayer === 'employment'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🟢 {lang === 'ru' ? 'Занятость (%)' : 'Bandlik (%)'}
                </button>
              </div>

              {/* Toggle POI Centers */}
              <button
                onClick={() => setShowPoi(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showPoi
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>{lang === 'ru' ? 'Гос. центры (POI)' : 'Davlat markazlari (POI)'}</span>
              </button>

            </div>
          )}

          {/* Raster Scheme Legend (Only in Raster mode) */}
          {mapMode === 'raster_scheme' && (
            <div className="flex items-center justify-between z-10 flex-wrap gap-2 mb-3">
              <span className="text-xs font-semibold text-cyan-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
                {lang === 'ru' ? 'Мирзо-Улугбекский район (Схема 8 махаллей)' : 'Mirzo Ulug‘bek tumani (8 ta mahalla sxemasi)'}
              </span>
              <div className="flex items-center gap-3 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {lang === 'ru' ? 'Норма' : 'Me’yor'}</span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {lang === 'ru' ? 'Внимание' : 'Diqqat'}</span>
                <span className="flex items-center gap-1.5 text-rose-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {lang === 'ru' ? 'Зона NEET' : 'NEET zonasi'}</span>
              </div>
            </div>
          )}

          {/* Map Display Box */}
          <div className="relative w-full h-[470px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
            
            {/* 1. Leaflet Interactive GIS Map */}
            {mapMode === 'leaflet_gis' && (
              <div ref={mapContainerRef} className="w-full h-full z-0" />
            )}

            {/* 2. Raster Image Scheme with Circular Trigger Rings */}
            {mapMode === 'raster_scheme' && (
              <div className="relative w-full h-full flex items-center justify-center p-2 bg-white overflow-hidden">
                <img
                  src={customMapUrl}
                  alt="Mirzo-Ulugbek District Painted Map"
                  className="w-full h-full object-contain select-none rounded-xl"
                />

                {MAKHALLAS_LIST.map((m) => {
                  const pin = MAP_CIRCLE_PINS[m.id] || { x: 50, y: 50, label: m.name, risk: 'low' };
                  const isSelected = m.id === selectedMahallaId;

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMahallaId(m.id);
                        setSelectedPoi(null);
                      }}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      aria-label={`Tanlash: ${m.name}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-2 focus:outline-none"
                      title={`Tanlash: ${m.name}`}
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

          </div>

          {/* Bottom Hint Banner */}
          <div className="flex items-center justify-between text-xs text-slate-400 z-10 font-medium pt-3 px-1">
            <span className="flex items-center gap-1.5">
              💡 {mapMode === 'leaflet_gis' 
                ? (lang === 'ru' ? 'Кликните по полигону махалли для зума и паспорта территории' : 'Mahalla pasportini ochish uchun xaritadagi hududini bosing') 
                : (lang === 'ru' ? 'Кликните по кружку махалли для открытия паспорта' : 'Pasportni ochish uchun mahalla doirachasini bosing')}
            </span>
            <span className="text-[11px] text-cyan-400/80">
              Toshkent • Mirzo Ulug‘bek
            </span>
          </div>

        </div>

        {/* Right: Territory Passport / POI Detail Inspector */}
        <div key={selectedMahallaId || selectedPoi?.id || 'default'} className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4 view-transition">
          
          {selectedPoi ? (
            /* Selected POI Center Card */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                      {lang === 'ru' ? 'Объект господдержки:' : 'Davlat ko‘mak obyekti:'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      POI
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {lang === 'ru' ? selectedPoi.name : selectedPoi.nameUz}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    📍 {selectedPoi.address}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPoi(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  {lang === 'ru' ? 'К махаллям' : 'Mahallalarga'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="text-xs text-purple-300 font-semibold">{lang === 'ru' ? 'Описание и возможности:' : 'Tavsif va imkoniyatlar:'}</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {lang === 'ru' ? selectedPoi.descriptionRu : selectedPoi.descriptionUz}
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-cyan-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedPoi.phone}</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 flex items-center justify-between">
                <div className="text-xs text-slate-300 font-medium">{lang === 'ru' ? 'Доступно направлений обучения:' : 'Mavjud o‘qitish yo‘nalishlari:'}</div>
                <div className="text-xl font-black text-cyan-400">{selectedPoi.servicesCount}</div>
              </div>
            </div>
          ) : (
            /* Selected Makhalla Passport */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">{lang === 'ru' ? 'Паспорт территории:' : 'Hudud pasporti:'}</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{lang === 'ru' ? `Махалля «${currentMahalla.name}»` : `«${getMahallaName(currentMahalla.name, lang)}» mahallasi`}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      currentMahalla.riskLevel === 'high' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : currentMahalla.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {currentMahalla.riskLevel === 'high' 
                        ? (lang === 'ru' ? '⚠️ Высокий риск NEET' : '⚠️ Yuqori NEET xavfi') 
                        : currentMahalla.riskLevel === 'medium' 
                        ? (lang === 'ru' ? '⚡ Умеренный риск' : '⚡ O‘rtacha xavf') 
                        : (lang === 'ru' ? '✓ Стабильная зона' : '✓ Barqaror hudud')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMakhalla(currentMahalla.name)}
                  className="px-4 py-2 bg-gov-600 hover:bg-gov-500 text-white text-xs font-bold rounded-xl transition-all shadow"
                >
                  {lang === 'ru' ? 'Выбрать' : 'Tanlash'}
                </button>
              </div>

              {/* Dynamic Real Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. Молодёжь в базе */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Молодёжь (в реестре)' : 'Yoshlar (reyestrda)'}</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {totalInCurrent} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 2. Занятость */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Уровень занятости' : 'Bandlik darajasi'}</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {dynamicEmploymentRate}%
                  </div>
                </div>

                {/* 3. Кандидаты NEET */}
                <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/30">
                  <div className="text-xs text-rose-300 font-medium">{lang === 'ru' ? 'Кандидаты NEET (проверка)' : 'NEET nomzodlari (ko‘rik)'}</div>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    {neetPendingInCurrent} <span className="text-xs text-rose-300 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 4. Господдержка */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70">
                  <div className="text-xs text-slate-400 font-medium">{lang === 'ru' ? 'Охвачено программами' : 'Dasturlarga qamrab olingan'}</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {supportedInCurrent} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

              </div>

              {/* Responsible Youth Leader */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ru' ? 'Ответственный «Ёшлар етакчиси» (Лидер молодёжи):' : 'Mas’ul «Yoshlar yetakchisi»:'}</span>
                </div>
                <div className="text-sm text-white font-bold">{currentMahalla.leaderName}</div>
                <a 
                  href={`tel:${currentMahalla.leaderPhone}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{currentMahalla.leaderPhone}</span>
                </a>
              </div>

              {/* Youth list in this mahalla */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">
                  {lang === 'ru' ? `Профили молодёжи в махалле (${totalInCurrent} чел.):` : `Mahalladagi yoshlar profillari (${totalInCurrent} nafar):`}
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {youthInCurrent.slice(0, 4).map(y => (
                    <div key={y.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-xs">
                      <span className="text-white font-semibold truncate max-w-[180px]">{y.full_name_demo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        y.is_neet ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {y.is_neet ? (lang === 'ru' ? 'NEET риск' : 'NEET xavfi') : y.employment_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Direct CTA button to filter registry */}
          <button
            onClick={() => {
              onSelectMakhalla(currentMahalla.name);
              onNavigateRegistry();
            }}
            className="w-full py-3 bg-gradient-to-r from-gov-600 to-cyan-600 hover:from-gov-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>{lang === 'ru' ? `Открыть реестр молодёжи махалли «${currentMahalla.name}»` : `«${getMahallaName(currentMahalla.name, lang)}» mahallasi yoshlar ro‘yxatini ochish`}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
