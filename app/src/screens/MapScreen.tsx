import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Mic,
  AlertTriangle,
  X,
  Compass,
  List,
  Map as MapIcon,
  Clock,
  Calendar,
  Volume2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Beneficiary, Visit, FollowUp } from '@asha/shared';
import { getBeneficiaries, getVisits, getFollowUps } from '../data/repository';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import {
  getLocalizedBeneficiaryName,
  getLocalizedVillageName,
} from '../i18n/localize';
import {
  calculateDistanceKm,
  computeNearestNeighbourRoute,
  getCurrentLocation,
  openNavigationApp,
  GeoLocationPoint,
  RouteStop,
} from '../utils/locationService';
import { VoicePipeline } from '../utils/audioPipeline';

export interface MapScreenProps {
  onStartVisit: (b: Beneficiary) => void;
}

interface MapBeneficiaryItem extends Beneficiary {
  pinColor: 'teal' | 'saffron' | 'danger' | 'grey';
  statusLabel: string;
  isDanger: boolean;
  dangerDetails?: string[];
  lastVisitDate?: string;
  nextDueDate?: string;
  distanceKm?: number;
}

// Leaflet Map center updater
const MapController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 15 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Generates Design-System-compliant custom map pins
function createPinIcon(
  color: 'teal' | 'saffron' | 'danger' | 'grey',
  stopNumber?: number
): L.DivIcon {
  const colorMap = {
    teal: '#0B4F4A',
    saffron: '#E8833A',
    danger: '#C0392B',
    grey: '#5B6B6A',
  };

  const hex = colorMap[color];
  const innerContent =
    stopNumber !== undefined
      ? `<span style="color: white; font-weight: 800; font-size: 13px; line-height: 1;">${stopNumber}</span>`
      : color === 'danger'
      ? `<span style="color: white; font-weight: 900; font-size: 11px;">⚠️</span>`
      : `<span style="color: white; font-weight: 700; font-size: 10px;">●</span>`;

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${hex};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${innerContent}
        </div>
      </div>
      <div style="
        width: 10px;
        height: 3px;
        background: rgba(0,0,0,0.25);
        border-radius: 50%;
        margin-top: 2px;
        filter: blur(1px);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// Current worker GPS pin
function createWorkerIcon(): L.DivIcon {
  const html = `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #136B64;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 4px rgba(19, 107, 100, 0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `;
  return L.divIcon({
    html,
    className: 'worker-location-pin',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export const MapScreen: React.FC<MapScreenProps> = ({ onStartVisit }) => {
  const { language, locationSharing, locationPrecision, showToast } = useAppStore();
  const t = getT(language);

  const uid = 'demo-asha-worker-01';

  // State
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [workerLocation, setWorkerLocation] = useState<GeoLocationPoint>({
    lat: 26.8450,
    lng: 80.9450,
    accuracy: 10,
  });

  const [selectedBeneficiary, setSelectedBeneficiary] = useState<MapBeneficiaryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'danger'>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showTodayRoute, setShowTodayRoute] = useState(false);

  // Map viewport center
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.8460, 80.9455]);
  const [mapZoom, setMapZoom] = useState<number>(15);

  // Voice Assistant on Map
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [spokenVoiceFeedback, setSpokenVoiceFeedback] = useState<string | null>(null);
  const pipelineRef = useRef<VoicePipeline | null>(null);

  // Load live data from Firestore / offline repository
  useEffect(() => {
    async function loadData() {
      try {
        const [bList, vList, fList] = await Promise.all([
          getBeneficiaries(uid),
          getVisits(uid),
          getFollowUps(uid),
        ]);
        setBeneficiaries(bList);
        setVisits(vList);
        setFollowups(fList);

        // Attempt live GPS capture if consented
        if (locationSharing) {
          const loc = await getCurrentLocation(locationPrecision);
          if (loc) {
            setWorkerLocation(loc);
            setMapCenter([loc.lat, loc.lng]);
          }
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      }
    }
    loadData();
  }, [locationSharing, locationPrecision]);

  // Compute enriched beneficiary list with statuses and coordinates
  const enrichedBeneficiaries: MapBeneficiaryItem[] = useMemo(() => {
    return beneficiaries.map((b) => {
      // Find beneficiary's visits
      const bVisits = visits.filter(
        (v) => v.beneficiary_code === b.code || v.beneficiary_id === b.id
      );
      const lastVisit = bVisits.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Find beneficiary's follow-ups
      const bFollowups = followups.filter(
        (f) => f.beneficiary_code === b.code || f.beneficiary_id === b.id
      );
      const pendingFollowups = bFollowups.filter((f) => f.status !== 'done');
      const dangerFollowup = pendingFollowups.find((f) => f.is_danger_referral);
      const overdueFollowup = pendingFollowups.find((f) => f.status === 'overdue');
      const todayFollowup = pendingFollowups.find((f) => f.due_date === '2026-11-16');

      let pinColor: 'teal' | 'saffron' | 'danger' | 'grey' = 'teal';
      let statusLabel = t.map.recentVisit;
      let isDanger = false;
      const dangerDetails: string[] = [];

      if (dangerFollowup) {
        pinColor = 'danger';
        statusLabel = t.map.referralPending;
        isDanger = true;
        dangerDetails.push('MoHFW Maternal Guidelines: High BP Referral Pending');
      } else if (overdueFollowup) {
        pinColor = 'saffron';
        statusLabel = t.map.overdueVaccine;
      } else if (todayFollowup) {
        pinColor = 'saffron';
        statusLabel = t.map.filterToday;
      } else if (lastVisit) {
        const daysSince = Math.floor(
          (new Date('2026-11-16').getTime() - new Date(lastVisit.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSince <= 7) {
          pinColor = 'teal';
          statusLabel = t.map.recentVisit;
        } else {
          pinColor = 'grey';
          statusLabel = t.map.upcomingVisit;
        }
      } else {
        pinColor = 'grey';
        statusLabel = t.map.upcomingVisit;
      }

      // Coordinates: if beneficiary has home_geo, use it; otherwise provide stable fallback
      const geo = b.home_geo || (b.village === 'Kishanpur'
        ? { lat: 26.8430, lng: 80.9415, accuracy: 15 }
        : { lat: 26.8467, lng: 80.9462, accuracy: 10 });

      // Straight-line distance from worker location
      const distanceKm = workerLocation
        ? calculateDistanceKm(workerLocation.lat, workerLocation.lng, geo.lat, geo.lng)
        : undefined;

      return {
        ...b,
        home_geo: geo,
        pinColor,
        statusLabel,
        isDanger,
        dangerDetails,
        lastVisitDate: lastVisit?.created_at?.slice(0, 10),
        nextDueDate: pendingFollowups[0]?.due_date,
        distanceKm,
      };
    });
  }, [beneficiaries, visits, followups, workerLocation, t]);

  // Set default selected pin if none
  useEffect(() => {
    if (!selectedBeneficiary && enrichedBeneficiaries.length > 0) {
      setSelectedBeneficiary(enrichedBeneficiaries[0]);
    }
  }, [enrichedBeneficiaries, selectedBeneficiary]);

  // Unique villages for picker
  const villages = useMemo(() => {
    const set = new Set(beneficiaries.map((b) => b.village).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [beneficiaries]);

  // Filtered pins
  const filteredBeneficiaries = useMemo(() => {
    return enrichedBeneficiaries.filter((b) => {
      // Village filter
      if (selectedVillage !== 'all' && b.village !== selectedVillage) {
        return false;
      }

      // Status chip filter
      if (filter === 'danger') return b.pinColor === 'danger';
      if (filter === 'overdue') return b.pinColor === 'saffron';
      if (filter === 'today') return b.pinColor === 'saffron' || b.pinColor === 'danger';
      return true;
    });
  }, [enrichedBeneficiaries, selectedVillage, filter]);

  // Today's Route computation using Nearest-Neighbour
  const todayDueBeneficiaries = useMemo(() => {
    return enrichedBeneficiaries.filter((b) => b.pinColor === 'saffron' || b.pinColor === 'danger');
  }, [enrichedBeneficiaries]);

  const routeStops: RouteStop<MapBeneficiaryItem>[] = useMemo(() => {
    if (!workerLocation) return [];
    return computeNearestNeighbourRoute(
      { lat: workerLocation.lat, lng: workerLocation.lng },
      todayDueBeneficiaries.map((b) => ({
        ...b,
        geo: b.home_geo,
      }))
    );
  }, [workerLocation, todayDueBeneficiaries]);

  // Map stop numbers to beneficiary code
  const stopNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    routeStops.forEach((stop) => {
      map.set(stop.item.code, stop.stopNumber);
    });
    return map;
  }, [routeStops]);

  // Polyline coordinates for today's route
  const routePolylineCoords: [number, number][] = useMemo(() => {
    if (!showTodayRoute || routeStops.length === 0) return [];
    const coords: [number, number][] = [[workerLocation.lat, workerLocation.lng]];
    routeStops.forEach((s) => {
      if (s.item.home_geo) {
        coords.push([s.item.home_geo.lat, s.item.home_geo.lng]);
      }
    });
    return coords;
  }, [showTodayRoute, routeStops, workerLocation]);

  // Voice Query Handling
  const handleVoiceQuerySubmit = (queryText: string) => {
    const clean = queryText.toLowerCase().trim();
    let spoken = '';

    // Query 1: "Agla ghar kaunsa hai?"
    if (
      clean.includes('agla') ||
      clean.includes('next') ||
      clean.includes('अगला') ||
      clean.includes('अடுத்த') ||
      clean.includes('తదుపరి')
    ) {
      if (routeStops.length > 0) {
        const firstStop = routeStops[0];
        setSelectedBeneficiary(firstStop.item);
        if (firstStop.item.home_geo) {
          setMapCenter([firstStop.item.home_geo.lat, firstStop.item.home_geo.lng]);
        }
        const stopName = getLocalizedBeneficiaryName(firstStop.item.code, firstStop.item.name, language);
        const stopVillage = getLocalizedVillageName(firstStop.item.village, language);

        if (language === 'hi') {
          spoken = `अगला घर ${stopVillage} में ${stopName} का है, लगभग ${Math.round(firstStop.distanceFromPreviousKm * 1000)} मीटर दूर।`;
        } else {
          spoken = `Next house is ${stopName} in ${stopVillage}, approximately ${Math.round(firstStop.distanceFromPreviousKm * 1000)} meters away.`;
        }
      } else {
        spoken = language === 'hi' ? 'आज कोई लंबित रूट नहीं है।' : 'No pending route stops today.';
      }
    }
    // Query 2: "Meena ka ghar kahan hai?" or specific beneficiary
    else {
      const match = enrichedBeneficiaries.find((b) => {
        const locName = getLocalizedBeneficiaryName(b.code, b.name, language).toLowerCase();
        const rawName = b.name.toLowerCase();
        return clean.includes(rawName.split(' ')[0]) || clean.includes(locName.split(' ')[0]);
      });

      if (match && match.home_geo) {
        setSelectedBeneficiary(match);
        setMapCenter([match.home_geo.lat, match.home_geo.lng]);
        setMapZoom(16);
        const bName = getLocalizedBeneficiaryName(match.code, match.name, language);
        const bVillage = getLocalizedVillageName(match.village, language);

        if (language === 'hi') {
          spoken = `${bName} ${bVillage} में रहती हैं। उनका पिन मैप पर खोल दिया गया है।`;
        } else {
          spoken = `${bName} lives in ${bVillage}. Her household pin is opened on the map.`;
        }
      } else {
        spoken = language === 'hi' ? 'लाभार्थी का घर नहीं मिला।' : 'Could not find the requested household location.';
      }
    }

    setSpokenVoiceFeedback(spoken);

    // Speak response via TTS
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline({});
      pipelineRef.current.connect(relayUrl, 'mock-jwt-token-for-dev');
    }
    pipelineRef.current.requestTts(spoken, language);
  };

  const handleMicToggle = () => {
    if (isVoiceListening) {
      pipelineRef.current?.stopRecording();
      setIsVoiceListening(false);
    } else {
      setIsVoiceListening(true);
      const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
      const pipeline = new VoicePipeline({
        onFinalTranscript: (text) => {
          setIsVoiceListening(false);
          handleVoiceQuerySubmit(text);
        },
        onError: () => setIsVoiceListening(false),
      });
      pipelineRef.current = pipeline;
      pipeline.connect(relayUrl, 'mock-jwt-token-for-dev').then(() => {
        pipeline.startRecording(language);
      });
    }
  };

  const handleNavigate = (b: MapBeneficiaryItem) => {
    if (b.home_geo) {
      openNavigationApp(b.home_geo.lat, b.home_geo.lng, b.name);
    } else {
      showToast('GPS coordinates unavailable for this household', 'info');
    }
  };

  return (
    <div className="relative h-full flex flex-col pb-20 overflow-hidden bg-cream">
      {/* Top Filter and Route Control Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        {/* Row 1: Village Picker & View Mode Switcher */}
        <div className="flex items-center justify-between gap-2 bg-surface/95 backdrop-blur border border-line rounded-card p-2 shadow-card">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Compass size={16} className="text-teal-700 shrink-0" />
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Villages (सभी गांव)</option>
              {villages
                .filter((v) => v !== 'all')
                .map((v) => (
                  <option key={v} value={v}>
                    {getLocalizedVillageName(v, language)}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Today's Route Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowTodayRoute(!showTodayRoute);
                if (!showTodayRoute) {
                  setFilter('today');
                  showToast("Today's nearest-neighbour route active", 'info');
                }
              }}
              className={`px-2.5 py-1 rounded-btn text-xs font-bold border transition-all flex items-center gap-1 ${
                showTodayRoute
                  ? 'bg-saffron-500 text-white border-saffron-500 shadow-sm'
                  : 'bg-cream text-ink border-line hover:border-teal-700/30'
              }`}
            >
              <span>Route</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </button>

            {/* View Mode Switcher (Map vs List) */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="p-1.5 rounded-btn bg-teal-100/60 text-teal-900 border border-teal-700/20 hover:bg-teal-100"
              title={viewMode === 'map' ? 'Switch to List View' : 'Switch to Map View'}
            >
              {viewMode === 'map' ? <List size={16} /> : <MapIcon size={16} />}
            </button>

            {/* Voice Query Mic Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-1.5 rounded-full border transition-all ${
                isVoiceListening
                  ? 'bg-danger text-white border-danger animate-pulse'
                  : 'bg-teal-900 text-white border-teal-900 hover:bg-teal-700'
              }`}
              title='Ask: "Agla ghar kaunsa hai?" or "Meena ka ghar kahan hai?"'
            >
              <Mic size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: t.map.filterAll },
            { id: 'today', label: t.map.filterToday },
            { id: 'danger', label: t.map.filterDanger },
            { id: 'overdue', label: t.map.filterOverdue },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id as any);
                if (item.id !== 'today') setShowTodayRoute(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur shadow-sm transition-all border ${
                filter === item.id
                  ? 'bg-teal-900 text-white border-teal-900 shadow-soft'
                  : 'bg-surface/90 text-ink border-line hover:bg-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Spoken Voice Feedback Toast Bar if active */}
        {spokenVoiceFeedback && (
          <div className="p-2.5 bg-teal-900 text-white rounded-card shadow-lg flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-teal-100 shrink-0" />
              <span>{spokenVoiceFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setSpokenVoiceFeedback(null)}
              className="text-teal-100 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Today's Route Summary Banner when Route Mode is Active */}
        {showTodayRoute && routeStops.length > 0 && (
          <div className="p-2.5 bg-saffron-100/95 backdrop-blur border border-saffron-500/40 rounded-card shadow-md flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-ink">
                Route: {routeStops.length} stops ({routeStops[routeStops.length - 1]?.totalDistanceKm} km)
              </span>
              <p className="text-[11px] text-muted">
                Next: #{routeStops[0]?.stopNumber} {getLocalizedBeneficiaryName(routeStops[0]?.item.code, routeStops[0]?.item.name, language)} (~{Math.round(routeStops[0]?.distanceFromPreviousKm * 1000)}m)
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate(routeStops[0].item)}
              className="px-2.5 py-1 rounded-btn bg-saffron-500 text-white text-xs font-bold shadow-sm hover:bg-saffron-600 flex items-center gap-1"
            >
              <Navigation size={12} />
              <span>Start</span>
            </button>
          </div>
        )}
      </div>

      {/* Main View Area (Map or List View) */}
      <div className="flex-1 w-full relative">
        {viewMode === 'map' ? (
          <div className="w-full h-full relative bg-[#EAE5D9]">
            {/* Plain Background Canvas underneath for 100% offline tolerance */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#136B64_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full z-10"
              attributionControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Worker's Current GPS Location Pin */}
              {workerLocation && (
                <Marker
                  position={[workerLocation.lat, workerLocation.lng]}
                  icon={createWorkerIcon()}
                />
              )}

              {/* Route Polyline connecting stops in nearest-neighbour order */}
              {routePolylineCoords.length > 1 && (
                <Polyline
                  positions={routePolylineCoords}
                  pathOptions={{
                    color: '#E8833A',
                    weight: 4,
                    dashArray: '6, 8',
                    opacity: 0.9,
                  }}
                />
              )}

              {/* Beneficiary Household Pins */}
              {filteredBeneficiaries.map((b) => {
                if (!b.home_geo) return null;
                const stopNum = showTodayRoute ? stopNumberMap.get(b.code) : undefined;
                return (
                  <Marker
                    key={b.id}
                    position={[b.home_geo.lat, b.home_geo.lng]}
                    icon={createPinIcon(b.pinColor, stopNum)}
                    eventHandlers={{
                      click: () => {
                        setSelectedBeneficiary(b);
                        setMapCenter([b.home_geo!.lat, b.home_geo!.lng]);
                      },
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>
        ) : (
          /* List View fallback: readable offline with coordinates & direct actions */
          <div className="h-full overflow-y-auto p-4 pt-28 space-y-3">
            <div className="text-xs font-semibold text-muted px-1">
              {filteredBeneficiaries.length} Households Found
            </div>
            {filteredBeneficiaries.map((b) => {
              const localizedName = getLocalizedBeneficiaryName(b.code, b.name, language);
              const localizedVillage = getLocalizedVillageName(b.village, language);
              const stopNum = stopNumberMap.get(b.code);

              return (
                <Card
                  key={b.id}
                  interactive
                  onClick={() => {
                    setSelectedBeneficiary(b);
                    setViewMode('map');
                    if (b.home_geo) setMapCenter([b.home_geo.lat, b.home_geo.lng]);
                  }}
                  className={`p-3.5 space-y-2 border ${
                    b.isDanger ? 'border-danger/40 bg-danger/5' : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {stopNum && (
                          <span className="w-5 h-5 rounded-full bg-saffron-500 text-white font-bold text-xs flex items-center justify-center">
                            {stopNum}
                          </span>
                        )}
                        <h3 className="font-bold text-base text-ink">{localizedName}</h3>
                        <span className="text-xs text-muted">({b.code})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-teal-700" />
                          {localizedVillage}
                        </span>
                        {b.distanceKm !== undefined && (
                          <span>~{b.distanceKm} km away</span>
                        )}
                      </div>
                    </div>

                    <Chip
                      variant={
                        b.pinColor === 'danger'
                          ? 'danger'
                          : b.pinColor === 'saffron'
                          ? 'saffron'
                          : 'teal'
                      }
                      size="sm"
                    >
                      {b.statusLabel}
                    </Chip>
                  </div>

                  {b.home_geo && (
                    <div className="text-[11px] font-mono text-muted flex items-center justify-between border-t border-line/60 pt-2">
                      <span>GPS: {b.home_geo.lat.toFixed(4)}°, {b.home_geo.lng.toFixed(4)}°</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(b);
                        }}
                        className="text-teal-900 font-bold underline flex items-center gap-1"
                      >
                        <Navigation size={12} />
                        <span>{t.map.navigate}</span>
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pin Card (Bottom Sheet) */}
      {selectedBeneficiary && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] max-w-md mx-auto pointer-events-auto">
          <Card className="p-4 bg-surface/98 backdrop-blur border-2 border-teal-900/15 shadow-2xl rounded-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-ink">
                    {getLocalizedBeneficiaryName(
                      selectedBeneficiary.code,
                      selectedBeneficiary.name,
                      language
                    )}
                  </h3>
                  <span className="text-xs text-muted font-medium">
                    ({selectedBeneficiary.code})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-teal-700" />
                    {getLocalizedVillageName(selectedBeneficiary.village, language)}
                  </span>
                  {selectedBeneficiary.distanceKm !== undefined && (
                    <span className="font-semibold text-ink">
                      ~{selectedBeneficiary.distanceKm} km away
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBeneficiary(null)}
                className="p-1 text-muted hover:text-ink rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Danger Sign Alert in Pin Card */}
            {selectedBeneficiary.isDanger && (
              <div className="p-2.5 rounded-lg bg-danger/10 border border-danger text-danger text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>
                  Emergency Referral Pending: High BP [MoHFW Maternal Guidelines]
                </span>
              </div>
            )}

            {/* Visit & Due Date Metadata */}
            <div className="flex items-center justify-between text-xs text-muted border-t border-line/60 pt-2">
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Last Visit: {selectedBeneficiary.lastVisitDate || 'None'}
              </span>
              <span className="flex items-center gap-1 font-semibold text-ink">
                <Calendar size={13} />
                Due: {selectedBeneficiary.nextDueDate || 'None'}
              </span>
            </div>

            {/* Action Buttons: Navigate & Start Visit */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                icon={<Navigation size={18} />}
                onClick={() => handleNavigate(selectedBeneficiary)}
              >
                {t.map.navigate}
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 size={18} />}
                onClick={() => onStartVisit(selectedBeneficiary)}
              >
                {t.map.startVisit}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
