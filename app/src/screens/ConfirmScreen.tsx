import React, { useState } from 'react';
import { Banner } from '../components/ui/Banner';
import { FieldRow } from '../components/ui/FieldRow';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Volume2, CheckCircle2, RotateCcw, AlertTriangle, User, Calendar, Scale, Syringe, Thermometer } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { getLocalizedBeneficiaryName, getLocalizedVillageName, getLocalizedTaskType } from '../i18n/localize';

export interface ConfirmScreenProps {
  onSave: (confirmedData: any) => void;
  onRetake: () => void;
}

export const ConfirmScreen: React.FC<ConfirmScreenProps> = ({
  onSave,
  onRetake,
}) => {
  const { language } = useAppStore();
  const t = getT(language);

  const dangerSignText: Record<string, string> = {
    en: 'Severe Headache / Blurred Vision (High BP Alert)',
    hi: 'तीव्र सिरदर्द / धुंधला दिखना (हाई BP लक्षण)',
    ta: 'கடுமையான தலைவலி / பார்வை மங்குதல் (உயர் ரத்த அழுத்தம்)',
    te: 'తీవ్ర తలనొప్పి / కంటి చూపు మసకబారడం (హై BP)',
    kn: 'ತೀವ್ರ ತಲೆನೋವು / ಮಂದ ದೃಷ್ಟಿ (ಅಧಿಕ ರಕ್ತದೊತ್ತಡ)',
    ml: 'കഠിനമായ തലവേദന / കാഴ്ച മങ്ങൽ (ഉയർന്ന രക്തസമ്മർദ്ദം)',
    mr: 'तीव्र डोकेदुखी / अंधुक दिसणे (उच्च रक्तदाब)',
  };

  const unknownItemText: Record<string, string> = {
    en: 'Temperature not measured in Fahrenheit',
    hi: 'तापमान डिग्री फारेनहाइट में नहीं नापा',
    ta: 'வெப்பநிலை ஃபாரன்ஹீட்டில் அளவிடப்படவில்லை',
    te: 'ఉష్ణోగ్రత ఫారెన్‌హీట్‌లో కొలవబడలేదు',
    kn: 'ತಾಪಮಾನವನ್ನು ಫ್ಯಾರನ್‌ಹೀಟ್‌ನಲ್ಲಿ ಅಳೆಯಲಾಗಿಲ್ಲ',
    ml: 'താപനില ഫാരൻഹീറ്റിൽ അളന്നിട്ടില്ല',
    mr: 'तापमान फॅरेनहाइटमध्ये मोजले नाही',
  };

  const [formData] = useState({
    beneficiary_name: 'Pooja Kumari',
    beneficiary_code: 'SYN-0003',
    village: 'Kishanpur',
    visit_type: 'ANC Checkup 3',
    weight_kg: 58.0,
    temperature_c: 37.2,
    breaths_per_min: 22,
    vaccinations_due: 'TT 2 Booster',
    next_visit_date: '2026-11-20',
  });

  const [hasDanger] = useState(true);
  const [editedField, setEditedField] = useState<string | null>('weight_kg');

  const handleEdit = (fieldName: string) => {
    setEditedField(fieldName);
    setTimeout(() => setEditedField(null), 2000);
  };

  const localizedName = getLocalizedBeneficiaryName(formData.beneficiary_code, formData.beneficiary_name, language);
  const localizedVillage = getLocalizedVillageName(formData.village, language);
  const localizedVisitType = getLocalizedTaskType(formData.visit_type, language);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Danger Sign Banner at the very top if flagged */}
      {hasDanger && (
        <Banner
          type="danger"
          title={t.confirm.dangerAlertTitle}
          message={t.confirm.dangerAlertMsg}
          guidelineSource={t.confirm.guidelineRefTag}
        />
      )}

      {/* Readback voice prompt notice */}
      <div className="flex items-center justify-between p-3 rounded-card bg-teal-100 text-teal-900 border border-teal-700/20 text-xs">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-teal-900 shrink-0" />
          <span>{t.confirm.readbackNotice}</span>
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="text-teal-900 font-bold underline ml-2 hover:opacity-80"
        >
          {t.confirm.listenAgain}
        </button>
      </div>

      {/* Unknown / Not checked chips */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted">{t.confirm.notCheckedTitle}</div>
        <div className="flex flex-wrap gap-1.5">
          <Chip variant="neutral" size="sm">
            ⚠️ {unknownItemText[language] || unknownItemText.en}
          </Chip>
        </div>
      </div>

      {/* Form Field Rows */}
      <div className="space-y-2">
        <FieldRow
          label={t.confirm.beneficiaryLabel}
          value={`${localizedName} (${formData.beneficiary_code}) - ${localizedVillage}`}
          icon={<User size={18} />}
          onTap={() => handleEdit('beneficiary')}
        />

        <FieldRow
          label={t.confirm.visitTypeLabel}
          value={localizedVisitType}
          icon={<Calendar size={18} />}
          onTap={() => handleEdit('visit_type')}
        />

        <FieldRow
          label={t.confirm.weightLabel}
          value={formData.weight_kg}
          unit="kg"
          isEdited={editedField === 'weight_kg'}
          icon={<Scale size={18} />}
          onTap={() => handleEdit('weight_kg')}
        />

        <FieldRow
          label={t.confirm.tempLabel}
          value={formData.temperature_c}
          unit="°C"
          icon={<Thermometer size={18} />}
          onTap={() => handleEdit('temperature')}
        />

        <FieldRow
          label={t.confirm.vaccinationsLabel}
          value={formData.vaccinations_due}
          icon={<Syringe size={18} />}
          onTap={() => handleEdit('vaccinations')}
        />

        <FieldRow
          label={t.confirm.nextVisitDateLabel}
          value={formData.next_visit_date}
          icon={<Calendar size={18} />}
          onTap={() => handleEdit('next_date')}
        />

        <FieldRow
          label={t.confirm.dangerSignsLabel}
          value={dangerSignText[language] || dangerSignText.en}
          isDanger={true}
          icon={<AlertTriangle size={18} className="text-danger" />}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<CheckCircle2 size={22} />}
          onClick={() => onSave(formData)}
        >
          {t.confirm.confirmAndSave}
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={<RotateCcw size={18} />}
          onClick={onRetake}
        >
          {t.confirm.reRecord}
        </Button>
      </div>
    </div>
  );
};
