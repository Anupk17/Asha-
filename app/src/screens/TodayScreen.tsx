import React, { useState, useEffect } from 'react';
import { Search, Sun } from 'lucide-react';
import { DateStrip, DateItem } from '../components/ui/DateStrip';
import { TimelineItem } from '../components/ui/TimelineItem';
import { Banner } from '../components/ui/Banner';
import { SyncBadge } from '../components/ui/SyncBadge';
import { FollowUp } from '@asha/shared';
import { getFollowUps, markFollowUpDone } from '../data/repository';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';

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
  const [isLoading, setIsLoading] = useState(true);

  const uid = 'demo-asha-worker-01';

  const loadFollowUps = async () => {
    setIsLoading(true);
    try {
      const data = await getFollowUps(uid);
      setFollowups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, []);

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
    { date: new Date('2026-11-17'), dateString: '2026-11-17', dayLabel: days[4], dayNumber: 17, isToday: false, hasItems: false },
    { date: new Date('2026-11-18'), dateString: '2026-11-18', dayLabel: days[5], dayNumber: 18, isToday: false, hasItems: true },
    { date: new Date('2026-11-19'), dateString: '2026-11-19', dayLabel: days[6], dayNumber: 19, isToday: false, hasItems: false },
  ];

  const handleMarkDone = async (id: string) => {
    await markFollowUpDone(uid, id);
    setFollowups((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'done' as const } : item))
    );
    showToast(t.today.doneToast, 'success');
  };

  const filtered = followups.filter((f) =>
    f.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.beneficiary_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dangerItems = filtered.filter((f) => f.is_danger_referral && f.status !== 'done');
  const overdueItems = filtered.filter((f) => f.status === 'overdue' && !f.is_danger_referral);
  const todayItems = filtered.filter((f) => f.due_date === selectedDate && f.status !== 'done' && !f.is_danger_referral);
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
          onSelectDate={setSelectedDate}
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
        {/* Danger referrals pinned first */}
        {dangerItems.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            onMarkDone={handleMarkDone}
            onClick={onOpenFollowUp}
          />
        ))}

        {/* Overdue Section */}
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

        {/* Today's Tasks */}
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

        {/* Completed Section */}
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
    </div>
  );
};
