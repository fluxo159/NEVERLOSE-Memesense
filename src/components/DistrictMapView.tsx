import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Map as MapIcon, 
  Phone, 
  UserCheck, 
  Eye, 
  Building2, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Send, 
  Copy, 
  Check, 
  Navigation, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Compass, 
  MapPin, 
  Clock, 
  Globe, 
  Moon, 
  Satellite
} from 'lucide-react';
import L from 'leaflet';
import { MAKHALLAS_LIST, DISTRICT_POI_LIST } from '../data/mahallasData';
import { YouthProfile, InfrastructurePOI, MakhallaStats } from '../types';
import { getMahallaName } from '../data/translations';

interface DistrictMapViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  onSelectMakhalla: (makhalla: string) => void;
  lang: 'ru' | 'uz';
  onNavigateRegistry: () => void;
  onOpenProfile?: (youth: YouthProfile) => void;
}

type ActiveLayer = 'neet' | 'employment' | 'support' | 'density';
type BaseMapTheme = 'dark' | 'satellite' | 'streets';
type PoiCategoryFilter = 'all' | 'monocenter' | 'it_park' | 'employment_center' | 'youth_center' | 'employer' | 'university';

const DISTRICT_CENTER: [number, number] = [41.3385, 69.3450];

// Calculate Haversine distance in kilometers between two GPS coordinates
function calculateDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * (Math.PI / 180);
  const dLon = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * (Math.PI / 180)) *
      Math.cos(coord2[0] * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const DistrictMapView: React.FC<DistrictMapViewProps> = ({
  youthList,
  selectedMakhalla,
  onSelectMakhalla,
  lang,
  onNavigateRegistry,
  onOpenProfile
}) => {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('neet');
  const [baseMapTheme, setBaseMapTheme] = useState<BaseMapTheme>('dark');
  const [showPoi, setShowPoi] = useState<boolean>(true);
  const [poiCategoryFilter, setPoiCategoryFilter] = useState<PoiCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLeaderPhone, setCopiedLeaderPhone] = useState<boolean>(false);
  const [youthListFilter, setYouthListFilter] = useState<'all' | 'neet' | 'supported'>('all');

  // Resolve initial selected ID from global selectedMakhalla
  const initialMahalla = MAKHALLAS_LIST.find(m => m.name === selectedMakhalla) || MAKHALLAS_LIST[0];
  const [selectedMahallaId, setSelectedMahallaId] = useState<string>(initialMahalla.id);
  const [selectedPoi, setSelectedPoi] = useState<InfrastructurePOI | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const poiGroupRef = useRef<L.FeatureGroup | null>(null);
  const routeLineGroupRef = useRef<L.FeatureGroup | null>(null);

  // Persistent reference maps for Leaflet layers (Zero recreation during panning)
  const polygonsMapRef = useRef<Map<string, L.Polygon>>(new Map());
  const labelsMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Animation Timers Ref
  const cameraTimersRef = useRef<NodeJS.Timeout[]>([]);
  const isAnimatingRef = useRef<boolean>(false);

  // Clear all pending camera timeouts and abort listeners
  const clearCameraTimers = () => {
    cameraTimersRef.current.forEach(t => clearTimeout(t));
    cameraTimersRef.current = [];
    isAnimatingRef.current = false;
  };

  /**
   * Pre-load tiles along the animation corridor so there's zero white-flash during flight.
   * Triggers tile loading at both endpoints plus the midpoint to ensure full coverage.
   * Leaflet's keepBuffer=32 will hold them all in memory.
   */
  const preloadTilesForPath = useCallback((from: [number, number], to: [number, number]) => {
    if (!tileLayerRef.current) return;
    const tl = tileLayerRef.current as any;
    if (typeof tl._update !== 'function') return;

    // Pre-fetch tiles at the overview zoom level for source, midpoint, and destination
    const midLat = (from[0] + to[0]) / 2;
    const midLng = (from[1] + to[1]) / 2;

    try {
      tl._update(L.latLng(from[0], from[1]));
      tl._update(L.latLng(midLat, midLng));
      tl._update(L.latLng(to[0], to[1]));
    } catch (_) {
      // Silently ignore — this is a best-effort preload
    }
  }, []);

  /**
   * 🎬 3-PHASE CINEMATIC CAMERA CONTROLLER:
   *
   * NEARBY Mahallas (≤ 1.5 km): Simple smooth direct pan — no zoom change.
   *
   * DISTANT Mahallas (> 1.5 km):
   *   Phase 1 → Smoothly zoom OUT from current position to overview altitude (zoom 12.3)
   *             in one continuous fluid motion. Camera stays centered on current spot.
   *   Phase 2 → At the SAME altitude (12.3), smoothly PAN to center the target mahalla.
   *             One continuous fluid motion, no zoom change.
   *   Phase 3 → Single fluid DIVE directly to target mahalla zoom (14.5).
   *
   * All tiles along the flight path are pre-loaded before animation begins.
   */
  const smoothNavigateToMahalla = useCallback((targetCoords: [number, number], targetZoom = 14.5) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Abort any in-progress animation
    clearCameraTimers();
    map.stop(); // Stop any current flyTo mid-flight

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const fromCoords: [number, number] = [currentCenter.lat, currentCenter.lng];
    const distanceKm = calculateDistanceKm(fromCoords, targetCoords);

    isAnimatingRef.current = true;

    // ─── NEARBY / ADJACENT (≤ 1.5 km): Smooth direct pan ───
    if (distanceKm <= 1.5) {
      map.flyTo(targetCoords, targetZoom, {
        duration: 0.5,
        easeLinearity: 0.2,
        noMoveStart: true
      });
      const tEnd = setTimeout(() => { isAnimatingRef.current = false; }, 600);
      cameraTimersRef.current.push(tEnd);
      return;
    }

    // ─── DISTANT (> 1.5 km): 3-Phase Cinematic Flight ───

    // Pre-load tiles for the entire flight corridor
    preloadTilesForPath(fromCoords, targetCoords);

    const OVERVIEW_ZOOM = 12.3;
    const FINAL_ZOOM = targetZoom; // 14.5

    // Compute durations based on distance for natural feel
    const pullBackDuration = currentZoom > 13 ? 0.5 : 0.28; // Longer if zoomed in deep
    const panDuration = Math.min(0.65, 0.35 + distanceKm * 0.05); // Scale with distance
    const diveDuration = 0.45; // Single fluid dive in

    // ── Phase 1: Smooth zoom-out to overview altitude at current position ──
    map.flyTo(fromCoords, OVERVIEW_ZOOM, {
      duration: pullBackDuration,
      easeLinearity: 0.15
    });

    // Chain Phase 2 after Phase 1 completes
    const tPhase2 = setTimeout(() => {
      if (!isAnimatingRef.current || !mapInstanceRef.current) return;

      // ── Phase 2: Pan to target at same overview altitude (no zoom change) ──
      map.flyTo(targetCoords, OVERVIEW_ZOOM, {
        duration: panDuration,
        easeLinearity: 0.15
      });

      // Chain Phase 3 after Phase 2 completes
      const tPhase3 = setTimeout(() => {
        if (!isAnimatingRef.current || !mapInstanceRef.current) return;

        // ── Phase 3: Single fluid dive to final zoom ──
        map.flyTo(targetCoords, FINAL_ZOOM, {
          duration: diveDuration,
          easeLinearity: 0.2
        });

        const tDone = setTimeout(() => { isAnimatingRef.current = false; }, diveDuration * 1000 + 100);
        cameraTimersRef.current.push(tDone);

      }, panDuration * 1000 + 40);
      cameraTimersRef.current.push(tPhase3);

    }, pullBackDuration * 1000 + 40);
    cameraTimersRef.current.push(tPhase2);

  }, [preloadTilesForPath]);

  // Synchronize when global selectedMakhalla prop changes
  useEffect(() => {
    if (selectedMakhalla && selectedMakhalla !== 'all') {
      const match = MAKHALLAS_LIST.find(m => m.name === selectedMakhalla);
      if (match && match.id !== selectedMahallaId) {
        setSelectedMahallaId(match.id);
        setSelectedPoi(null);
        smoothNavigateToMahalla(match.geoCenter);
      }
    } else if (selectedMakhalla === 'all') {
      if (mapInstanceRef.current) {
        clearCameraTimers();
        mapInstanceRef.current.flyTo(DISTRICT_CENTER, 13, { duration: 0.45 });
      }
    }
  }, [selectedMakhalla, smoothNavigateToMahalla, selectedMahallaId]);

  const currentMahalla: MakhallaStats = MAKHALLAS_LIST.find(m => m.id === selectedMahallaId) || MAKHALLAS_LIST[0];

  // Dynamic statistics from youthList scoped to current mahalla
  const youthInCurrent = youthList.filter(y => y.makhalla === currentMahalla.name);
  const totalInCurrent = youthInCurrent.length;
  const employedInCurrent = youthInCurrent.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studyingInCurrent = youthInCurrent.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const neetPendingInCurrent = youthInCurrent.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const neetTotalInCurrent = youthInCurrent.filter(y => y.is_neet).length;
  const supportedInCurrent = youthInCurrent.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const dynamicEmploymentRate = totalInCurrent > 0 
    ? Math.round(((employedInCurrent + studyingInCurrent) / totalInCurrent) * 100) 
    : 0;

  // NEET Risk Index (0 - 100)
  const neetRiskScore = totalInCurrent > 0
    ? Math.min(100, Math.round((neetTotalInCurrent / totalInCurrent) * 100 * 2.5))
    : 15;

  // District-wide aggregate statistics
  const totalDistrict = youthList.length;
  const employedDistrict = youthList.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studyingDistrict = youthList.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const neetPendingDistrict = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;
  const supportedDistrict = youthList.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;

  const districtEmploymentRate = totalDistrict > 0 
    ? Math.round(((employedDistrict + studyingDistrict) / totalDistrict) * 100) 
    : 0;

  // Filtered Youth inside current mahalla passport
  const displayedYouth = useMemo(() => {
    return youthInCurrent.filter(y => {
      if (youthListFilter === 'neet') return y.is_neet;
      if (youthListFilter === 'supported') return y.assigned_program || y.employment_status === 'направлен на обучение';
      return true;
    });
  }, [youthInCurrent, youthListFilter]);

  // Nearest infrastructure distances from current selected mahalla
  const nearestPOIs = useMemo(() => {
    return DISTRICT_POI_LIST.map(poi => {
      const dist = calculateDistanceKm(currentMahalla.geoCenter, poi.coordinates);
      const walkTimeMin = Math.round(dist * 13);
      return {
        ...poi,
        distanceKm: dist,
        walkTimeMin
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [currentMahalla]);

  // 1. Initialize Map ONCE with preloading and buffer cache
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: DISTRICT_CENTER,
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: false
    });

    mapInstanceRef.current = map;

    // Tile Layer with high buffer capacity
    const tileUrl = baseMapTheme === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : baseMapTheme === 'streets'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
      keepBuffer: 32, // Very generous tile memory cache — prevents white flashes
      updateWhenIdle: false, // Continuous tile rendering during flight
      updateWhenZooming: true, // Keep tiles updating during zoom transitions
      updateInterval: 30 // More responsive tile fetching
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Feature groups
    const polyGroup = L.featureGroup().addTo(map);
    const poiGroup = L.featureGroup().addTo(map);
    const routeGroup = L.featureGroup().addTo(map);

    polygonsGroupRef.current = polyGroup;
    poiGroupRef.current = poiGroup;
    routeLineGroupRef.current = routeGroup;

    // Create and attach all 8 Polygons & Labels ONCE
    MAKHALLAS_LIST.forEach(mahalla => {
      const polygon = L.polygon(mahalla.geoPolygon, {
        color: '#34d399',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.26,
        dashArray: '3, 4'
      });

      polygon.bindTooltip('', {
        className: 'leaflet-tooltip-dark',
        sticky: false,
        direction: 'top',
        opacity: 0.98
      });

      // Interactive Click with Smart Camera Transition
      polygon.on('click', () => {
        setSelectedMahallaId(mahalla.id);
        setSelectedPoi(null);
        onSelectMakhalla(mahalla.name);
        smoothNavigateToMahalla(mahalla.geoCenter);
      });

      // Controlled Hover
      polygon.on('mouseover', function (this: L.Polygon, e: L.LeafletMouseEvent) {
        this.setStyle({
          fillOpacity: 0.75,
          weight: 3.5,
          color: '#ffffff'
        });
        this.openTooltip(e.latlng);
      });

      polygon.on('mouseout', function (this: L.Polygon) {
        this.closeTooltip();
      });

      polygon.addTo(polyGroup);
      polygonsMapRef.current.set(mahalla.id, polygon);

      // Center Label Marker
      const labelMarker = L.marker(mahalla.geoCenter, {
        icon: L.divIcon({
          className: 'custom-mahalla-label',
          html: '<div></div>',
          iconSize: [0, 0]
        }),
        interactive: false
      }).addTo(polyGroup);

      labelsMapRef.current.set(mahalla.id, labelMarker);
    });

    return () => {
      clearCameraTimers();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [smoothNavigateToMahalla]);

  // 2. Update Tile Layer Theme without recreating map
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl = baseMapTheme === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : baseMapTheme === 'streets'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [baseMapTheme]);

  // 3. Fast Polygon & Label Style Synchronization (Never destroys DOM elements)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    MAKHALLAS_LIST.forEach(mahalla => {
      const polygon = polygonsMapRef.current.get(mahalla.id);
      const labelMarker = labelsMapRef.current.get(mahalla.id);
      if (!polygon || !labelMarker) return;

      const isSelected = mahalla.id === selectedMahallaId;
      const mahallaYouth = youthList.filter(y => y.makhalla === mahalla.name);
      const neetCount = mahallaYouth.filter(y => y.is_neet).length;
      const totalYouthInM = mahallaYouth.length;
      const empCount = mahallaYouth.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель' || y.employment_status === 'обучается').length;
      const empRate = totalYouthInM > 0 ? Math.round((empCount / totalYouthInM) * 100) : 85;
      const supCount = mahallaYouth.filter(y => y.assigned_program || y.employment_status === 'направлен на обучение').length;
      const supRate = totalYouthInM > 0 ? Math.round((supCount / totalYouthInM) * 100) : 0;

      // Color computation based on active layer
      let fillColor = '#10b981';
      let strokeColor = '#34d399';
      let badgeText = '';

      if (activeLayer === 'neet') {
        if (mahalla.riskLevel === 'high' || neetCount >= 4) {
          fillColor = '#f43f5e';
          strokeColor = '#fb7185';
          badgeText = `NEET: ${neetCount}`;
        } else if (mahalla.riskLevel === 'medium' || neetCount >= 2) {
          fillColor = '#f59e0b';
          strokeColor = '#fbbf24';
          badgeText = `NEET: ${neetCount}`;
        } else {
          fillColor = '#10b981';
          strokeColor = '#34d399';
          badgeText = `NEET: ${neetCount}`;
        }
      } else if (activeLayer === 'employment') {
        if (empRate >= 90) {
          fillColor = '#06b6d4';
          strokeColor = '#38bdf8';
          badgeText = `${empRate}%`;
        } else if (empRate >= 80) {
          fillColor = '#10b981';
          strokeColor = '#4ade80';
          badgeText = `${empRate}%`;
        } else {
          fillColor = '#f97316';
          strokeColor = '#fb923c';
          badgeText = `${empRate}%`;
        }
      } else if (activeLayer === 'support') {
        fillColor = supRate >= 20 ? '#8b5cf6' : supRate >= 10 ? '#6366f1' : '#64748b';
        strokeColor = supRate >= 20 ? '#a78bfa' : supRate >= 10 ? '#818cf8' : '#94a3b8';
        badgeText = `${supCount} чел.`;
      } else if (activeLayer === 'density') {
        fillColor = totalYouthInM >= 16 ? '#3b82f6' : totalYouthInM >= 12 ? '#0284c7' : '#0ea5e9';
        strokeColor = '#60a5fa';
        badgeText = `${totalYouthInM} чел.`;
      }

      // Smooth in-place style mutation
      polygon.setStyle({
        color: isSelected ? '#38bdf8' : strokeColor,
        weight: isSelected ? 3.5 : 1.5,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.60 : 0.26,
        dashArray: isSelected ? undefined : '3, 4'
      });

      // Update Mouseout handler
      polygon.off('mouseout');
      polygon.on('mouseout', () => {
        polygon.closeTooltip();
        polygon.setStyle({
          color: isSelected ? '#38bdf8' : strokeColor,
          weight: isSelected ? 3.5 : 1.5,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.60 : 0.26,
          dashArray: isSelected ? undefined : '3, 4'
        });
      });

      // Update Tooltip content
      const mahallaDisplayName = getMahallaName(mahalla.name, lang);
      const tooltipContent = `
        <div style="font-family: inherit; padding: 2px 4px; pointer-events: none;">
          <div style="font-weight: 800; font-size: 12px; color: #38bdf8; margin-bottom: 2px;">
            ${lang === 'ru' ? `Махалля «${mahalla.name}»` : `«${mahallaDisplayName}» mahallasi`}
          </div>
          <div style="font-size: 11px; color: #cbd5e1; display: flex; flex-direction: column; gap: 1px;">
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              <span>${lang === 'ru' ? 'В реестре' : 'Reyestrda'}:</span>
              <b style="color: #ffffff;">${totalYouthInM} ${lang === 'ru' ? 'чел.' : 'nafar'}</b>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              <span>NEET статус:</span>
              <b style="color: ${neetCount > 0 ? '#f43f5e' : '#10b981'};">${neetCount} ${lang === 'ru' ? 'чел.' : 'nafar'}</b>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              <span>${lang === 'ru' ? 'Занятость' : 'Bandlik'}:</span>
              <b style="color: #38bdf8;">${empRate}%</b>
            </div>
          </div>
        </div>
      `;
      polygon.setTooltipContent(tooltipContent);

      // Update Center Label HTML in place
      const labelIconHtml = `
        <div style="
          transform: translate(-50%, -50%);
          background: ${isSelected ? 'rgba(14, 165, 233, 0.95)' : 'rgba(15, 23, 42, 0.92)'};
          border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.18)'};
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
          gap: 5px;
        ">
          <span style="width: 6px; height: 6px; border-radius: 9999px; background: ${fillColor}; flex-shrink: 0;"></span>
          <span>${mahallaDisplayName}</span>
          <span style="
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 4px;
            background: rgba(255,255,255,0.12);
            font-family: monospace;
            font-weight: 600;
          ">${badgeText}</span>
        </div>
      `;

      labelMarker.setIcon(L.divIcon({
        className: 'custom-mahalla-label',
        html: labelIconHtml,
        iconSize: [0, 0]
      }));
    });

  }, [activeLayer, selectedMahallaId, youthList, lang]);

  // 4. Update POI Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !poiGroupRef.current) return;

    const poiGroup = poiGroupRef.current;
    poiGroup.clearLayers();

    if (!showPoi) return;

    const filteredPOIs = DISTRICT_POI_LIST.filter(poi => {
      if (poiCategoryFilter === 'all') return true;
      return poi.category === poiCategoryFilter;
    });

    filteredPOIs.forEach(poi => {
      let iconColor = '#06b6d4';
      let symbolLetter = 'P';

      if (poi.category === 'monocenter') {
        iconColor = '#10b981';
        symbolLetter = 'M';
      } else if (poi.category === 'it_park') {
        iconColor = '#8b5cf6';
        symbolLetter = 'IT';
      } else if (poi.category === 'employment_center') {
        iconColor = '#f59e0b';
        symbolLetter = 'CZ';
      } else if (poi.category === 'youth_center') {
        iconColor = '#ec4899';
        symbolLetter = 'Y';
      } else if (poi.category === 'university') {
        iconColor = '#3b82f6';
        symbolLetter = 'U';
      } else if (poi.category === 'employer') {
        iconColor = '#eab308';
        symbolLetter = 'E';
      }

      const isPoiSelected = selectedPoi?.id === poi.id;

      const customPoiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            width: ${isPoiSelected ? '34px' : '28px'};
            height: ${isPoiSelected ? '34px' : '28px'};
            border-radius: 50%;
            background: #0f172a;
            border: 2px solid ${iconColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isPoiSelected ? '12px' : '10px'};
            font-weight: 800;
            color: ${iconColor};
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: monospace;
          ">
            ${symbolLetter}
          </div>
        `,
        iconSize: [28, 28]
      });

      const marker = L.marker(poi.coordinates, { icon: customPoiIcon });

      const poiTitle = lang === 'uz' ? poi.nameUz : poi.name;
      marker.bindTooltip(`
        <div style="font-family: inherit; padding: 2px 4px; pointer-events: none;">
          <div style="font-weight: 700; color: #ffffff;">${poiTitle}</div>
          <div style="font-size: 10px; color: #94a3b8;">${poi.address}</div>
        </div>
      `, {
        className: 'leaflet-tooltip-dark',
        direction: 'top',
        sticky: false
      });

      marker.on('click', () => {
        setSelectedPoi(poi);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(poi.coordinates, 15, { duration: 0.45 });
        }
      });

      marker.addTo(poiGroup);
    });
  }, [showPoi, poiCategoryFilter, selectedPoi, lang]);

  // 5. Draw Dynamic Route Line from Selected Mahalla to Selected POI
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLineGroupRef.current) return;
    const routeGroup = routeLineGroupRef.current;
    routeGroup.clearLayers();

    if (selectedPoi && currentMahalla) {
      const latlngs: [number, number][] = [
        currentMahalla.geoCenter,
        selectedPoi.coordinates
      ];

      const line = L.polyline(latlngs, {
        color: '#38bdf8',
        weight: 2,
        dashArray: '5, 5',
        opacity: 0.8
      });

      line.addTo(routeGroup);

      const distance = calculateDistanceKm(currentMahalla.geoCenter, selectedPoi.coordinates);
      const midpoint: [number, number] = [
        (currentMahalla.geoCenter[0] + selectedPoi.coordinates[0]) / 2,
        (currentMahalla.geoCenter[1] + selectedPoi.coordinates[1]) / 2
      ];

      const distLabelIcon = L.divIcon({
        className: 'route-dist-label',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            background: rgba(14, 165, 233, 0.95);
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            font-family: monospace;
            pointer-events: none;
          ">
            ${distance} км
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker(midpoint, { icon: distLabelIcon, interactive: false }).addTo(routeGroup);
    }
  }, [selectedPoi, currentMahalla]);

  const handleResetMapPosition = () => {
    setSelectedPoi(null);
    clearCameraTimers();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(DISTRICT_CENTER, 13, { duration: 0.45 });
    }
    onSelectMakhalla('all');
  };

  const handleSelectMahallaQuick = (mahalla: MakhallaStats) => {
    setSelectedMahallaId(mahalla.id);
    setSelectedPoi(null);
    onSelectMakhalla(mahalla.name);
    smoothNavigateToMahalla(mahalla.geoCenter);
  };

  const handleCopyLeaderPhone = (phoneStr: string) => {
    navigator.clipboard.writeText(phoneStr);
    setCopiedLeaderPhone(true);
    setTimeout(() => setCopiedLeaderPhone(false), 2000);
  };

  // Search Results for Mahallas and POIs
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const mahallas = MAKHALLAS_LIST.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.nameUz && m.nameUz.toLowerCase().includes(q)) ||
      m.leaderName.toLowerCase().includes(q)
    );
    const pois = DISTRICT_POI_LIST.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.nameUz.toLowerCase().includes(q) || 
      p.address.toLowerCase().includes(q)
    );
    return { mahallas, pois };
  }, [searchQuery]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER & QUICK JUMP MAHALLA STRIP */}
      <div className="bg-surface-1 p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-surface-card space-y-3.5">
        
        {/* Title + Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-surface-2 text-slate-300 border border-white/[0.08] flex-shrink-0">
                <MapIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'ru' 
                    ? 'Интерактивная ГИС-карта махаллей (Мирзо-Улугбекский район)' 
                    : 'Mirzo Ulug‘bek tumani interaktiv GIS xaritasi'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-surface-3 text-slate-300 border border-white/[0.08] rounded-md tracking-wider font-mono whitespace-nowrap">
                  GIS v2.0
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-3 text-slate-300 border border-white/[0.08] text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Smart Cam
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {lang === 'ru'
                ? 'Геоинформационный мониторинг распределения молодёжи, тепловых зон риска NEET, центров занятости и точек карьерного роста.'
                : 'Yoshlar taqsimoti, NEET xavf zonalari, bandlik markazlari va kasbiy o‘sish obyektlarining geoaaxborot monitoringi.'}
            </p>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск махалли или центра...' : 'Mahalla yoki markaz qidiruvi...'}
                className="w-full bg-surface-2 border border-white/[0.08] focus:border-indigo-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Mahalla Selector Strip (8 Mahallas) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          <button
            onClick={handleResetMapPosition}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 flex-shrink-0 ${
              selectedMakhalla === 'all'
                ? 'bg-surface-3 text-white border-indigo-500/40 shadow-sm'
                : 'bg-surface-2 text-slate-300 border-white/[0.06] hover:bg-surface-3 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Все 8 махаллей' : 'Barcha 8 ta mahalla'}</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-1 text-[10px] font-mono text-slate-400">100</span>
          </button>

          {MAKHALLAS_LIST.map(m => {
            const isSelected = selectedMakhalla === m.name || (selectedMakhalla !== 'all' && currentMahalla.id === m.id);
            const mCount = youthList.filter(y => y.makhalla === m.name).length;
            const mNeetCount = youthList.filter(y => y.makhalla === m.name && y.is_neet).length;

            return (
              <button
                key={m.id}
                onClick={() => handleSelectMahallaQuick(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-surface-3 text-white border-white/[0.18] shadow-sm'
                    : 'bg-surface-2/80 text-slate-300 border-white/[0.06] hover:bg-surface-3 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  m.riskLevel === 'high' 
                    ? 'bg-rose-400' 
                    : m.riskLevel === 'medium' 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
                }`}></span>
                <span>{lang === 'ru' ? m.name : m.nameUz}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {mCount} {mNeetCount > 0 && <span className="text-slate-300 font-medium">({mNeetCount})</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Results Dropdown overlay if search has matches */}
        {searchResults && (
          <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.12] space-y-2 animate-in fade-in duration-150">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'ru' ? 'Результаты поиска:' : 'Qidiruv natijalari:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {searchResults.mahallas.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    handleSelectMahallaQuick(m);
                    setSearchQuery('');
                  }}
                  className="p-2 bg-surface-1 hover:bg-surface-3 border border-white/[0.06] rounded-lg text-left text-xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">{m.name}</div>
                    <div className="text-[10px] text-slate-400">Лидер: {m.leaderName}</div>
                  </div>
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              ))}

              {searchResults.pois.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPoi(p);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo(p.coordinates, 15, { duration: 0.45 });
                    }
                    setSearchQuery('');
                  }}
                  className="p-2 bg-surface-1 hover:bg-surface-3 border border-white/[0.08] rounded-lg text-left text-xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-slate-200 font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.address}</div>
                  </div>
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 2. MAIN MAP & ANALYTICAL PASSPORT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Map View Container */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between shadow-surface-card min-h-[620px] space-y-3">
          
          {/* Map Toolbar (Layers, Basemap Theme, POI Toggles) */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10">
            
            {/* Layer Mode Selector */}
            <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.08] text-xs">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
                {lang === 'ru' ? 'Слой:' : 'Qatlam:'}
              </span>
              
              <button
                onClick={() => setActiveLayer('neet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeLayer === 'neet'
                    ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>{lang === 'ru' ? 'NEET Риск' : 'NEET xavfi'}</span>
              </button>

              <button
                onClick={() => setActiveLayer('employment')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeLayer === 'employment'
                    ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'ru' ? 'Занятость %' : 'Bandlik %'}</span>
              </button>

              <button
                onClick={() => setActiveLayer('support')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeLayer === 'support'
                    ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>{lang === 'ru' ? 'Поддержка %' : 'Qo‘llab-quvvatlash'}</span>
              </button>
            </div>

            {/* Basemap Switcher & POI Toggle */}
            <div className="flex items-center gap-1.5">
              
              {/* Basemap Theme Toggle */}
              <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setBaseMapTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    baseMapTheme === 'dark'
                      ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ru' ? 'Темная' : 'Qorong‘i'}</span>
                </button>
                <button
                  onClick={() => setBaseMapTheme('satellite')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    baseMapTheme === 'satellite'
                      ? 'bg-surface-3 text-white border border-white/[0.14] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Satellite View"
                >
                  <Satellite className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ru' ? 'Спутник' : 'Sun’iy yo‘ldosh'}</span>
                </button>
              </div>

              {/* POI Toggle Button */}
              <button
                onClick={() => setShowPoi(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showPoi
                    ? 'bg-surface-3 text-slate-200 border-white/[0.14] shadow-sm'
                    : 'bg-surface-2/60 text-slate-400 border-white/[0.06]'
                }`}
                title={lang === 'ru' ? 'Переключить объекты инфраструктуры' : 'Infratuzilma obyektlarini ko‘rsatish'}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>POI</span>
              </button>

            </div>

          </div>

          {/* POI Sub-category Chips */}
          {showPoi && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                onClick={() => setPoiCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                  poiCategoryFilter === 'all'
                    ? 'bg-surface-3 text-white border-white/[0.14]'
                    : 'bg-surface-2 text-slate-400 border-white/[0.06] hover:text-slate-200'
                }`}
              >
                {lang === 'ru' ? 'Все объекты (6)' : 'Barcha obyektlar (6)'}
              </button>
              <button
                onClick={() => setPoiCategoryFilter('monocenter')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                  poiCategoryFilter === 'monocenter'
                    ? 'bg-surface-3 text-white border-white/[0.14]'
                    : 'bg-surface-2 text-slate-400 border-white/[0.06] hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ru' ? 'Моноцентр' : 'Monomarkaz'}</span>
              </button>
              <button
                onClick={() => setPoiCategoryFilter('it_park')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                  poiCategoryFilter === 'it_park'
                    ? 'bg-surface-3 text-white border-white/[0.14]'
                    : 'bg-surface-2 text-slate-400 border-white/[0.06] hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>IT-Park</span>
              </button>
              <button
                onClick={() => setPoiCategoryFilter('employment_center')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                  poiCategoryFilter === 'employment_center'
                    ? 'bg-surface-3 text-white border-white/[0.14]'
                    : 'bg-surface-2 text-slate-400 border-white/[0.06] hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ru' ? 'Центр занятости (ЦЗН)' : 'ABKM'}</span>
              </button>
              <button
                onClick={() => setPoiCategoryFilter('employer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                  poiCategoryFilter === 'employer'
                    ? 'bg-surface-3 text-white border-white/[0.14]'
                    : 'bg-surface-2 text-slate-400 border-white/[0.06] hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>{lang === 'ru' ? 'Работодатели' : 'Ish beruvchilar'}</span>
              </button>
            </div>
          )}

          {/* Leaflet Map Box with Floating "Центр" Button inside top-right */}
          <div className="relative w-full h-[470px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Center / Reset Button inside Map (Top Right) */}
            <button
              onClick={handleResetMapPosition}
              className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-xl bg-surface-1/90 hover:bg-surface-1 text-slate-200 hover:text-white border border-white/[0.14] hover:border-white/[0.24] text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
              title={lang === 'ru' ? 'Сбросить масштаб к центру района' : 'Tuman markaziga qaytarish'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Центр района' : 'Tuman markazi'}</span>
            </button>
          </div>

          {/* Dynamic Map Status Bar & Legend matching Active Layer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 z-10 font-medium pt-1 px-1 gap-2">
            
            {/* Dynamic Legend based on activeLayer */}
            {activeLayer === 'neet' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{lang === 'ru' ? 'Высокий риск (≥4)' : 'Yuqori xavf'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>{lang === 'ru' ? 'Умеренный (2–3)' : 'O‘rtacha'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{lang === 'ru' ? 'Стабильная зона' : 'Barqaror'}</span>
                </span>
              </div>
            ) : activeLayer === 'employment' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>{lang === 'ru' ? 'Высокая (≥90%)' : 'Yuqori (≥90%)'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{lang === 'ru' ? 'Средняя (80–89%)' : 'O‘rtacha (80–89%)'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>{lang === 'ru' ? 'Низкая (<80%)' : 'Past (<80%)'}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>{lang === 'ru' ? 'Высокий охват (≥20%)' : 'Yuqori (≥20%)'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>{lang === 'ru' ? 'Средний (10–19%)' : 'O‘rtacha (10–19%)'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span>{lang === 'ru' ? 'Начальный (<10%)' : 'Boshlang‘ich'}</span>
                </span>
              </div>
            )}

            <span className="text-[11px] text-slate-500 font-mono">
              Mirzo Ulug‘bek • 8 СГМ • 100 профилей
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: Territory Passport / POI Detail Inspector */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card flex flex-col justify-between space-y-4">
          
          {selectedPoi ? (
            /* SELECTED POI DETAIL CARD */
            <div key={selectedPoi.id} className="space-y-4 animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-300">
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      {lang === 'ru' ? 'Объект господдержки:' : 'Davlat ko‘mak obyekti:'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-2 text-slate-300 border border-white/[0.08] font-mono">
                      {selectedPoi.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    {lang === 'ru' ? selectedPoi.name : selectedPoi.nameUz}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>{selectedPoi.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPoi(null)}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/[0.08] transition-all flex-shrink-0"
                >
                  {lang === 'ru' ? 'К махаллям' : 'Mahallalarga'}
                </button>
              </div>

              {/* Description & Perks */}
              <div className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] space-y-2">
                <div className="text-xs text-slate-300 font-semibold">{lang === 'ru' ? 'Описание и возможности:' : 'Tavsif va imkoniyatlar:'}</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'ru' ? selectedPoi.descriptionRu : selectedPoi.descriptionUz}
                </p>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${selectedPoi.phone}`} className="hover:text-indigo-300 transition-colors">
                      {selectedPoi.phone}
                    </a>
                  </div>
                  {selectedPoi.workHours && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedPoi.workHours}</span>
                    </div>
                  )}
                </div>

                {selectedPoi.website && (
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Официальный ресурс:</span>
                    <a 
                      href={selectedPoi.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
                    >
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{selectedPoi.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                )}
              </div>

              {/* Distance from current Mahalla */}
              <div className="bg-surface-2 p-3.5 rounded-xl border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    {lang === 'ru' ? `Расстояние от махалли «${currentMahalla.name}»:` : `«${currentMahalla.nameUz}» mahallasidan masofa:`}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    ~{Math.round(calculateDistanceKm(currentMahalla.geoCenter, selectedPoi.coordinates) * 13)} мин пешком
                  </div>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {calculateDistanceKm(currentMahalla.geoCenter, selectedPoi.coordinates)} км
                </div>
              </div>

              {/* Services count */}
              <div className="bg-surface-2 p-3.5 rounded-xl border border-white/[0.08] flex items-center justify-between">
                <div className="text-xs text-slate-300 font-medium">
                  {lang === 'ru' ? 'Доступно направлений обучения / квот:' : 'Mavjud o‘qitish yo‘nalishlari:'}
                </div>
                <div className="text-xl font-bold text-white font-mono">{selectedPoi.servicesCount}</div>
              </div>
            </div>
          ) : selectedMakhalla === 'all' ? (
            /* DISTRICT-WIDE SUMMARY PASSPORT (8 MAKHALLAS) */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {lang === 'ru' ? 'Сводный паспорт территории:' : 'Hudud umumiy pasporti:'}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {lang === 'ru' ? 'Мирзо-Улугбекский район' : 'Mirzo Ulug‘bek tumani'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 text-slate-300 border border-white/[0.08] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>{lang === 'ru' ? '8 махаллей на контроле' : '8 ta mahalla nazoratda'}</span>
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 text-slate-300 border border-white/[0.08] text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ru' ? 'Весь район' : 'Butun tuman'}</span>
                </span>
              </div>

              {/* Dynamic District Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Молодёжь в базе */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Всего в реестре' : 'Jami reyestrda'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {totalDistrict} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 2. Занятость */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Средняя занятость' : 'O‘rtacha bandlik'}</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {districtEmploymentRate}%
                  </div>
                </div>

                {/* 3. Кандидаты NEET */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Кандидаты NEET (район)' : 'NEET nomzodlari (tuman)'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {neetPendingDistrict} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 4. Господдержка */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Охвачено программами' : 'Dasturlarga qamrab olingan'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {supportedDistrict} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>
              </div>

              {/* Responsible District Coordinator */}
              <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ru' ? 'Координатор молодёжной политики района:' : 'Tuman yoshlar siyosati koordinatori:'}</span>
                </div>
                <div className="text-xs text-white font-bold">Алимов Дониёр Бахтиёрович (Хокимият)</div>
                <div className="flex items-center justify-between pt-1">
                  <a 
                    href="tel:+998712680010"
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>+998 (71) 268-00-10</span>
                  </a>
                  <span className="text-[10px] text-slate-400">ул. Мустакиллик, 105</span>
                </div>
              </div>

              {/* 8 Makhallas breakdown */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{lang === 'ru' ? 'Махалли района (выберите для зума):' : 'Tuman mahallalari (kattalashtirish):'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">8 / 8</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {MAKHALLAS_LIST.map(m => {
                    const mCount = youthList.filter(y => y.makhalla === m.name).length;
                    const mNeet = youthList.filter(y => y.makhalla === m.name && y.is_neet).length;

                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMahallaQuick(m)}
                        className="w-full p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/[0.06] hover:border-white/[0.14] flex items-center justify-between text-xs transition-all text-left group"
                      >
                        <span className="text-white font-medium truncate max-w-[160px] text-xs group-hover:text-slate-200">
                          {lang === 'ru' ? m.name : m.nameUz}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {mNeet > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-3 text-slate-300 border border-white/[0.08] text-[10px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              NEET: {mNeet}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-3 text-slate-300 border border-white/[0.08] text-[10px] font-medium whitespace-nowrap">
                            <span className={`w-1.5 h-1.5 rounded-full ${m.riskLevel === 'high' ? 'bg-rose-400' : m.riskLevel === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                            <span>{mCount} {lang === 'ru' ? 'чел.' : 'nafar'}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* SELECTED MAKHALA PASSPORT */
            <div key={currentMahalla.id} className="space-y-4 animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-300">
              
              {/* Mahalla Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {lang === 'ru' ? 'Паспорт территории:' : 'Hudud pasporti:'}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {lang === 'ru' ? `Махалля «${currentMahalla.name}»` : `«${getMahallaName(currentMahalla.name, lang)}» mahallasi`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 text-slate-300 border border-white/[0.08] text-xs font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        currentMahalla.riskLevel === 'high' 
                          ? 'bg-rose-400' 
                          : currentMahalla.riskLevel === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}></span>
                      <span>
                        {currentMahalla.riskLevel === 'high' 
                          ? (lang === 'ru' ? 'Высокий риск NEET' : 'Yuqori NEET xavfi') 
                          : currentMahalla.riskLevel === 'medium' 
                          ? (lang === 'ru' ? 'Умеренный риск' : 'O‘rtacha xavf') 
                          : (lang === 'ru' ? 'Стабильная зона' : 'Barqaror hudud')}
                      </span>
                    </span>

                    {currentMahalla.committeeAddress && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {currentMahalla.committeeAddress}
                      </span>
                    )}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 text-slate-300 border border-white/[0.08] text-xs font-semibold flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ru' ? 'В фокусе' : 'Fokusda'}</span>
                </span>
              </div>

              {/* Dynamic Real Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Молодёжь в базе */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Молодёжь (в реестре)' : 'Yoshlar (reyestrda)'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {totalInCurrent} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 2. Занятость */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Уровень занятости' : 'Bandlik darajasi'}</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {dynamicEmploymentRate}%
                  </div>
                </div>

                {/* 3. Кандидаты NEET */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Кандидаты NEET (проверка)' : 'NEET nomzodlari (ko‘rik)'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {neetPendingInCurrent} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>

                {/* 4. Господдержка */}
                <div className="bg-surface-2 p-3 rounded-xl border border-white/[0.08]">
                  <div className="text-[11px] text-slate-400 font-medium">{lang === 'ru' ? 'Охвачено программами' : 'Dasturlarga qamrab olingan'}</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {supportedInCurrent} <span className="text-xs text-slate-400 font-normal">{lang === 'ru' ? 'чел.' : 'nafar'}</span>
                  </div>
                </div>
              </div>

              {/* NEET Risk Index Meter */}
              <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span>{lang === 'ru' ? 'Индекс риска NEET:' : 'NEET xavf indeksi:'}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-300">
                    {neetRiskScore} / 100
                  </span>
                </div>
                <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      neetRiskScore > 50 ? 'bg-rose-400' : neetRiskScore > 25 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${neetRiskScore}%` }}
                  />
                </div>
              </div>

              {/* Responsible Youth Leader Card */}
              <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ru' ? 'Ответственный «Ёшлар етакчиси»:' : 'Mas’ul «Yoshlar yetakchisi»:'}</span>
                    </div>
                    <div className="text-xs text-white font-bold mt-0.5">{currentMahalla.leaderName}</div>
                  </div>

                  <button
                    onClick={() => handleCopyLeaderPhone(currentMahalla.leaderPhone)}
                    className="p-1.5 bg-surface-3 hover:bg-surface-1 rounded-lg text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
                    title={lang === 'ru' ? 'Скопировать номер телефона' : 'Telefon raqamini nusxalash'}
                  >
                    {copiedLeaderPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs">
                  <a 
                    href={`tel:${currentMahalla.leaderPhone}`}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{currentMahalla.leaderPhone}</span>
                  </a>

                  {currentMahalla.leaderTelegram && (
                    <a
                      href={`https://t.me/${currentMahalla.leaderTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <Send className="w-3 h-3 text-slate-400" />
                      <span>{currentMahalla.leaderTelegram}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Nearest Support Infrastructure Quick List */}
              <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>{lang === 'ru' ? 'Ближайшие центры господдержки:' : 'Yaqin davlat markazlari:'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Top-3</span>
                </div>

                <div className="space-y-1">
                  {nearestPOIs.slice(0, 3).map(poi => (
                    <div 
                      key={poi.id}
                      onClick={() => {
                        setSelectedPoi(poi);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo(poi.coordinates, 15, { duration: 0.45 });
                        }
                      }}
                      className="p-1.5 bg-surface-1 hover:bg-surface-3 rounded-lg border border-white/[0.04] flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="truncate max-w-[200px]">
                        <span className="text-white font-medium text-xs">{poi.name}</span>
                      </div>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {poi.distanceKm} км
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Youth Profiles in this Mahalla (Clickable Dossiers) */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>{lang === 'ru' ? `Граждане в махалле (${totalInCurrent} чел.):` : `Mahalla yoshlari (${totalInCurrent}):`}</span>
                  
                  {/* Mini Filter Pills */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => setYouthListFilter('all')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${youthListFilter === 'all' ? 'bg-surface-3 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Все
                    </button>
                    <button
                      onClick={() => setYouthListFilter('neet')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${youthListFilter === 'neet' ? 'bg-surface-3 text-slate-200 font-bold' : 'text-slate-400'}`}
                    >
                      NEET
                    </button>
                    <button
                      onClick={() => setYouthListFilter('supported')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${youthListFilter === 'supported' ? 'bg-surface-3 text-slate-200 font-bold' : 'text-slate-400'}`}
                    >
                      Помощь
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {displayedYouth.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      {lang === 'ru' ? 'Нет профилей по данному фильтру' : 'Ushbu filtr bo‘yicha profillar yo‘q'}
                    </div>
                  ) : (
                    displayedYouth.map(y => (
                      <div 
                        key={y.id}
                        onClick={() => onOpenProfile && onOpenProfile(y)}
                        className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/[0.06] hover:border-white/[0.14] flex items-center justify-between text-xs cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="text-white font-medium text-xs group-hover:text-slate-200 transition-colors">
                            {y.full_name_demo}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {y.age} {lang === 'ru' ? 'лет' : 'yosh'} • {y.activity_type}
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-3 text-slate-300 border border-white/[0.08] text-[10px] font-medium whitespace-nowrap">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            y.is_neet 
                              ? 'bg-rose-400' 
                              : y.assigned_program 
                              ? 'bg-indigo-400'
                              : 'bg-emerald-400'
                          }`}></span>
                          <span>{y.is_neet ? 'NEET' : y.employment_status}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Direct CTA button to filter registry */}
          <button
            onClick={() => {
              if (selectedMakhalla !== 'all') {
                onSelectMakhalla(currentMahalla.name);
              }
              onNavigateRegistry();
            }}
            className="w-full py-2.5 bg-surface-2 hover:bg-surface-3 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-white/[0.08] hover:border-white/[0.16] shadow-sm flex items-center justify-center gap-2 transition-all group mt-2"
          >
            <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>
              {selectedMakhalla === 'all'
                ? (lang === 'ru' ? 'Открыть реестр молодёжи района (100 чел.)' : 'Butun tuman yoshlar ro‘yxatini ochish (100 nafar)')
                : (lang === 'ru' ? `Открыть реестр молодёжи махалли «${currentMahalla.name}»` : `«${getMahallaName(currentMahalla.name, lang)}» mahallasi yoshlar ro‘yxatini ochish`)}
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
