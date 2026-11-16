import React from 'react';
import { Share2, SunMedium, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { getLocalizedBeneficiaryName } from '../i18n/localize';

export const MonthScreen: React.FC = () => {
  const { language } = useAppStore();
  const t = getT(language);

  const activities = [
    { title: t.month.ancVisits, count: 14, complete: 13, missing: 1, guideline: 'NHM ASHA Activity #2' },
    { title: t.month.hbncCare, count: 8, complete: 8, missing: 0, guideline: 'NHM HBNC Module 6&7' },
    { title: t.month.immunisationSessions, count: 4, complete: 3, missing: 1, guideline: 'NHM UIP Guidelines' },
    { title: t.month.dangerReferrals, count: 3, complete: 3, missing: 0, guideline: 'Emergency Referral Guideline' },
  ];

  const incompleteRecords = [
    { name: `${getLocalizedBeneficiaryName('SYN-0005', 'Rekha Pal', language)} (SYN-0005)`, missing: t.month.weightNotRecorded },
    { name: `${getLocalizedBeneficiaryName('SYN-0004', 'Aarav Singh', language)} (SYN-0004)`, missing: t.month.vaccinationMissing },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">{t.month.title}</h2>
          <p className="text-xs text-muted">{t.month.subTitle}</p>
        </div>
        <Chip variant="teal" size="sm">
          {t.month.monthBadge}
        </Chip>
      </div>

      {/* Morning Briefing Card */}
      <Card className="bg-teal-900 text-white border-none p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SunMedium size={20} className="text-saffron-500" />
          <h3 className="font-bold text-base">{t.month.briefingTitle}</h3>
        </div>
        <p className="text-xs text-teal-100 leading-relaxed">
          "{t.month.briefingText}"
        </p>
        <button
          type="button"
          onClick={() => {}}
          className="text-xs font-semibold text-saffron-500 hover:text-saffron-100 flex items-center gap-1"
        >
          <span>{t.month.listenBriefing}</span>
          <ChevronRight size={14} />
        </button>
      </Card>

      {/* Activities Ledger Summary */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted px-1">
          {t.month.activityCounts}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center bg-surface border-line">
            <div className="text-2xl font-bold text-teal-900">29</div>
            <div className="text-xs text-muted font-medium mt-0.5">{t.month.totalTasksLogged}</div>
          </Card>
          <Card className="p-3 text-center bg-surface border-line">
            <div className="text-2xl font-bold text-success">27</div>
            <div className="text-xs text-muted font-medium mt-0.5">{t.month.completedRecords}</div>
          </Card>
        </div>

        {activities.map((act, idx) => (
          <Card key={idx} className="p-3.5 bg-surface border-line space-y-1.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-ink">{act.title}</h4>
                <div className="text-[11px] text-muted">{act.guideline}</div>
              </div>
              <span className="text-base font-bold text-teal-900">{act.count}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-line/60">
              <span className="text-success font-medium flex items-center gap-1">
                <CheckCircle size={12} /> {t.month.completeStatus(act.complete)}
              </span>
              {act.missing > 0 && (
                <span className="text-saffron-500 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> {t.month.incompleteStatus(act.missing)}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Incomplete Records Section */}
      {incompleteRecords.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-saffron-500 px-1">
            {t.month.incompleteRecordsTitle(incompleteRecords.length)}
          </div>
          {incompleteRecords.map((rec, idx) => (
            <Card key={idx} className="p-3 bg-saffron-100/50 border-saffron-500/30 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{rec.name}</div>
                <div className="text-xs text-danger font-medium mt-0.5">
                  {rec.missing}
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-btn bg-teal-900 text-white text-xs font-semibold"
              >
                {t.month.completeBtn}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* ANM Report Export Section */}
      <div className="pt-2 space-y-2">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={<Share2 size={18} />}
          onClick={() => {}}
        >
          {t.month.shareReportBtn}
        </Button>
        <p className="text-[11px] text-muted text-center">
          {t.month.shareDisclaimer}
        </p>
      </div>
    </div>
  );
};
