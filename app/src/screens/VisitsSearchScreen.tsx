import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Baby, Heart, Plus, MapPin, Calendar } from 'lucide-react';
import { Beneficiary, BeneficiaryType } from '@asha/shared';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { getBeneficiaries } from '../data/repository';
import { searchBeneficiaries } from '../utils/search';
import { seedDatabase } from '../data/seed';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { getLocalizedBeneficiaryName, getLocalizedVillageName } from '../i18n/localize';

export interface VisitsSearchScreenProps {
  onSelectBeneficiary?: (b: Beneficiary) => void;
  onNewBeneficiary?: () => void;
}

export const VisitsSearchScreen: React.FC<VisitsSearchScreenProps> = ({
  onSelectBeneficiary,
  onNewBeneficiary,
}) => {
  const { showToast, language } = useAppStore();
  const t = getT(language);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const uid = 'demo-asha-worker-01';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getBeneficiaries(uid);
      setBeneficiaries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDatabase(uid);
      await loadData();
      showToast(
        language === 'en'
          ? `Seeded ${res.beneficiaries} beneficiaries & ${res.visits} visits!`
          : `डेटा लोड: ${res.beneficiaries} लाभार्थी व ${res.visits} विज़िट!`,
        'success'
      );
    } catch (e) {
      showToast('Error seeding demo data', 'danger');
    } finally {
      setIsSeeding(false);
    }
  };

  const searchResults = searchBeneficiaries(beneficiaries, query);

  const filtered = searchResults.filter((b) => {
    return filterType === 'all' || b.type === filterType;
  });

  const getTypeLabel = (type: BeneficiaryType) => {
    switch (type) {
      case 'pregnant':
        return {
          label: t.beneficiaries.pregnant,
          color: 'teal' as const,
          icon: <Heart size={12} />,
        };
      case 'newborn':
        return {
          label: t.beneficiaries.newborn,
          color: 'saffron' as const,
          icon: <Baby size={12} />,
        };
      case 'child':
        return {
          label: t.beneficiaries.child,
          color: 'neutral' as const,
          icon: <UserCheck size={12} />,
        };
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Dev notice banner: All data is synthetic */}
      <div className="p-2.5 rounded-card bg-cream border border-line text-[11px] text-muted flex items-center justify-between">
        <span className="font-medium">{t.beneficiaries.seedNotice}</span>
        <button
          type="button"
          onClick={handleSeed}
          disabled={isSeeding}
          className="text-teal-900 font-bold underline hover:opacity-80 disabled:opacity-50"
        >
          {isSeeding ? t.beneficiaries.seeding : t.beneficiaries.seedButton}
        </button>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            {t.beneficiaries.title}
          </h2>
          <p className="text-xs text-muted">
            {t.beneficiaries.totalRegistered(beneficiaries.length)}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewBeneficiary}
          className="h-10 px-3 rounded-btn bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-soft hover:bg-teal-700"
        >
          <Plus size={16} />
          <span>{t.beneficiaries.addNew}</span>
        </button>
      </div>

      {/* Fuzzy Search Bar with Hinglish tolerance */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.beneficiaries.searchPlaceholder}
          className="w-full h-12 pl-10 pr-4 bg-surface rounded-card border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: t.beneficiaries.all },
          { id: 'pregnant', label: t.beneficiaries.pregnant },
          { id: 'newborn', label: t.beneficiaries.newborn },
          { id: 'child', label: t.beneficiaries.child },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilterType(item.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              filterType === item.id
                ? 'bg-teal-900 text-white border-teal-900'
                : 'bg-surface text-ink border-line hover:border-teal-700/30'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Beneficiary List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted">
            Loading...
          </div>
        ) : filtered.map((b) => {
          const typeInfo = getTypeLabel(b.type);
          const localizedName = getLocalizedBeneficiaryName(b.code, b.name, language);
          const localizedVillage = getLocalizedVillageName(b.village, language);

          return (
            <Card
              key={b.id}
              interactive
              onClick={() => onSelectBeneficiary?.(b)}
              className="space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">{localizedName}</h3>
                    <Chip variant={typeInfo.color} size="sm" icon={typeInfo.icon}>
                      {typeInfo.label}
                    </Chip>
                  </div>
                  <div className="text-xs text-muted font-medium mt-0.5">
                    {t.beneficiaries.idPrefix}{b.code}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1 border-t border-line/50">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-teal-700" />
                  {localizedVillage}
                </span>
                {b.expected_delivery_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {t.beneficiaries.eddPrefix}{b.expected_delivery_date}
                  </span>
                )}
                {b.date_of_birth && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {t.beneficiaries.dobPrefix}{b.date_of_birth}
                  </span>
                )}
              </div>
            </Card>
          );
        })}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted">
            {t.beneficiaries.noResults}
          </div>
        )}
      </div>
    </div>
  );
};
