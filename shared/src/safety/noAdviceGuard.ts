import { SupportedLanguage } from '../index';

export interface GuardEvaluationResult {
  isBlocked: boolean;
  reason?: 'medicine_request' | 'dosage_request' | 'diagnosis_request' | 'treatment_request';
  matchedPattern?: string;
  refusalMessage: string;
}

const NO_ADVICE_FALLBACKS: Record<SupportedLanguage, string> = {
  en: 'I cannot give medical advice or prescribe medicine. Please speak to the ANM or doctor at the PHC.',
  hi: 'मैं कोई चिकित्सीय सलाह या दवा नहीं दे सकता। कृपया PHC पर ANM या डॉक्टर से परामर्श करें।',
  ta: 'நான் மருத்துவ ஆலோசனையோ மருந்தோ வழங்க முடியாது. தயவுசெய்து PHC-யில் உள்ள ANM அல்லது மருத்துவரை அணுகவும்.',
  te: 'నేను ఎలాంటి వైద్య సలహాలు లేదా మందులు ఇవ్వలేను. దయచేసి PHC లోని ANM లేదా డాక్టర్‌ను సంప్రదించండి.',
  kn: 'ನಾನು ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಅಥವಾ ಔಷಧವನ್ನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು PHC ಯಲ್ಲಿರುವ ANM ಅಥವಾ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  ml: 'എനിക്ക് വൈദ്യോപദേശമോ മരുന്നോ നൽകാൻ കഴിയില്ല. ദയവായി പിഎച്ച്സിയിലെ എഎൻഎം അല്ലെങ്കിൽ ഡോക്ടറെ സമീപിക്കുക.',
  mr: 'मी कोणताही वैद्यकीय सल्ला किंवा औषध देऊ शकत नाही. कृपया PHC मधील ANM किंवा डॉक्टरांशी संपर्क साधा.',
};

/**
 * Regex patterns identifying adversarial queries seeking medical advice, drug prescriptions,
 * dosage calculations, or clinical diagnosis.
 */
const MEDICINE_PATTERNS = [
  // English
  /\b(what|which|can i give|should i give|recommend|prescribe)\b.*\b(medicine|tablet|drug|syrup|paracetamol|pcm|antibiotic|injection|pill|dose|dosage)\b/i,
  /\b(medicine|drug|tablet|pill|syrup|dosage|dose|prescription)\s+(to give|should be given|recommendation|for fever|for pain|for cough)/i,
  /\bhow much (paracetamol|syrup|medicine|mg|ml|dose|dosage)\b/i,
  /\b(prescribe|dispense|suggest medicine)\b/i,

  // Hindi & Hinglish
  /\b(dawa|dawā|dawai|dawaai|goli|khurak)\b.*\b(du|deni|de sakte|chahiye|batao|kya hai)\b/i,
  /\b(kaunsi|kya|kitni)\s+(dawa|dawai|goli|khurak|medicine)\b/i,
  /\b(paracetamol|syrup|injection|pcm)\s+(kitna|kaise|du|dena)\b/i,
  /(दवा|दवाई|गोली|खुराक).*(दूं|देनी|बताओ|क्या दें|कितनी)/,
  /(कौनसी|क्या|कितनी).*(दवा|दवाई|गोली|खुराक)/,

  // Tamil
  /(மருந்து|மாத்திரை|அளவு).*(கொடுக்க|பரிந்துரை|என்ன)/,
  /(என்ன).*(மருந்து|மாத்திரை)/,

  // Telugu
  /(మందు|మందులు|మోతాదు).*(ఇవ్వాలి|చెప్పండి|ఏమిటి)/,
  /(ఏ).*(మందు|మందులు)/,

  // Kannada
  /(ಔಷಧ|ಮಾತ್ರೆ|ಪ್ರಮಾಣ).*(ಕೊಡಬೇಕು|ಹೇಳಿ|ಯಾವ)/,
  /(ಯಾವ).*(ಔಷಧ|ಮಾತ್ರೆ)/,

  // Malayalam
  /(മരുന്ന്|ഗുളിക).*(നൽകണം|ഏതാണ്|എത്ര)/,
  /(ഏത്).*(മരുന്ന്|ഗുളിക)/,

  // Marathi
  /(औषध|गोळी|डोस).*(द्यावे|सांगा|कोणते)/,
  /(कोणते).*(औषध|गोळी)/,
];

const DIAGNOSIS_PATTERNS = [
  // English
  /\b(diagnose|what disease|what illness|what infection|is this malaria|is this pneumonia|is this typhoid)\b/i,
  /\b(tell me the diagnosis|what is wrong with|what condition does)\b/i,

  // Hindi & Hinglish
  /\b(kya bimari|kaunsi bimari|kya rog|bimari kya hai)\b/i,
  /(क्या बीमारी|कौन सी बीमारी|क्या रोग)/,

  // Regional
  /(என்ன நோய்|ఏ వ్యాధి|ಯಾವ ರೋಗ|ഏത് രോഗം|कोणता आजार)/,
];

const TREATMENT_PATTERNS = [
  // English
  /\b(how to treat|how to cure|home remedy for|treatment for|cure for)\b/i,
  // Hindi & Hinglish
  /\b(kaise theek kare|ilaj kya hai|kya ilaj|upchar kya hai|gharelu nuskha)\b/i,
  /(इलाज क्या|उपचार क्या|कैसे ठीक करें|घरेलू नुस्खा)/,
  // Regional
  /(சிகிச்சை என்ன|చికిత్స ఏమిటి|ಚಿಕಿತ್ಸೆ ಏನು|ചികിത്സ എന്താണ്|उपचार काय)/,
];

/**
 * Checks an incoming utterance against clinical safety policies.
 * If the user is asking for medical advice, treatment, diagnosis, or medicines,
 * it blocks the request and outputs the official fallback.
 */
export function evaluateNoAdviceGuard(utterance: string, lang: SupportedLanguage = 'en'): GuardEvaluationResult {
  const text = (utterance || '').trim();
  const fallback = NO_ADVICE_FALLBACKS[lang] || NO_ADVICE_FALLBACKS.en;

  if (!text) {
    return { isBlocked: false, refusalMessage: fallback };
  }

  // 1. Check medicine requests
  for (const pattern of MEDICINE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isBlocked: true,
        reason: 'medicine_request',
        matchedPattern: pattern.source,
        refusalMessage: fallback,
      };
    }
  }

  // 2. Check diagnosis requests
  for (const pattern of DIAGNOSIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isBlocked: true,
        reason: 'diagnosis_request',
        matchedPattern: pattern.source,
        refusalMessage: fallback,
      };
    }
  }

  // 3. Check treatment advice requests
  for (const pattern of TREATMENT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isBlocked: true,
        reason: 'treatment_request',
        matchedPattern: pattern.source,
        refusalMessage: fallback,
      };
    }
  }

  return {
    isBlocked: false,
    refusalMessage: fallback,
  };
}

