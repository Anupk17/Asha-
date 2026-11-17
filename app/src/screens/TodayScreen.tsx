import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Mic, Volume2, X } from 'lucide-react';
import { DateStrip, DateItem } from '../components/ui/DateStrip';
import { TimelineItem } from '../components/ui/TimelineItem';
import { Banner } from '../components/ui/Banner';
import { SyncBadge } from '../components/ui/SyncBadge';
import { FollowUp, updateFollowUpStatuses } from '@asha/shared';
import { getFollowUps, markFollowUpDone } from '../data/repository';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { ReminderService } from '../utils/reminderService';
import { processVoiceQuery, VoiceQueryResult } from '../utils/voiceQueries';
import { VoicePipeline } from '../utils/audioPipeline';

export interface TodayScreenProps {
  onStartRecord: () => void;
  onOpenFollowUp?: (item: FollowUp) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onStartRecord,
  onOpenFollowUp,
}) => {
  const { language, showToast } = useAppStore();
  const t = getT(language);

  const [selectedDate, setSelectedDate] = useState('2026-11-16');
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceQueryActive, setVoiceQueryActive] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceQueryResult | null>(null);
  const [isListeningVoiceQuery, setIsListeningVoiceQuery] = useState(false);

  const uid = 'demo-asha-worker-01';
  const pipelineRef = useRef<VoicePipeline | null>(null);

  const loadFollowUps = async () => {
    try {
      const rawData = await getFollowUps(uid);
      // Auto-update pending to overdue when due_date has passed
      const updated = updateFollowUpStatuses(rawData, selectedDate);
      setFollowups(updated);

      // Reschedule offline local notifications whenever follow-ups change
      ReminderService.rescheduleAll(updated, undefined, selectedDate);
    } catch (e) {
      console.error('Error loading follow-ups:', e);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [selectedDate]);

  // Multi-language day labels
  const dayNames: Record<string, [string, string, string, string, string, string, string]> = {
    en: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    hi: ['शुक्र', 'शनि', 'रवि', 'सोम', 'मंगल', 'बुध', 'गुरु'],
    ta: ['வெள்', 'சனி', 'ஞாயி', 'திங்', 'செவ்', 'புதன்', 'வியா'],
    te: ['శుక్ర', 'శని', 'ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు'],
    kn: ['ಶುಕ್ರ', 'ಶನಿ', 'ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು'],
    ml: ['വെള്ളി', 'ശനി', 'ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം'],
    mr: ['शुक्र', 'शनि', 'रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु'],
  };

  const days = dayNames[language] || dayNames.en;

  const dateStripItems: DateItem[] = [
    { date: new Date('2026-11-13'), dateString: '2026-11-13', dayLabel: days[0], dayNumber: 13, isToday: false, hasItems: false },
    { date: new Date('2026-11-14'), dateString: '2026-11-14', dayLabel: days[1], dayNumber: 14, isToday: false, hasItems: true, hasDanger: true },
    { date: new Date('2026-11-15'), dateString: '2026-11-15', dayLabel: days[2], dayNumber: 15, isToday: false, hasItems: true, hasDanger: true },
    { date: new Date('2026-11-16'), dateString: '2026-11-16', dayLabel: days[3], dayNumber: 16, isToday: true, hasItems: true, hasDanger: false },
    { date: new Date('2026-11-17'), dateString: '2026-11-17', dayLabel: days[4], dayNumber: 17, isToday: false, hasItems: true },
    { date: new Date('2026-11-18'), dateString: '2026-11-18', dayLabel: days[5], dayNumber: 18, isToday: false, hasItems: true },
    { date: new Date('2026-11-19'), dateString: '2026-11-19', dayLabel: days[6], dayNumber: 19, isToday: false, hasItems: false },
  ];

  const handleMarkDone = async (id: string) => {
    await markFollowUpDone(uid, id);
    const updated = followups.map((item) => (item.id === id ? { ...item, status: 'done' as const } : item));
    setFollowups(updated);
    ReminderService.rescheduleAll(updated, undefined, selectedDate);
    showToast(t.today.doneToast, 'success');
  };

  // Voice Query Execution Handler
  const handleVoiceQuerySubmit = async (queryText: string) => {
    const result = processVoiceQuery(queryText, followups, language, selectedDate);
    setVoiceResult(result);
    setVoiceQueryActive(true);

    // If marked done by voice ("Meena ka visit ho gaya")
    if (result.type === 'mark_done' && result.markedDoneTask) {
      await handleMarkDone(result.markedDoneTask.id);
    }

    // Play TTS response
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline({});
      await pipelineRef.current.connect(relayUrl, 'mock-jwt-token-for-dev');
    }
    pipelineRef.current.requestTts(result.spokenResponse, language);
  };

  const handleMicVoiceQueryToggle = () => {
    if (isListeningVoiceQuery) {
      pipelineRef.current?.stopRecording();
      setIsListeningVoiceQuery(false);
    } else {
      setIsListeningVoiceQuery(true);
      const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
      const pipeline = new VoicePipeline({
        onFinalTranscript: (text) => {
          setIsListeningVoiceQuery(false);
          handleVoiceQuerySubmit(text);
        },
        onError: () => setIsListeningVoiceQuery(false),
      });
      pipelineRef.current = pipeline;
      pipeline.connect(relayUrl, 'mock-jwt-token-for-dev').then(() => {
        pipeline.startRecording(language);
      });
    }
  };

  // Filter tasks based on Search Query or Voice Query Result
  const activeList = voiceResult ? voiceResult.matchedTasks : followups;

  const filtered = activeList.filter((f) =>
    f.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.beneficiary_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dangerItems = filtered.filter((f) => f.is_danger_referral && f.status !== 'done');
  const overdueItems = filtered.filter((f) => f.status === 'overdue' && !f.is_danger_referral);
  const todayItems = filtered.filter((f) => f.due_date === selectedDate && f.status !== 'done' && !f.is_danger_referral);
  const upcomingItems = filtered.filter((f) => f.due_date > selectedDate && f.status !== 'done' && !f.is_danger_referral);
  const doneItems = filtered.filter((f) => f.status === 'done');

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Top Bar with Sync state and Morning greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="text-saffron-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-ink">
              {t.today.greeting}
            </h2>
            <p className="text-xs text-muted">
              {t.today.subGreeting}
            </p>
          </div>
        </div>
        <SyncBadge status="synced" onRefresh={loadFollowUps} />
      </div>

      {/* Voice Assistant Query Bar */}
      <div className="p-3 bg-teal-100/70 border border-teal-700/20 rounded-card flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Volume2 size={18} className="text-teal-900 shrink-0" />
          <span className="text-xs text-teal-900 font-medium truncate">
            {voiceResult ? voiceResult.spokenResponse : 'Ask: "Aaj kiske follow-up pending hain?"'}
          </span>
        </div>

        {voiceResult && (
          <button
            type="button"
            onClick={() => {
              setVoiceResult(null);
              setVoiceQueryActive(false);
            }}
            className="p-1 text-teal-900 hover:bg-teal-200/50 rounded-full"
            title="Clear voice query"
          >
            <X size={15} />
          </button>
        )}

        <button
          type="button"
          onClick={handleMicVoiceQueryToggle}
          className={`p-2 rounded-full border transition-all ${
            isListeningVoiceQuery
              ? 'bg-danger text-white border-danger animate-pulse'
              : 'bg-teal-700 text-white border-teal-900 hover:bg-teal-900'
          }`}
          title="Voice query"
        >
          <Mic size={16} />
        </button>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.today.searchPlaceholder}
          className="w-full h-12 pl-10 pr-4 bg-surface rounded-card border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        />
      </div>

      {/* Date Strip */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider px-1">
          {t.today.monthLabel}
        </div>
        <DateStrip
          dates={dateStripItems}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setVoiceResult(null);
          }}
        />
      </div>

      {/* Urgent Danger Referral Banner if present */}
      {dangerItems.length > 0 && (
        <Banner
          type="danger"
          title={t.today.dangerBannerTitle}
          message={t.today.dangerBannerMsg(dangerItems.length)}
          guidelineSource="MoHFW Maternal / HBNC Guideline"
        />
      )}

      {/* Timeline Section */}
      <div className="space-y-4 pt-1">
        {/* 1. Danger referrals pinned first in danger style */}
        {dangerItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger px-1">
              <span>⚠️ Urgent Referral Checks ({dangerItems.length})</span>
            </div>
            {dangerItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onMarkDone={handleMarkDone}
                onClick={onOpenFollowUp}
              />
            ))}
          </div>
        )}

        {/* 2. Overdue Section (Saffron style) */}
        {overdueItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-saffron-500 px-1">
              <span>{t.today.overdueSection(overdueItems.length)}</span>
            </div>
            {overdueItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onMarkDone={handleMarkDone}
                onClick={onOpenFollowUp}
              />
            ))}
          </div>
        )}

        {/* 3. Today's Tasks */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900 px-1">
            <span>{t.today.dueTodaySection(todayItems.length)}</span>
          </div>
          {todayItems.length === 0 ? (
            <div className="p-6 text-center rounded-card bg-surface border border-line text-sm text-muted">
              {t.today.emptyToday}
            </div>
          ) : (
            todayItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onMarkDone={handleMarkDone}
                onClick={onOpenFollowUp}
              />
            ))
          )}
        </div>

        {/* 4. Upcoming Tasks */}
        {upcomingItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider px-1">
              Upcoming Visits ({upcomingItems.length})
            </div>
            {upcomingItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onMarkDone={handleMarkDone}
                onClick={onOpenFollowUp}
              />
            ))}
          </div>
        )}

        {/* 5. Completed Section */}
        {doneItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-muted px-1">
              {t.today.completedSection(doneItems.length)}
            </div>
            {doneItems.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Mic Action Button (FAB) in Thumb Zone */}
      <div className="fixed bottom-20 right-5 z-40 max-w-md">
        <button
          type="button"
          onClick={onStartRecord}
          className="w-16 h-16 rounded-full bg-saffron-500 hover:bg-saffron-600 active:scale-95 text-white shadow-xl flex items-center justify-center border-2 border-white transition-all transform focus:outline-none focus:ring-4 focus:ring-saffron-500/30 group"
          aria-label="Start Voice Recording"
          title="Start Voice Home Visit"
        >
          <span className="absolute -inset-1 rounded-full bg-saffron-500/30 animate-ping opacity-60 pointer-events-none" />
          <Mic size={28} className="stroke-[2.5] relative z-10" />
        </button>
      </div>
    </div>
  );
};
