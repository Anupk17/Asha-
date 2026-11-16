import React from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { FollowUp } from '@asha/shared';
import { useAppStore } from '../../store/appStore';
import { getT } from '../../i18n';
import {
  getLocalizedBeneficiaryName,
  getLocalizedVillageName,
  getLocalizedTaskType,
} from '../../i18n/localize';

export interface TimelineItemProps {
  item: FollowUp;
  onMarkDone?: (id: string) => void;
  onClick?: (item: FollowUp) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  onMarkDone,
  onClick,
}) => {
  const { language } = useAppStore();
  const t = getT(language);

  const isDanger = item.is_danger_referral || item.status === 'overdue' && item.type.includes('danger');
  const isOverdue = item.status === 'overdue' && !isDanger;
  const isDone = item.status === 'done';

  const localizedName = getLocalizedBeneficiaryName(item.beneficiary_code, item.beneficiary_name, language);
  const localizedVillage = getLocalizedVillageName(item.village, language);
  const localizedTaskType = getLocalizedTaskType(item.type, language);

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`relative w-full rounded-card p-4 border transition-all duration-150 ${
        isDanger
          ? 'bg-danger/10 border-danger shadow-sm'
          : isOverdue
          ? 'bg-saffron-100/60 border-saffron-500/50 shadow-soft'
          : isDone
          ? 'bg-surface/60 border-line opacity-75'
          : 'bg-surface border-line shadow-card hover:border-teal-700/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isDanger ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-danger bg-danger/10 px-2.5 py-0.5 rounded-full border border-danger/20">
                <AlertTriangle size={12} className="stroke-[2.5]" />
                {t.today.urgentDangerBadge}
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-saffron-500 bg-saffron-500/10 px-2.5 py-0.5 rounded-full border border-saffron-500/30">
                <Clock size={12} />
                {t.today.overdueBadge}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-full">
                {localizedTaskType}
              </span>
            )}
            {item.guideline_ref && (
              <span className="text-[11px] text-muted font-medium">
                [{item.guideline_ref}]
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-ink mt-1 truncate">
            {localizedName}
            <span className="text-xs font-normal text-muted ml-2">({item.beneficiary_code})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-2">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-teal-700" />
              {localizedVillage}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {t.today.dueOn}: {item.due_date}
            </span>
          </div>
        </div>

        {/* Action button */}
        {onMarkDone && !isDone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDone(item.id);
            }}
            className="shrink-0 min-h-[44px] px-3.5 py-1.5 rounded-btn bg-teal-100 text-teal-900 border border-teal-700/20 text-xs font-bold hover:bg-teal-900 hover:text-white transition-all flex items-center gap-1 active:scale-95"
          >
            <CheckCircle size={15} />
            {t.today.markDone}
          </button>
        )}
      </div>
    </div>
  );
};
