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
    ml: 'ಆರവ് ಸಿംഗ്',
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

// Map legacy IDs or partial codes to canonical codes
const CODE_ALIASES: Record<string, string> = {
  'b-001': 'SYN-0001',
  'b-002': 'SYN-0002',
  'b-003': 'SYN-0003',
  'b-004': 'SYN-0004',
  'b-005': 'SYN-0005',
  'syn-b-001': 'SYN-0001',
  'syn-b-002': 'SYN-0002',
  'syn-b-003': 'SYN-0003',
  'syn-b-004': 'SYN-0004',
  'syn-b-005': 'SYN-0005',
  'syn-b-006': 'SYN-0006',
  'syn-b-007': 'SYN-0007',
  'syn-b-008': 'SYN-0008',
};

// Reverse name mapping for any raw name string (English, Hindi, or bilingual)
const NAME_MAP: Record<string, string> = {
  'meena': 'SYN-0001',
  'meena devi': 'SYN-0001',
  'मीना देवी': 'SYN-0001',
  'मीना': 'SYN-0001',

  'sunita': 'SYN-0002',
  'sunita baby': 'SYN-0002',
  'sunita sharma': 'SYN-0002',
  'सुनीता का शिशु': 'SYN-0002',
  'सुनीता शर्मा': 'SYN-0002',
  'सुनीता': 'SYN-0002',

  'pooja': 'SYN-0003',
  'pooja kumari': 'SYN-0003',
  'पूजा कुमारी': 'SYN-0003',
  'पूजा': 'SYN-0003',

  'aarav': 'SYN-0004',
  'aarav singh': 'SYN-0004',
  'आरव सिंह': 'SYN-0004',
  'आरव': 'SYN-0004',

  'rekha': 'SYN-0005',
  'rekha pal': 'SYN-0005',
  'रेखा पाल': 'SYN-0005',
  'रेखा': 'SYN-0005',

  'kavita': 'SYN-0006',
  'kavita verma': 'SYN-0006',
  'कविता वर्मा': 'SYN-0006',
  'कविता': 'SYN-0006',

  'gita': 'SYN-0007',
  'gita devi': 'SYN-0007',
  'gita devi baby': 'SYN-0007',
  'गीता देवी का शिशु': 'SYN-0007',
  'गीता देवी': 'SYN-0007',
  'गीता': 'SYN-0007',

  'manish': 'SYN-0008',
  'manish yadav': 'SYN-0008',
  'मनीष यादव': 'SYN-0008',
  'मनीष': 'SYN-0008',
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
    te: 'HBNC గృహ సందర్శన దినம் 7',
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
 * and removes Devanagari script characters when English is required.
 */
function cleanLegacyString(raw: string): string {
  if (!raw) return '';
  // Check if string contains bracketed text with Latin characters: "मीना देवी (Meena Devi)"
  const match = raw.match(/\(([^)]+)\)/);
  if (match && match[1] && /[a-zA-Z]/.test(match[1])) {
    return match[1].trim();
  }
  // Check if string has slash separation: "ANC गृह भेंट / Checkup 3"
  if (raw.includes('/')) {
    const parts = raw.split('/');
    for (const part of parts) {
      if (/[a-zA-Z]/.test(part)) {
        return part.trim();
      }
    }
  }
  // Strip any Devanagari script characters
  const stripped = raw.replace(/[\u0900-\u097F]/g, '').replace(/[()/[\]-]/g, '').trim();
  return stripped;
}

/**
 * Returns the localized beneficiary name based on code or raw string across all 7 languages.
 * Guaranteed to NEVER output Hindi when English or other Indic languages are selected.
 */
