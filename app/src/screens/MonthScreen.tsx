import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  SunMedium,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  X,
  Mic,
  Volume2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { getLocalizedBeneficiaryName, getLocalizedVillageName } from '../i18n/localize';
import { getVisits, getFollowUps, getBeneficiaries } from '../data/repository';
import {
  Visit,
  FollowUp,
  Beneficiary,
  computeMonthlyLedger,
  MonthlyLedgerSummary,
} from '@asha/shared';
import { VoicePipeline } from '../utils/audioPipeline';

export const MonthScreen: React.FC = () => {
  const { language, showToast } = useAppStore();
  const t = getT(language);

  const uid = 'demo-asha-worker-01';
  const pipelineRef = useRef<VoicePipeline | null>(null);

  // State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Voice Query & Briefing
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [spokenFeedback, setSpokenFeedback] = useState<string | null>(null);
  const [isBriefingPlaying, setIsBriefingPlaying] = useState(false);

  // ANM Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [includeLocationInReport, setIncludeLocationInReport] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [vList, fList, bList] = await Promise.all([
          getVisits(uid),
          getFollowUps(uid),
          getBeneficiaries(uid),
        ]);
        setVisits(vList);
        setFollowups(fList);
        setBeneficiaries(bList);
      } catch (err) {
        console.error('Failed to load month data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live ledger from recorded visits for November 2026
  const ledger: MonthlyLedgerSummary = React.useMemo(() => {
    return computeMonthlyLedger(visits, '2026-11');
  }, [visits]);

  // Today's summary metrics (16 Nov 2026)
  const todayDueCount = followups.filter((f) => f.due_date === '2026-11-16' && f.status !== 'done').length;
  const overdueCount = followups.filter((f) => f.status === 'overdue').length;
  const urgentDangerCount = followups.filter((f) => f.is_danger_referral && f.status !== 'done').length;

  // Speak TTS helper
  const speakText = (text: string) => {
    setSpokenFeedback(text);
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline({
        onAgentAudioEnd: () => {
          setIsBriefingPlaying(false);
        },
      });
      pipelineRef.current.connect(relayUrl, 'mock-jwt-token-for-dev');
    }
    pipelineRef.current.requestTts(text, language);
  };

  // EXTRA 1: Morning Briefing Aloud
  const handlePlayMorningBriefing = () => {
    setIsBriefingPlaying(true);

    let briefingText = '';
    if (language === 'hi') {
      briefingText = `नमस्ते दीदी! आज कुल ${todayDueCount} गृह-भेंट प्रस्तावित हैं। ${overdueCount} फॉलो-अप समय बीता हुआ है और ${urgentDangerCount} खतरे का रेफरल फॉलो-अप तुरंत करना है। आपका दिन शुभ हो!`;
    } else {
      briefingText = `Namaste Didi! Today you have ${todayDueCount} home visits scheduled, ${overdueCount} overdue follow-up, and ${urgentDangerCount} urgent danger referral pending. Have a safe and productive day!`;
    }

    speakText(briefingText);
  };

  // Voice Query on Month Screen
  const handleVoiceQuerySubmit = (queryText: string) => {
    const clean = queryText.toLowerCase().trim();
    let spoken = '';

    // Query 1: "is mahine kitne visit hue" / "how many visits"
    if (
      clean.includes('kitne') ||
      clean.includes('visit') ||
      clean.includes('कितने') ||
      clean.includes('count') ||
      clean.includes('எத்தனை')
    ) {
      if (language === 'hi') {
        spoken = `इस महीने कुल ${ledger.totalVisits} गृह-भेंट दर्ज की गई हैं, जिनमें ${ledger.completeRecords} पूर्ण रिकॉर्ड हैं।`;
      } else {
        spoken = `This month, ${ledger.totalVisits} home visits were recorded, with ${ledger.completeRecords} complete records.`;
      }
    }
    // Query 2: "kaunse records adhure hain" / "which records are incomplete"
    else if (
      clean.includes('adhure') ||
      clean.includes('incomplete') ||
      clean.includes('अधूरे') ||
      clean.includes('बाकी')
    ) {
      if (ledger.incompleteRecords.length === 0) {
        spoken = language === 'hi' ? 'इस महीने कोई अधूरा रिकॉर्ड नहीं है।' : 'All visit records are complete this month.';
      } else {
        const names = ledger.incompleteRecords
          .slice(0, 3)
          .map((r) => getLocalizedBeneficiaryName(r.beneficiaryCode, r.beneficiaryName, language))
          .join(', ');

        if (language === 'hi') {
          spoken = `कुल ${ledger.incompleteRecords.length} रिकॉर्ड अधूरे हैं: ${names}। कृपया इनके छूटे हुए विवरण दर्ज करें।`;
        } else {
          spoken = `${ledger.incompleteRecords.length} records are incomplete, including ${names}. Please fill the missing fields.`;
        }
      }
    } else {
      spoken = language === 'hi' ? 'मंथली लेजर में 20 विजिट दर्ज हैं।' : `There are ${ledger.totalVisits} visits logged in the monthly register.`;
    }

    speakText(spoken);
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

  // EXTRA 2: ANM Weekly/Monthly Report Sharing
  const handleShareANMReport = async () => {
    const villagesCovered = Array.from(new Set(visits.map((v) => v.village).filter(Boolean))).join(', ');
    const referralsCount = visits.filter((v) => v.danger_flags && v.danger_flags.length > 0).length;

    let reportText = `==============================\n` +
      `ASHA MONTHLY & ANM ACTIVITY REPORT\n` +
      `Month: November 2026\n` +
      `ASHA Worker ID: ${uid}\n` +
      `Villages Covered: ${villagesCovered || 'Rampur, Kishanpur'}\n` +
      `------------------------------\n` +
      `SUMMARY METRICS:\n` +
      `- Total Visits Completed: ${ledger.totalVisits}\n` +
      `- Complete Records: ${ledger.completeRecords}\n` +
      `- Incomplete Records: ${ledger.incompleteRecords.length}\n` +
      `- Danger Sign Referrals: ${referralsCount}\n` +
      `- Pending Follow-ups: ${followups.filter((f) => f.status === 'pending').length}\n` +
      `------------------------------\n` +
      `NHM ACTIVITY LEDGER:\n` +
      ledger.activityCounts
        .filter((a) => a.count > 0)
        .map((a) => `* ${a.name}: ${a.count} (${a.complete} complete, ${a.incomplete} incomplete)`)
        .join('\n') +
      `\n------------------------------\n` +
      (includeLocationInReport ? `Location Data: Opted-in by worker\n` : `Location Data: Excluded for privacy\n`) +
      `Generated by ASHA Voice Register.\n` +
      `Official NHM Activity Counts · Not Financial Advice.\n` +
      `==============================`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ASHA Monthly ANM Report - Nov 2026',
          text: reportText,
        });
        showToast('ANM Report shared successfully', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(reportText);
          showToast('Report copied to clipboard', 'info');
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(reportText);
      showToast('Report copied to clipboard', 'info');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">{t.month.title}</h2>
          <p className="text-xs text-muted">November 2026 · {t.month.subTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice query mic button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`p-2 rounded-full border transition-all ${
              isVoiceListening
                ? 'bg-danger text-white border-danger animate-pulse'
                : 'bg-teal-900 text-white border-teal-900 hover:bg-teal-700'
            }`}
            title='Ask: "is mahine kitne visit hue" or "kaunse records adhure hain"'
          >
            <Mic size={16} />
          </button>
          <Chip variant="teal" size="sm">
            {t.month.monthBadge}
          </Chip>
        </div>
      </div>

      {/* Voice Spoken Response Toast if active */}
      {spokenFeedback && (
        <div className="p-3 bg-teal-900 text-white rounded-card shadow-lg flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-teal-100 shrink-0" />
            <span className="leading-snug">{spokenFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpokenFeedback(null)}
            className="text-teal-100 hover:text-white shrink-0 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* EXTRA 1: Morning Briefing Card with Live TTS */}
      <Card className="bg-teal-900 text-white border-none p-4 space-y-3 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SunMedium size={22} className="text-saffron-500" />
            <h3 className="font-bold text-base">{t.month.briefingTitle}</h3>
          </div>
          {isBriefingPlaying && (
            <span className="text-[11px] font-bold text-saffron-500 animate-pulse">
              Playing...
            </span>
          )}
        </div>
        <p className="text-xs text-teal-100 leading-relaxed">
          "{t.month.briefingText}"
        </p>
        <button
          type="button"
          onClick={handlePlayMorningBriefing}
          className="text-xs font-bold text-saffron-500 hover:text-saffron-100 flex items-center gap-1.5 pt-1"
        >
          <Volume2 size={16} />
          <span>{t.month.listenBriefing} (2-3 sentences)</span>
          <ChevronRight size={14} />
        </button>
      </Card>

      {/* Total Activity Counts Overview */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted px-1 flex items-center justify-between">
          <span>{t.month.activityCounts}</span>
          <span className="text-[11px] text-teal-900 font-semibold">Official NHM Counts</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center bg-surface border-line shadow-card">
            <div className="text-2xl font-bold text-teal-900">{ledger.totalVisits}</div>
            <div className="text-xs text-muted font-medium mt-0.5">{t.month.totalTasksLogged}</div>
          </Card>
          <Card className="p-3 text-center bg-surface border-line shadow-card">
            <div className="text-2xl font-bold text-success">{ledger.completeRecords}</div>
            <div className="text-xs text-muted font-medium mt-0.5">{t.month.completedRecords}</div>
          </Card>
        </div>

        {/* NHM Activities Ledger Breakdown */}
        {ledger.activityCounts.map((act) => (
          <Card key={act.id} className="p-3.5 bg-surface border-line space-y-1.5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-ink">{act.name}</h4>
                <div className="text-[11px] text-muted font-medium">{act.guidelineRef}</div>
              </div>
              <span className="text-lg font-bold text-teal-900">{act.count}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-line/60">
              <span className="text-success font-medium flex items-center gap-1">
                <CheckCircle size={13} /> {t.month.completeStatus(act.complete)}
              </span>
              {act.incomplete > 0 && (
                <span className="text-saffron-500 font-bold flex items-center gap-1">
                  <AlertCircle size={13} /> {t.month.incompleteStatus(act.incomplete)}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Incomplete Records Section */}
      {ledger.incompleteRecords.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-saffron-500 px-1">
            {t.month.incompleteRecordsTitle(ledger.incompleteRecords.length)}
          </div>
          {ledger.incompleteRecords.map((rec) => {
            const locName = getLocalizedBeneficiaryName(rec.beneficiaryCode, rec.beneficiaryName, language);
            const missingLabels = rec.missingFields.map((f) => f.replace(/_/g, ' ')).join(', ');

            return (
              <Card
                key={rec.visitId}
                className="p-3.5 bg-saffron-100/50 border-saffron-500/30 flex items-center justify-between shadow-card"
              >
                <div>
                  <div className="text-sm font-bold text-ink">
                    {locName} <span className="text-xs text-muted">({rec.beneficiaryCode})</span>
                  </div>
                  <div className="text-xs text-danger font-semibold mt-0.5">
                    Missing: {missingLabels}
                  </div>
                  <div className="text-[11px] text-muted">
                    {rec.activityName} · {rec.date}
                  </div>
                </div>

                <div className="text-xs font-semibold px-2 py-1 rounded bg-saffron-100 text-saffron-900 border border-saffron-500/30 shrink-0">
                  Needs review
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* EXTRA 2: ANM Report Export Section */}
      <div className="pt-2 space-y-2">
        <Button
          variant="primary"
          size="md"
          fullWidth
          icon={<Share2 size={18} />}
          onClick={() => setIsReportModalOpen(true)}
        >
          {t.month.shareReportBtn}
        </Button>
        <p className="text-[11px] text-muted text-center leading-relaxed">
          {t.month.shareDisclaimer}
        </p>
      </div>

      {/* ANM Weekly Report Modal / PDF Preview */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-5 w-full max-w-sm border border-line space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-teal-900" />
                <h3 className="font-bold text-base text-ink">ANM Activity Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 text-muted hover:text-ink rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Report Summary Container */}
            <div id="anm-printable-report" className="space-y-3 text-xs bg-cream/70 p-3.5 rounded-card border border-line">
              <div className="text-center pb-2 border-b border-line">
                <h4 className="font-bold text-sm text-teal-900">ASHA REGISTER & ANM REPORT</h4>
                <p className="text-[11px] text-muted">Period: November 2026 · Worker: {uid}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-ink">
                <div>
                  <span className="text-muted block">Total Visits:</span>
                  <strong className="text-sm">{ledger.totalVisits}</strong>
                </div>
                <div>
                  <span className="text-muted block">Complete Records:</span>
                  <strong className="text-sm text-success">{ledger.completeRecords}</strong>
                </div>
                <div>
                  <span className="text-muted block">Incomplete Records:</span>
                  <strong className="text-sm text-danger">{ledger.incompleteRecords.length}</strong>
                </div>
                <div>
                  <span className="text-muted block">Danger Referrals:</span>
                  <strong className="text-sm text-danger">
                    {visits.filter((v) => v.danger_flags && v.danger_flags.length > 0).length}
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-line/60">
                <span className="font-bold text-muted block mb-1">NHM Activity Ledger:</span>
                <ul className="space-y-1 text-[11px] text-ink">
                  {ledger.activityCounts
                    .filter((a) => a.count > 0)
                    .map((a) => (
                      <li key={a.id} className="flex justify-between">
                        <span>{a.name}:</span>
                        <strong>{a.count} ({a.complete} ✓)</strong>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Privacy Consent Option for Location */}
              <div className="pt-2 border-t border-line/60">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-muted">
                  <input
                    type="checkbox"
                    checked={includeLocationInReport}
                    onChange={(e) => setIncludeLocationInReport(e.target.checked)}
                    className="w-4 h-4 accent-teal-900 rounded"
                  />
                  <span>Include village coordinates (opt-in)</span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer size={16} />}
                onClick={handlePrintPDF}
              >
                Print / PDF
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Share2 size={16} />}
                onClick={handleShareANMReport}
              >
                Share Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
