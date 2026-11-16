import React from 'react';
import { Calendar, Users, Mic, Map, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getT } from '../../i18n';

export type TabId = 'today' | 'visits' | 'record' | 'map' | 'month' | 'settings';

export interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { language } = useAppStore();
  const t = getT(language);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {/* Today */}
        <button
          type="button"
          onClick={() => onTabChange('today')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'today' ? 'text-teal-900 font-bold' : 'text-muted hover:text-ink'
          }`}
        >
          <Calendar size={22} className={activeTab === 'today' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-1">{t.tabs.today}</span>
        </button>

        {/* Visits & Search */}
        <button
          type="button"
          onClick={() => onTabChange('visits')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'visits' ? 'text-teal-900 font-bold' : 'text-muted hover:text-ink'
          }`}
        >
          <Users size={22} className={activeTab === 'visits' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-1">{t.tabs.beneficiaries}</span>
        </button>

        {/* Center Record FAB */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={() => onTabChange('record')}
            aria-label="Start recording visit"
            className="w-14 h-14 rounded-full bg-saffron-500 text-white flex items-center justify-center shadow-lg border-4 border-cream hover:bg-saffron-500/90 active:scale-95 transition-transform"
          >
            <Mic size={26} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Map */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'map' ? 'text-teal-900 font-bold' : 'text-muted hover:text-ink'
          }`}
        >
          <Map size={22} className={activeTab === 'map' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-1">{t.tabs.map}</span>
        </button>

        {/* My Month */}
        <button
          type="button"
          onClick={() => onTabChange('month')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'month' ? 'text-teal-900 font-bold' : 'text-muted hover:text-ink'
          }`}
        >
          <BarChart3 size={22} className={activeTab === 'month' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-1">{t.tabs.month}</span>
        </button>
      </div>
    </nav>
  );
};
