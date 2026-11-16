import { SupportedLanguage } from './index';

// Canonical entity dictionaries across all 7 supported languages
const BENEFICIARY_NAMES: Record<string, Record<SupportedLanguage, string>> = {
  'SYN-0001': {
    en: 'Meena Devi',
    hi: 'मीना देवी',
    ta: 'மீனா தேவி',
    te: 'మీనా దేవి',
    kn: 'ಮೀನಾ ದೇವಿ',
    ml: 'മീനാ ദേവി',
    mr: 'मीना देवी',
  },
  'SYN-0002': {
    en: 'Sunita Baby',
    hi: 'सुनीता का शिशु',
    ta: 'சுனிதா குழந்தை',
    te: 'సునీత పాప',
    kn: 'ಸುನೀತಾ ಮಗು',
    ml: 'സുനിത കുഞ്ഞ്',
    mr: 'सुनीताचे बाळ',
  },
  'SYN-0003': {
    en: 'Pooja Kumari',
    hi: 'पूजा कुमारी',
    ta: 'பூஜா குமாரி',
    te: 'పూజా కుమారి',
    kn: 'ಪೂಜಾ ಕುಮಾರಿ',
    ml: 'പൂജാ കുമാരി',
    mr: 'पूजा कुमारी',
  },
  'SYN-0004': {
    en: 'Aarav Singh',
    hi: 'आरव सिंह',
    ta: 'ஆரவ் சிங்',
    te: 'ఆరవ్ సింగ్',
    kn: 'ಆರವ್ ಸಿಂಗ್',
    ml: 'ആരവ് സിംഗ്',
    mr: 'आरव सिंग',
  },
  'SYN-0005': {
    en: 'Rekha Pal',
    hi: 'रेखा पाल',
    ta: 'ரேகா பால்',
    te: 'రేఖ పాల్',
    kn: 'ರೇಖಾ ಪಾಲ್',
    ml: 'രേഖ പാൽ',
    mr: 'रेखा पाल',
  },
  'SYN-0006': {
    en: 'Kavita Verma',
    hi: 'कविता वर्मा',
    ta: 'கவிதா வர்மா',
    te: 'కవిత వర్మ',
    kn: 'ಕವಿತಾ ವರ್ಮಾ',
    ml: 'കവിത വർമ്മ',
    mr: 'कविता वर्मा',
  },
  'SYN-0007': {
    en: 'Gita Devi Baby',
    hi: 'गीता देवी का शिशु',
    ta: 'கீதா தேவி குழந்தை',
    te: 'గీతా దేవి పాప',
    kn: 'ಗೀತಾ ದೇವಿ ಮಗು',
    ml: 'ഗീതാ ദേവി കുഞ്ഞ്',
    mr: 'गीता देवीचे बाळ',
  },
  'SYN-0008': {
    en: 'Manish Yadav',
    hi: 'मनीष यादव',
    ta: 'மனிஷ் யாதவ்',
    te: 'మనీష్ యాదవ్',
    kn: 'ಮನೀಶ್ ಯಾದವ್',
    ml: 'മനീഷ് യാദവ്',
    mr: 'मनीष यादव',
  },
};

const VILLAGE_NAMES: Record<string, Record<SupportedLanguage, string>> = {
  Rampur: {
    en: 'Rampur',
    hi: 'रामपुर',
    ta: 'ராம்பூர்',
    te: 'రాంపూర్',
    kn: 'ರಾಮ್‌ಪುರ',
    ml: 'രാംപൂർ',
    mr: 'रामपूर',
  },
  Kishanpur: {
    en: 'Kishanpur',
    hi: 'किशनपुर',
    ta: 'கிஷன்பூர்',
    te: 'కిషన్‌పూర్',
    kn: 'ಕಿಶನ್‌ಪುರ',
    ml: 'കിഷൻപൂർ',
    mr: 'किशनपूर',
  },
};

