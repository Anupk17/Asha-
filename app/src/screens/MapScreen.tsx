import React, { useState } from 'react';
import { MapPin, Navigation, Mic, AlertTriangle, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_BENEFICIARIES } from '../data/mockData';
import { Beneficiary } from '@asha/shared';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';

export interface MapScreenProps {
  onStartVisit: (b: Beneficiary) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onStartVisit }) => {
  const { language } = useAppStore();
  const t = getT(language);

  const [selectedPin, setSelectedPin] = useState<Beneficiary | null>(MOCK_BENEFICIARIES[0]);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'danger'>('all');

  const pinsWithStatus = MOCK_BENEFICIARIES.map((b) => {
    let pinColor: 'teal' | 'saffron' | 'danger' | 'grey' = 'teal';
    let statusLabel = t.map.recentVisit;
    let isDanger = false;

    if (b.code === 'SYN-0003') {
      pinColor = 'danger';
      statusLabel = t.map.referralPending;
      isDanger = true;
    } else if (b.code === 'SYN-0004') {
      pinColor = 'saffron';
      statusLabel = t.map.overdueVaccine;
    } else if (b.code === 'SYN-0005') {
      pinColor = 'grey';
      statusLabel = t.map.upcomingVisit;
    }

    return { ...b, pinColor, statusLabel, isDanger };
  });

  const filteredPins = pinsWithStatus.filter((p) => {
    if (filter === 'danger') return p.pinColor === 'danger';
    if (filter === 'overdue') return p.pinColor === 'saffron';
    if (filter === 'today') return p.pinColor === 'teal' || p.pinColor === 'danger';
    return true;
  });

  const handleNavigate = (b: Beneficiary) => {
    if (b.home_geo) {
      window.open(`geo:${b.home_geo.lat},${b.home_geo.lng}?q=${b.home_geo.lat},${b.home_geo.lng}`, '_system');
    }
  };

  return (
    <div className="relative h-full flex flex-col pb-20">
      {/* Top Filter Chips Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
        {[
          { id: 'all', label: t.map.filterAll },
          { id: 'today', label: t.map.filterToday },
          { id: 'danger', label: t.map.filterDanger },
          { id: 'overdue', label: t.map.filterOverdue },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur shadow-md transition-colors border ${
              filter === item.id
                ? 'bg-teal-900 text-white border-teal-900'
                : 'bg-surface/90 text-ink border-line hover:bg-surface'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Map View Area */}
      <div className="flex-1 w-full bg-[#EAE5D9] relative flex flex-col justify-center items-center overflow-hidden">
        {/* Visual Map Grid & Contour Lines */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#136B64_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Fictional Village Street / Path representation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" stroke="#0B4F4A" strokeWidth="3" fill="none">
          <path d="M 50 100 Q 150 250 250 200 T 400 400" />
          <path d="M 80 400 Q 200 350 300 150" strokeDasharray="6,6" />
        </svg>

        {/* Render Households as interactive Pins */}
        <div className="relative w-full h-full max-w-md mx-auto">
          {filteredPins.map((pin, idx) => {
            const positions = [
              { top: '35%', left: '42%' },
              { top: '25%', left: '68%' },
              { top: '55%', left: '30%' },
              { top: '65%', left: '60%' },
              { top: '42%', left: '20%' },
            ];
            const pos = positions[idx % positions.length];
            const isSelected = selectedPin?.id === pin.id;

            const pinBg =
              pin.pinColor === 'danger'
                ? 'bg-danger text-white'
                : pin.pinColor === 'saffron'
                ? 'bg-saffron-500 text-white'
                : pin.pinColor === 'teal'
                ? 'bg-teal-700 text-white'
                : 'bg-muted text-white';

            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => setSelectedPin(pin)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-transform active:scale-90 ${pinBg} ${
                  isSelected ? 'ring-4 ring-white scale-125 z-10' : 'hover:scale-110'
                }`}
              >
                <MapPin size={20} className="stroke-[2.5]" />
              </button>
            );
          })}
        </div>

        {/* OpenStreetMap Attribution (Mandatory by OSM licence) */}
        <div className="absolute bottom-24 right-2 z-10 bg-surface/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-muted border border-line">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
        </div>
      </div>

      {/* Pin Details Bottom Sheet */}
      {selectedPin && (
        <div className="absolute bottom-16 left-4 right-4 z-20 max-w-md mx-auto">
          <Card className="bg-surface shadow-lg border-line space-y-3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">{selectedPin.name}</h3>
                  <span className="text-xs text-muted">({selectedPin.code})</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium mt-0.5">
                  <MapPin size={13} />
                  <span>{selectedPin.village}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="p-1 text-muted hover:text-ink rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {selectedPin.code === 'SYN-0003' && (
              <div className="p-2 rounded bg-danger/10 text-danger text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{t.map.dangerSignNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                icon={<Navigation size={16} />}
                onClick={() => handleNavigate(selectedPin)}
              >
                {t.map.navigate}
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={<Mic size={16} />}
                onClick={() => onStartVisit(selectedPin)}
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
