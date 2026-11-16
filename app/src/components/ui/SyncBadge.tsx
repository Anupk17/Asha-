import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getT } from '../../i18n';

export type SyncState = 'synced' | 'offline' | 'syncing';

export interface SyncBadgeProps {
  status: SyncState;
  pendingCount?: number;
  className?: string;
  onRefresh?: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({
  status,
  pendingCount = 0,
  className = '',
  onRefresh,
}) => {
  const { language } = useAppStore();
  const t = getT(language);

  const configs = {
    synced: {
      bg: 'bg-teal-100/70 text-teal-900 border-teal-700/20',
      icon: <Wifi size={13} className="text-teal-900" />,
      text: t.sync.synced,
    },
    offline: {
      bg: 'bg-saffron-100 text-ink border-saffron-500/40',
      icon: <WifiOff size={13} className="text-saffron-500" />,
      text: pendingCount > 0 ? t.sync.offlinePending(pendingCount) : t.sync.offline,
    },
    syncing: {
      bg: 'bg-teal-100 text-teal-900 border-teal-700/30',
      icon: <RefreshCw size={13} className="animate-spin text-teal-900" />,
      text: t.sync.syncing,
    },
  };

  const cfg = configs[status];

  return (
    <div
      onClick={onRefresh}
      role={onRefresh ? 'button' : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${cfg.bg} ${
        onRefresh ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      {cfg.icon}
      <span>{cfg.text}</span>
    </div>
  );
};