const TASK_TYPES: Record<string, Record<SupportedLanguage, string>> = {
  anc_3: {
    en: 'ANC Checkup 3',
    hi: 'ANC जांच 3',
    ta: 'ANC பரிசோதனை 3',
    te: 'ANC తనిఖీ 3',
    kn: 'ANC ತಪಾಸಣೆ 3',
    ml: 'ANC പരിശോധന 3',
    mr: 'ANC तपासणी ३',
  },
  anc_4: {
    en: 'ANC Checkup 4',
    hi: 'ANC जांच 4',
    ta: 'ANC பரிசோதனை 4',
    te: 'ANC తనిఖీ 4',
    kn: 'ANC ತಪಾಸಣೆ 4',
    ml: 'ANC പരിശോധന 4',
    mr: 'ANC तपासणी ४',
  },
  hbnc_14: {
    en: 'HBNC Home Visit Day 14',
    hi: 'HBNC गृह-भेंट दिन 14',
    ta: 'HBNC இல்லப் பார்வை நாள் 14',
    te: 'HBNC గృహ సందర్శన దినం 14',
    kn: 'HBNC ಮನೆ ಭೇಟಿ ದಿನ 14',
    ml: 'HBNC ഭവന സന്ദർശനം ദിവസം 14',
    mr: 'HBNC गृहभेट दिवस १४',
  },
  hbnc_7: {
    en: 'HBNC Home Visit Day 7',
    hi: 'HBNC गृह-भेंट दिन 7',
    ta: 'HBNC இல்லப் பார்வை நாள் 7',
    te: 'HBNC గృహ సందర్శన దినం 7',
    kn: 'HBNC ಮನೆ ಭೇಟಿ ದಿನ 7',
    ml: 'HBNC ഭവന സന്ദർശനം ദിവസം 7',
    mr: 'HBNC गृहभेट दिवस ७',
  },
  danger_bp: {
    en: 'Emergency Danger Sign Referral (High BP)',
    hi: 'खतरे का लक्षण रेफरल (हाई BP)',
    ta: 'அவசர ஆபத்து பரிந்துரை (உயர் ரத்த அழுத்தம்)',
    te: 'అత్యవసర ప్రమాద రిఫరల్ (హై BP)',
    kn: 'ತುರ್ತು ಅಪಾಯದ ರೆಫರಲ್ (ಅಧಿಕ ರಕ್ತದೊತ್ತಡ)',
    ml: 'അടിയന്തിര അപകട റഫറൽ (ഉയർന്ന രക്തസമ്മർദ്ദം)',
    mr: 'धोक्याचे लक्षण रेफरल (उच्च रक्तदाब)',
  },
  immunisation_mr1: {
    en: 'Immunisation (Measles-Rubella 1)',
    hi: 'टीकाकरण (खसरा-रूबेला 1)',
    ta: 'தடுப்பூசி (மீசல்ஸ்-ரூபெல்லா 1)',
    te: 'టీకా (మీజిల్స్-రుబెల్లా 1)',
    kn: 'ಲಸಿಕೆ (ದಡಾರ-ರುಬೆಲ್ಲಾ 1)',
    ml: 'പ്രതിരോധ കുത്തിവയ്പ്പ് (എംആർ 1)',
    mr: 'लसीकरण (गोवर-रुबेला १)',
  },
  anc_ifa_2: {
    en: 'IFA Tablets & ANC Checkup 2',
    hi: 'IFA गोलियां व ANC जांच 2',
    ta: 'IFA மாத்திரைகள் & ANC பார்வை 2',
    te: 'IFA మాత్రలు & ANC తనిఖీ 2',
    kn: 'IFA ಮಾತ್ರೆಗಳು & ANC ಭೇಟಿ 2',
    ml: 'IFA ഗുളികകൾ & ANC സന്ദർശനം 2',
    mr: 'IFA गोळ्या आणि ANC तपासणी २',
  },
};

/**
 * Strips any legacy bilingual brackets like "पूजा कुमारी (Pooja Kumari)" -> "Pooja Kumari"
 */
function cleanLegacyString(raw: string): string {
  if (!raw) return '';
  // If string contains pattern "Hindi (English)" -> extract English
  const match = raw.match(/\(([^)]+)\)/);
  if (match && match[1] && /[a-zA-Z]/.test(match[1])) {
    return match[1].trim();
  }
  // Strip any trailing / leading Hindi characters if looking for clean English
  return raw.replace(/[\u0900-\u097F]/g, '').replace(/[/(]/g, '').replace(/[)]/g, '').trim() || raw;
}

/**
 * Returns the localized beneficiary name based on code or raw string
 */
export function getLocalizedBeneficiaryName(code: string, rawName: string, lang: SupportedLanguage): string {
  if (BENEFICIARY_NAMES[code] && BENEFICIARY_NAMES[code][lang]) {
    return BENEFICIARY_NAMES[code][lang];
  }
  if (lang === 'en') {
    return cleanLegacyString(rawName);
  }
  return rawName;
}

/**
 * Returns the localized village name
 */
export function getLocalizedVillageName(rawVillage: string, lang: SupportedLanguage): string {
  const clean = cleanLegacyString(rawVillage);
  if (clean.toLowerCase().includes('rampur') && VILLAGE_NAMES.Rampur[lang]) {
    return VILLAGE_NAMES.Rampur[lang];
  }
  if (clean.toLowerCase().includes('kishanpur') && VILLAGE_NAMES.Kishanpur[lang]) {
    return VILLAGE_NAMES.Kishanpur[lang];
  }
  return lang === 'en' ? clean : rawVillage;
}

/**
 * Returns the localized follow-up / visit task type
 */
export function getLocalizedTaskType(rawType: string, lang: SupportedLanguage): string {
  const lower = rawType.toLowerCase();
  if (lower.includes('checkup 4') || lower.includes('anc 4')) {
    return TASK_TYPES.anc_4[lang] || rawType;
  }
  if (lower.includes('checkup 3') || lower.includes('anc 3') || lower.includes('anc') && lower.includes('3')) {
    return TASK_TYPES.anc_3[lang] || rawType;
  }
  if (lower.includes('14') || lower.includes('day 14')) {
    return TASK_TYPES.hbnc_14[lang] || rawType;
  }
  if (lower.includes('day 7') || lower.includes('दिन 7')) {
    return TASK_TYPES.hbnc_7[lang] || rawType;
  }
  if (lower.includes('danger') || lower.includes('high bp') || lower.includes('bp') || lower.includes('खतरे')) {
    return TASK_TYPES.danger_bp[lang] || rawType;
  }
  if (lower.includes('measles') || lower.includes('mr') || lower.includes('टीकाकरण')) {
    return TASK_TYPES.immunisation_mr1[lang] || rawType;
  }
  if (lower.includes('ifa') || lower.includes('anc 2') || lower.includes('गोली')) {
    return TASK_TYPES.anc_ifa_2[lang] || rawType;
  }

  if (lang === 'en') {
    return cleanLegacyString(rawType);
  }
  return rawType;
}