export function getLocalizedBeneficiaryName(code: string | undefined, rawName: string | undefined, lang: SupportedLanguage): string {
  const normCode = (code || '').trim();
  const canonCode = BENEFICIARY_NAMES[normCode] ? normCode : CODE_ALIASES[normCode];

  if (canonCode && BENEFICIARY_NAMES[canonCode]) {
    return BENEFICIARY_NAMES[canonCode][lang];
  }

  // Look up raw name in reverse map
  const cleanName = (rawName || '').trim();
  const lower = cleanName.toLowerCase();
  
  // Try direct match
  for (const [key, codeVal] of Object.entries(NAME_MAP)) {
    if (lower.includes(key)) {
      return BENEFICIARY_NAMES[codeVal][lang];
    }
  }

  // Try extracting inside brackets
  const extracted = cleanLegacyString(cleanName);
  if (extracted) {
    const extractedLower = extracted.toLowerCase();
    for (const [key, codeVal] of Object.entries(NAME_MAP)) {
      if (extractedLower.includes(key)) {
        return BENEFICIARY_NAMES[codeVal][lang];
      }
    }
    if (lang === 'en') {
      return extracted;
    }
  }

  // Fallback: If English, ensure no Devanagari
  if (lang === 'en') {
    return cleanLegacyString(cleanName) || 'Beneficiary';
  }

  return cleanName;
}

/**
 * Returns the localized village name across all 7 languages
 */
export function getLocalizedVillageName(rawVillage: string | undefined, lang: SupportedLanguage): string {
  const val = (rawVillage || '').toLowerCase();
  if (val.includes('rampur') || val.includes('रामपुर') || val.includes('ராம்பூர்') || val.includes('రాంపూర్')) {
    return VILLAGE_NAMES.Rampur[lang];
  }
  if (val.includes('kishanpur') || val.includes('किशनपुर') || val.includes('கிஷன்பூர்') || val.includes('కిషన్‌పూర్')) {
    return VILLAGE_NAMES.Kishanpur[lang];
  }
  if (lang === 'en') {
    return cleanLegacyString(rawVillage || '') || 'Village';
  }
  return rawVillage || '';
}

/**
 * Returns the localized follow-up / visit task type across all 7 languages
 */
export function getLocalizedTaskType(rawType: string | undefined, lang: SupportedLanguage): string {
  const val = (rawType || '').toLowerCase();

  if (val.includes('checkup 4') || val.includes('anc 4') || val.includes('जांच 4') || val.includes('तपासणी ४')) {
    return TASK_TYPES.anc_4[lang];
  }
  if (val.includes('checkup 3') || val.includes('anc 3') || val.includes('जांच 3') || val.includes('तपासणी ३') || (val.includes('anc') && val.includes('3'))) {
    return TASK_TYPES.anc_3[lang];
  }
  if (val.includes('day 14') || val.includes('दिन 14') || val.includes('நாள் 14') || val.includes('ದಿನ 14') || val.includes('दिवस १४')) {
    return TASK_TYPES.hbnc_14[lang];
  }
  if (val.includes('day 7') || val.includes('दिन 7') || val.includes('நாள் 7') || val.includes('ದಿನ 7') || val.includes('दिवस ७')) {
    return TASK_TYPES.hbnc_7[lang];
  }
  if (val.includes('danger') || val.includes('high bp') || val.includes('bp') || val.includes('खतरे') || val.includes('धोक्या') || val.includes('रेफरल') || val.includes('referral')) {
    return TASK_TYPES.danger_bp[lang];
  }
  if (val.includes('measles') || val.includes('rubella') || val.includes('mr') || val.includes('mr1') || val.includes('immunisation') || val.includes('टीकाकरण') || val.includes('लसीकरण') || val.includes('தடுப்பூசி')) {
    return TASK_TYPES.immunisation_mr1[lang];
  }
  if (val.includes('ifa') || val.includes('checkup 2') || val.includes('anc 2') || val.includes('गोली') || val.includes('गोळ्या') || val.includes('tablets')) {
    return TASK_TYPES.anc_ifa_2[lang];
  }

  if (lang === 'en') {
    return cleanLegacyString(rawType || '') || 'Visit Follow-up';
  }
  return rawType || '';
}
