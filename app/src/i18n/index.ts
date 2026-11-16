export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'ml' | 'kn' | 'te' | 'mr';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export interface Translations {
  appName: string;
  tagline: string;
  tabs: {
    today: string;
    beneficiaries: string;
    record: string;
    map: string;
    month: string;
  };
  today: {
    greeting: string;
    subGreeting: string;
    searchPlaceholder: string;
    monthLabel: string;
    dangerBannerTitle: string;
    dangerBannerMsg: (count: number) => string;
    overdueSection: (count: number) => string;
    dueTodaySection: (count: number) => string;
    completedSection: (count: number) => string;
    emptyToday: string;
    markDone: string;
    dueOn: string;
    urgentDangerBadge: string;
    overdueBadge: string;
    doneToast: string;
  };
  recording: {
    aiDisclosureTitle: string;
    aiDisclosureMsg: string;
    liveFieldsTitle: string;
    transcriptTitle: string;
    listening: string;
    tapToSpeak: string;
    cancel: string;
    finish: string;
    pcmLabel: string;
  };
  confirm: {
    dangerAlertTitle: string;
    dangerAlertMsg: string;
    guidelineRefTag: string;
    readbackNotice: string;
    listenAgain: string;
    notCheckedTitle: string;
    beneficiaryLabel: string;
    visitTypeLabel: string;
    weightLabel: string;
    tempLabel: string;
    vaccinationsLabel: string;
    nextVisitDateLabel: string;
    dangerSignsLabel: string;
    confirmAndSave: string;
    reRecord: string;
    savedSuccessToast: string;
  };
  beneficiaries: {
    title: string;
    totalRegistered: (count: number) => string;
    addNew: string;
    searchPlaceholder: string;
    all: string;
    pregnant: string;
    newborn: string;
    child: string;
    idPrefix: string;
    eddPrefix: string;
    dobPrefix: string;
    noResults: string;
    seedNotice: string;
    seedButton: string;
    seeding: string;
  };
  map: {
    filterAll: string;
    filterToday: string;
    filterDanger: string;
    filterOverdue: string;
    recentVisit: string;
    referralPending: string;
    overdueVaccine: string;
    upcomingVisit: string;
    navigate: string;
    startVisit: string;
    dangerSignNotice: string;
  };
  month: {
    title: string;
    subTitle: string;
    briefingTitle: string;
    briefingText: string;
    listenBriefing: string;
    activityCounts: string;
    totalTasksLogged: string;
    completedRecords: string;
    incompleteRecordsTitle: (count: number) => string;
    completeBtn: string;
    shareReportBtn: string;
    shareDisclaimer: string;
    completeStatus: (count: number) => string;
    incompleteStatus: (count: number) => string;
    ancVisits: string;
    hbncCare: string;
    immunisationSessions: string;
    dangerReferrals: string;
    weightNotRecorded: string;
    vaccinationMissing: string;
    monthBadge: string;
  };
  sync: {
    synced: string;
    offline: string;
    offlinePending: (count: number) => string;
    syncing: string;
  };
  settings: {
    title: string;
    subTitle: string;
    languageTitle: string;
    languageDesc: string;
    latencyTitle: string;
    latencyDesc: string;
    lastLatencyLabel: string;
    noiseModeTitle: string;
    noiseModeDesc: string;
    locationTitle: string;
    locationDesc: string;
    precisionLabel: string;
    villagePrecision: string;
    exactPrecision: string;
    reminderTimeTitle: string;
    reminderTimeDesc: string;
    demoDataTitle: string;
    demoDataDesc: string;
    seedButton: string;
    disclaimerTitle: string;
    disclaimerMedical: string;
    disclaimerSynthetic: string;
    deleteDataBtn: string;
    deleteDataConfirm: string;
    deleteSuccess: string;
  };
  consent: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    chooseLang: string;
    safetyTitle: string;
    voiceAiTitle: string;
    voiceAiDesc: string;
    locationTitle: string;
    locationDesc: string;
    medicalTitle: string;
    medicalDesc: string;
    agreeCheckbox: string;
    continueBtn: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'ASHA Voice Register',
    tagline: 'Speak visit notes & track timely care',
    tabs: {
      today: 'Today',
      beneficiaries: 'Beneficiaries',
      record: 'Record',
      map: 'Map',
      month: 'My Month',
    },
    today: {
      greeting: 'Good morning, Didi',
      subGreeting: "Today's visit & follow-up schedule",
      searchPlaceholder: 'Search beneficiary, code, or village...',
      monthLabel: 'November 2026',
      dangerBannerTitle: 'Urgent: Reported Danger Sign Referrals',
      dangerBannerMsg: (count) => `${count} beneficiary requires immediate facility referral and follow-up.`,
      overdueSection: (count) => `Overdue (${count})`,
      dueTodaySection: (count) => `Due Today (${count})`,
      completedSection: (count) => `Completed (${count})`,
      emptyToday: 'No pending visits scheduled for today.',
      markDone: 'Done',
      dueOn: 'Due',
      urgentDangerBadge: 'Urgent Referral',
      overdueBadge: 'Overdue',
      doneToast: 'Task marked as completed!',
    },
    recording: {
      aiDisclosureTitle: 'AI Voice Assistant:',
      aiDisclosureMsg: "Hello Didi! I am your AI assistant. Please speak your visit notes in English or your preferred language.",
      liveFieldsTitle: 'Live Extracted Fields:',
      transcriptTitle: 'Your Speech (Transcript):',
      listening: 'Listening... (Tap to stop)',
      tapToSpeak: 'Tap to Speak',
      cancel: 'Cancel',
      finish: 'Finish',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'Danger Sign Reported: Referral Required Now',
      dangerAlertMsg: 'Beneficiary reported severe headache / blurred vision. Refer to the nearest PHC / CHC immediately.',
      guidelineRefTag: 'MoHFW Maternal Health Danger Signs, Page 14',
      readbackNotice: 'Assistant read aloud: "Is everything correct?"',
      listenAgain: 'Listen Again',
      notCheckedTitle: 'Not Checked / Unknown:',
      beneficiaryLabel: 'Beneficiary',
      visitTypeLabel: 'Visit Type',
      weightLabel: 'Weight',
      tempLabel: 'Temperature',
      vaccinationsLabel: 'Vaccinations Due',
      nextVisitDateLabel: 'Next Visit Date',
      dangerSignsLabel: 'Reported Danger Signs',
      confirmAndSave: 'Confirm & Save',
      reRecord: 'Re-record',
      savedSuccessToast: 'Visit record saved successfully!',
    },
    beneficiaries: {
      title: 'Beneficiary Register',
      totalRegistered: (count) => `Total ${count} registered beneficiaries`,
      addNew: 'Add New',
      searchPlaceholder: 'Search name (e.g. Mina finds Meena), code or village...',
      all: 'All',
      pregnant: 'Pregnant',
      newborn: 'Newborn',
      child: 'Children',
      idPrefix: 'ID: ',
      eddPrefix: 'Expected Delivery: ',
      dobPrefix: 'Date of Birth: ',
      noResults: 'No matching beneficiaries found.',
      seedNotice: 'Notice: All records are synthetic demo data.',
      seedButton: 'Seed Demo Data',
      seeding: 'Seeding...',
    },
    map: {
      filterAll: 'All Households',
      filterToday: "Today's Route",
      filterDanger: 'Danger Referrals',
      filterOverdue: 'Overdue',
      recentVisit: 'Visited Recently',
      referralPending: 'Referral Pending (High BP)',
      overdueVaccine: 'Vaccination Overdue',
      upcomingVisit: 'Upcoming Visit',
      navigate: 'Navigate',
      startVisit: 'Start Visit',
      dangerSignNotice: 'Danger sign reported: referral check pending (HBNC/Maternal)',
    },
    month: {
      title: 'My Month',
      subTitle: 'Incentive activity ledger & monthly reports',
      briefingTitle: "Today's Morning Briefing",
      briefingText: "Good morning Didi! You have 3 home visits today. 1 follow-up is overdue and 1 emergency danger sign referral check must be conducted today.",
      listenBriefing: 'Listen to Briefing',
      activityCounts: 'Monthly Activity Summary',
      totalTasksLogged: 'Total Tasks Logged',
      completedRecords: 'Complete Records',
      incompleteRecordsTitle: (count) => `Incomplete Records (${count})`,
      completeBtn: 'Complete',
      shareReportBtn: 'Share ANM Weekly Report (PDF)',
      shareDisclaimer: '* Beneficiary confidential data and exact locations are never shared without explicit consent.',
      completeStatus: (count) => `${count} Complete`,
      incompleteStatus: (count) => `${count} Incomplete`,
      ancVisits: 'ANC Home Visits',
      hbncCare: 'HBNC Newborn Care',
      immunisationSessions: 'Immunisation Sessions (VHND)',
      dangerReferrals: 'Danger Sign Referrals',
      weightNotRecorded: 'Weight not recorded',
      vaccinationMissing: 'MR-1 vaccination date missing',
      monthBadge: 'November 2026',
    },
    sync: {
      synced: 'Synced',
      offline: 'Offline',
      offlinePending: (count: number) => `Offline (${count} pending)`,
      syncing: 'Syncing...',
    },
    settings: {
      title: 'Settings & Privacy',
      subTitle: 'App preferences & privacy controls',
      languageTitle: 'Language',
      languageDesc: 'Voice and user interface language',
      latencyTitle: 'Speed & Latency Meter',
      latencyDesc: 'Show time-to-first-audio chip per turn',
      lastLatencyLabel: 'Last turn latency:',
      noiseModeTitle: 'Noisy Surroundings Mode',
      noiseModeDesc: 'Lengthen silence window to 1200ms for street & fan noise',
      locationTitle: 'GPS Location Capture',
      locationDesc: 'Store household location during confirmed visits',
      precisionLabel: 'Precision level:',
      villagePrecision: 'Village level (~100m)',
      exactPrecision: 'Exact GPS',
      reminderTimeTitle: 'Morning Reminder Time',
      reminderTimeDesc: 'Time for daily briefing notification',
      demoDataTitle: 'Synthetic Demo Data',
      demoDataDesc: 'Load 8 synthetic beneficiaries & 20 past visits',
      seedButton: 'Seed / Reset Demo Data',
      disclaimerTitle: 'Statutory Disclaimers',
      disclaimerMedical: 'Not a certified medical device. This prototype does not give clinical diagnosis or prescriptions.',
      disclaimerSynthetic: 'Synthetic demo data only. All sample records are synthetic until real consent and legal basis are established (India DPDP Act).',
      deleteDataBtn: 'Delete All My Data',
      deleteDataConfirm: 'Are you sure you want to permanently delete all your registered records, visits, and follow-ups?',
      deleteSuccess: 'All data permanently deleted.',
    },
    consent: {
      welcomeTitle: 'ASHA Voice Register',
      welcomeSubtitle: 'Voice-first register for home visits & timely follow-ups',
      chooseLang: 'Choose Language',
      safetyTitle: 'Privacy & Safety Disclosures',
      voiceAiTitle: 'AI Voice Assistant',
      voiceAiDesc: 'Voice is processed in-memory to extract visit data. Raw audio and raw transcripts are never stored.',
      locationTitle: 'Location Consent',
      locationDesc: 'GPS location is saved only with your permission to map visited households.',
      medicalTitle: 'Not a Medical Device',
      medicalDesc: 'This app never diagnoses or prescribes treatments. It strictly flags guideline danger signs for immediate facility referral.',
      agreeCheckbox: 'I have read and agree to the privacy terms',
      continueBtn: 'Continue',
    },
  },

  hi: {
    appName: 'आशा वॉयस रजिस्टर',
    tagline: 'बोलकर भेंट दर्ज करें और समय पर देखभाल सुनिश्चित करें',
    tabs: {
      today: 'आज',
      beneficiaries: 'लाभार्थी',
      record: 'रिकॉर्ड',
      map: 'नक्शा',
      month: 'मेरा माह',
    },
    today: {
      greeting: 'नमस्ते, आशा दीदी',
      subGreeting: 'आज के कार्य व गृह-भेंट सूची',
      searchPlaceholder: 'लाभार्थी का नाम, कोड या गाँव खोजें...',
      monthLabel: 'नवंबर 2026',
      dangerBannerTitle: 'तुरंत ध्यान दें: खतरे के लक्षण रेफरल',
      dangerBannerMsg: (count) => `${count} लाभार्थी को तुरंत PHC/CHC रेफरल व फॉलो-अप की आवश्यकता है।`,
      overdueSection: (count) => `समय बीता (${count})`,
      dueTodaySection: (count) => `आज के कार्य (${count})`,
      completedSection: (count) => `पूर्ण कार्य (${count})`,
      emptyToday: 'आज के लिए कोई लंबित भेंट नहीं है।',
      markDone: 'हो गया',
      dueOn: 'तारीख',
      urgentDangerBadge: 'तुरंत रेफरल',
      overdueBadge: 'समय बीता',
      doneToast: 'कार्य पूर्ण चिह्नित किया गया!',
    },
    recording: {
      aiDisclosureTitle: 'AI वॉयस सहायक:',
      aiDisclosureMsg: 'नमस्ते आशा दीदी! मैं आपका AI सहायक हूँ। कृपया अपनी भेंट के बारे में बोलें।',
      liveFieldsTitle: 'पहचाने गए विवरण:',
      transcriptTitle: 'आपकी आवाज़ (ट्रांसक्रिप्ट):',
      listening: 'सुन रहा है... (रोकने के लिए दबाएं)',
      tapToSpeak: 'बोलने के लिए दबाएं',
      cancel: 'रद्द करें',
      finish: 'पूरा हुआ',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'खतरे का लक्षण: तुरंत रेफरल आवश्यक',
      dangerAlertMsg: 'लाभार्थी में तीव्र सिरदर्द/धुंधला दिखना रिपोर्ट किया गया है। तुरंत निकटतम PHC/CHC में संपर्क करवाएं।',
      guidelineRefTag: 'MoHFW मातृ स्वास्थ्य खतरे के लक्षण, पृष्ठ 14',
      readbackNotice: 'एजेंट ने विवरण पढ़कर सुनाया: "सब सही है?"',
      listenAgain: 'दोबारा सुनें',
      notCheckedTitle: 'जांच नहीं की गई / अज्ञात:',
      beneficiaryLabel: 'लाभार्थी',
      visitTypeLabel: 'भेंट का प्रकार',
      weightLabel: 'वजन',
      tempLabel: 'तापमान',
      vaccinationsLabel: 'टीकाकरण देय',
      nextVisitDateLabel: 'अगली भेंट तारीख',
      dangerSignsLabel: 'रिपोर्ट किए गए खतरे के लक्षण',
      confirmAndSave: 'पुष्टि करें और सहेजें',
      reRecord: 'दोबारा बोलें',
      savedSuccessToast: 'भेंट रिकॉर्ड सफलतापूर्वक सहेजा गया!',
    },
    beneficiaries: {
      title: 'लाभार्थी रजिस्टर',
      totalRegistered: (count) => `कुल ${count} पंजीकृत लाभार्थी`,
      addNew: 'नया लाभार्थी',
      searchPlaceholder: 'नाम (जैसे Mina या Meena), कोड या गाँव खोजें...',
      all: 'सभी',
      pregnant: 'गर्भवती',
      newborn: 'नवजात',
      child: 'बच्चे',
      idPrefix: 'आईडी: ',
      eddPrefix: 'प्रसव संभावित: ',
      dobPrefix: 'जन्म तारीख: ',
      noResults: 'कोई लाभार्थी नहीं मिला।',
      seedNotice: 'सूचना: सारा डेटा काल्पनिक (Synthetic) है।',
      seedButton: 'डेमो डेटा लोड करें',
      seeding: 'लोड हो रहा...',
    },
    map: {
      filterAll: 'सभी घर',
      filterToday: 'आज के रूट',
      filterDanger: 'खतरा रेफरल',
      filterOverdue: 'समय बीता',
      recentVisit: 'हाल में भेंट हुई',
      referralPending: 'रेफरल लंबित (High BP)',
      overdueVaccine: 'टीकाकरण बाकी (Overdue)',
      upcomingVisit: 'भेंट आगामी',
      navigate: 'रास्ता',
      startVisit: 'भेंट शुरू करें',
      dangerSignNotice: 'खतरे का लक्षण: तुरंत रेफरल जांच लंबित (HBNC/Maternal)',
    },
    month: {
      title: 'मेरा माह',
      subTitle: 'प्रोत्साहन कार्य रजिस्टर व रिपोर्ट',
      briefingTitle: 'आज का सुबह का सारांश',
      briefingText: 'नमस्ते दीदी! आज कुल 3 गृह-भेंट प्रस्तावित हैं। 1 फॉलो-अप समय बीता हुआ है और 1 खतरे का रेफरल फॉलो-अप तुरंत करना है।',
      listenBriefing: 'आवाज़ में सुनें',
      activityCounts: 'मासिक कार्य सारांश',
      totalTasksLogged: 'कुल कार्य दर्ज',
      completedRecords: 'पूर्ण रिकॉर्ड्स',
      incompleteRecordsTitle: (count) => `अधूरे रिकॉर्ड्स (${count})`,
      completeBtn: 'पूरा करें',
      shareReportBtn: 'ANM साप्ताहिक रिपोर्ट शेयर करें (PDF)',
      shareDisclaimer: '* किसी भी रिपोर्ट में लाभार्थी का गुप्त डेटा या स्थान बिना सहमति साझा नहीं किया जाता।',
      completeStatus: (count) => `${count} पूर्ण`,
      incompleteStatus: (count) => `${count} अधूरा`,
      ancVisits: 'ANC गृह भेंट',
      hbncCare: 'HBNC नवजात शिशु देखभाल',
      immunisationSessions: 'टीकाकरण सत्र सहायता (VHND)',
      dangerReferrals: 'खतरे के लक्षण रेफरल व फॉलो-अप',
      weightNotRecorded: 'वजन दर्ज नहीं',
      vaccinationMissing: 'MR-1 टीका तारीख छूटी',
      monthBadge: 'नवंबर 2026',
    },
    sync: {
      synced: 'सिंक है',
      offline: 'ऑफलाइन',
      offlinePending: (count: number) => `ऑफलाइन (${count} बाकी)`,
      syncing: 'सिंक हो रहा है...',
    },
    settings: {
      title: 'सेटिंग्स और गोपनीयता',
      subTitle: 'ऐप नियंत्रण और सुरक्षा सेटिंग्स',
      languageTitle: 'भाषा',
      languageDesc: 'वॉयस और इंटरफ़ेस की भाषा',
      latencyTitle: 'स्पीड और लेटेंसी मीटर',
      latencyDesc: 'आवाज़ से उत्तर आने का समय दिखाएं',
      lastLatencyLabel: 'पिछला टर्न लेटेंसी:',
      noiseModeTitle: 'शोर मोड (Noisy Surroundings)',
      noiseModeDesc: 'सड़क व पंखे के शोर में शांत समय 1200ms बढ़ाएं',
      locationTitle: 'स्थान रिकॉर्डिंग (GPS)',
      locationDesc: 'भेंट के समय घर की लोकेशन सहेजें',
      precisionLabel: 'लोकेशन सटीकता स्तर:',
      villagePrecision: 'गाँव स्तर (~100m)',
      exactPrecision: 'सटीक GPS',
      reminderTimeTitle: 'सुबह का स्मरण समय',
      reminderTimeDesc: 'आज के कार्यों का नोटिफिकेशन समय',
      demoDataTitle: 'डेमो डेटा लोड (Synthetic Data)',
      demoDataDesc: '8 काल्पनिक लाभार्थी व 20 पूर्व भेंट डेटा लोड करें',
      seedButton: 'डेमो डेटा लोड / रीसेट करें',
      disclaimerTitle: 'सांविधिक सूचना',
      disclaimerMedical: 'प्रमाणित चिकित्सा उपकरण नहीं है। कोई चिकित्सीय निदान या पर्ची नहीं दी जाती।',
      disclaimerSynthetic: 'काल्पनिक डेमो डेटा। भारत DPDP अधिनियम के तहत वास्तविक सहमति तक सारा डेटा काल्पनिक है।',
      deleteDataBtn: 'मेरा सारा डेटा मिटाएं',
      deleteDataConfirm: 'क्या आप वाकई अपना सारा रिकॉर्ड, विज़िट और फॉलो-अप हमेशा के लिए मिटाना चाहती हैं?',
      deleteSuccess: 'सारा डेटा स्थायी रूप से मिटा दिया गया।',
    },
    consent: {
      welcomeTitle: 'आशा वॉयस रजिस्टर',
      welcomeSubtitle: 'बोलकर गृह-भेंट रिकॉर्ड करें और समय पर फॉलो-अप पाएं',
      chooseLang: 'भाषा चुनें',
      safetyTitle: 'गोपनीयता और सुरक्षा शर्तें',
      voiceAiTitle: 'AI वॉयस सहायक',
      voiceAiDesc: 'आपकी आवाज़ से केवल फॉर्म भरने के लिए डेटा निकाला जाता है। रॉ ऑडियो या ट्रांसक्रिप्ट स्टोर नहीं होता।',
      locationTitle: 'स्थान (GPS)',
      locationDesc: 'स्थान केवल आपकी स्पष्ट सहमति पर गाँव या घर का नक्शा बनाने के लिए सुरक्षित रखा जाता है।',
      medicalTitle: 'चिकित्सीय सलाह नहीं',
      medicalDesc: 'यह ऐप कोई इलाज या दवा नहीं बताता। खतरे के लक्षण पर तुरंत PHC/CHC रेफरल की सलाह दी जाती है।',
      agreeCheckbox: 'मैंने शर्तें पढ़ ली हैं और सहमति देती हूँ',
      continueBtn: 'शुरू करें',
    },
  },

  ta: {
    appName: 'ஆஷா குரல் பதிவேடு',
    tagline: 'குரல் மூலம் இல்லப் பதிவுகளைப் பதிவு செய்து பாதுகாக்கவும்',
    tabs: {
      today: 'இன்று',
      beneficiaries: 'பயனாளிகள்',
      record: 'பதிவு செய்',
      map: 'வரைபடம்',
      month: 'என் மாதம்',
    },
    today: {
      greeting: 'வணக்கம், ஆஷா அக்கா',
      subGreeting: 'இன்றைய இல்லப் பார்வையிடல் அட்டவணை',
      searchPlaceholder: 'பயனாளி பெயர், குறியீடு அல்லது ஊர்...',
      monthLabel: 'நவம்பர் 2026',
      dangerBannerTitle: 'அவசரம்: ஆபத்து அறிகுறி பரிந்துரைகள்',
      dangerBannerMsg: (count) => `${count} பயனாளிக்கு உடனடி PHC/CHC மருத்துவமனை பரிந்துரை தேவை.`,
      overdueSection: (count) => `தாமதமானது (${count})`,
      dueTodaySection: (count) => `இன்று செய்யவேண்டியவை (${count})`,
      completedSection: (count) => `முடிந்தது (${count})`,
      emptyToday: 'இன்று நிலுவையில் உள்ள பணிகள் எதுவும் இல்லை.',
      markDone: 'முடிந்தது',
      dueOn: 'தேதி',
      urgentDangerBadge: 'உடனடி பரிந்துரை',
      overdueBadge: 'தாமதம்',
      doneToast: 'பணி வெற்றிகரமாக முடிக்கப்பட்டது!',
    },
    recording: {
      aiDisclosureTitle: 'AI குரல் உதவியாளர்:',
      aiDisclosureMsg: 'வணக்கம் அக்கா! நான் உங்கள் AI உதவியாளர். உங்கள் வருகை விவரங்களை தமிழில் பேசுங்கள்.',
      liveFieldsTitle: 'கண்டறியப்பட்ட விவரங்கள்:',
      transcriptTitle: 'உங்கள் குரல் பதிவு:',
      listening: 'கேட்கிறது... (நிறுத்த தட்டவும்)',
      tapToSpeak: 'பேச தட்டவும்',
      cancel: 'ரத்து செய்',
      finish: 'முடி',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'ஆபத்து அறிகுறி: உடனடி மருத்துவமனை பரிந்துரை தேவை',
      dangerAlertMsg: 'கடுமையான தலைவலி/பார்வை மங்குதல் தெரிவிக்கப்பட்டுள்ளது. உடனடியாக PHC/CHCக்கு அனுப்பவும்.',
      guidelineRefTag: 'MoHFW தாய்வழி ஆபத்து வழிகாட்டுதல், பக் 14',
      readbackNotice: 'உதவியாளர் வாசித்தார்: "அனைத்தும் சரியா?"',
      listenAgain: 'மீண்டும் கேள்',
      notCheckedTitle: 'சரிபார்க்கப்படாதவை:',
      beneficiaryLabel: 'பயனாளி',
      visitTypeLabel: 'பார்வை வகை',
      weightLabel: 'எடை',
      tempLabel: 'வெப்பநிலை',
      vaccinationsLabel: 'தடுப்பூசிகள்',
      nextVisitDateLabel: 'அடுத்த பார்வை தேதி',
      dangerSignsLabel: 'ஆபத்து அறிகுறிகள்',
      confirmAndSave: 'உறுதிசெய்து சேமிக்கவும்',
      reRecord: 'மீண்டும் பேசு',
      savedSuccessToast: 'பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது!',
    },
    beneficiaries: {
      title: 'பயனாளிகள் பதிவேடு',
      totalRegistered: (count) => `மொத்தம் ${count} பதிவு செய்யப்பட்ட பயனாளிகள்`,
      addNew: 'புதிய பயனாளி',
      searchPlaceholder: 'பெயர், குறியீடு அல்லது ஊர் தேடுக...',
      all: 'அனைத்தும்',
      pregnant: 'கர்ப்பிணி',
      newborn: 'பச்சிளங்குழந்தை',
      child: 'குழந்தைகள்',
      idPrefix: 'குறியீடு: ',
      eddPrefix: 'எதிர்பார்க்கப்படும் பிரசவம்: ',
      dobPrefix: 'பிறந்த தேதி: ',
      noResults: 'பயனாளிகள் யாரும் கிடைக்கவில்லை.',
      seedNotice: 'குறிப்பு: அனைத்து தகவல்களும் மாதிரி தரவு மட்டுமே.',
      seedButton: 'மாதிரி தரவை ஏற்று',
      seeding: 'ஏற்றுகிறது...',
    },
    map: {
      filterAll: 'அனைத்து வீடுகள்',
      filterToday: 'இன்றைய பாதை',
      filterDanger: 'ஆபத்து பரிந்துரை',
      filterOverdue: 'தாமதமானது',
      recentVisit: 'சமீபத்திய பார்வை',
      referralPending: 'பரிந்துரை நிலுவை',
      overdueVaccine: 'தடுப்பூசி தாமதம்',
      upcomingVisit: 'அடுத்த பார்வை',
      navigate: 'வழிகாட்டு',
      startVisit: 'வருகை தொடங்கு',
      dangerSignNotice: 'ஆபத்து அறிகுறி: பரிந்துரை சரிபார்ப்பு தேவை',
    },
    month: {
      title: 'என் மாதம்',
      subTitle: 'மாதாந்திர செயல்பாடுகள் மற்றும் அறிக்கைகள்',
      briefingTitle: 'இன்றைய காலை சுருக்கம்',
      briefingText: 'வணக்கம் அக்கா! இன்று 3 இல்லப் பார்வைகள் உள்ளன. 1 பார்வை தாமதமாகியுள்ளது மற்றும் 1 ஆபத்து பரிந்துரை பரிசோதிக்கப்பட வேண்டும்.',
      listenBriefing: 'குரலில் கேள்',
      activityCounts: 'மாதாந்திர செயல்பாட்டு சுருக்கம்',
      totalTasksLogged: 'மொத்த பணிகள்',
      completedRecords: 'முழுமையான பதிவுகள்',
      incompleteRecordsTitle: (count) => `முழுமையற்ற பதிவுகள் (${count})`,
      completeBtn: 'முடிக்கவும்',
      shareReportBtn: 'ANM வாராந்திர அறிக்கை பகிரவும் (PDF)',
      shareDisclaimer: '* தனிப்பட்ட விவரங்கள் அனுமதியின்றி பகிரப்படாது.',
      completeStatus: (count) => `${count} முடிந்தது`,
      incompleteStatus: (count) => `${count} முழுமையற்றது`,
      ancVisits: 'ANC இல்லப் பார்வைகள்',
      hbncCare: 'HBNC பிறந்த குழந்தை பராமரிப்பு',
      immunisationSessions: 'தடுப்பூசி அமர்வுகள் (VHND)',
      dangerReferrals: 'அபாய அறிகுறி பரிந்துரைகள்',
      weightNotRecorded: 'எடை பதிவு செய்யப்படவில்லை',
      vaccinationMissing: 'MR-1 தடுப்பூசி தேதி விடுபட்டது',
      monthBadge: 'நவம்பர் 2026',
    },
    sync: {
      synced: 'ஒத்திசைக்கப்பட்டது',
      offline: 'ஆஃப்லைன்',
      offlinePending: (count: number) => `ஆஃப்லைன் (${count} மீதம்)`,
      syncing: 'ஒத்திசைக்கிறது...',
    },
    settings: {
      title: 'அமைப்புகள் மற்றும் தனியுரிமை',
      subTitle: 'செயலி கட்டுப்பாடுகள் மற்றும் பாதுகாப்பு',
      languageTitle: 'மொழி',
      languageDesc: 'குரல் மற்றும் செயலி மொழி',
      latencyTitle: 'வேகம் மற்றும் தாமத மீட்டர்',
      latencyDesc: 'பதில் வரும் நேரத்தை காட்டவும்',
      lastLatencyLabel: 'கடைசி தாமதம்:',
      noiseModeTitle: 'இரைச்சல் முறை',
      noiseModeDesc: 'தெரு சத்தத்தில் அமைதி நேரத்தை 1200ms ஆக அதிகரிக்கவும்',
      locationTitle: 'GPS இருப்பிடம்',
      locationDesc: 'வீட்டு இருப்பிடத்தை சேமிக்கவும்',
      precisionLabel: 'இருப்பிட துல்லியம்:',
      villagePrecision: 'கிராம அளவு (~100m)',
      exactPrecision: 'துல்லிய GPS',
      reminderTimeTitle: 'காலை நினைவூட்டல் நேரம்',
      reminderTimeDesc: 'தினசரி அறிவிப்பு நேரம்',
      demoDataTitle: 'மாதிரி தரவு',
      demoDataDesc: '8 மாதிரி பயனாளிகள் & 20 வருகைகள் ஏற்றவும்',
      seedButton: 'மாதிரி தரவை மீட்டமைக்கவும்',
      disclaimerTitle: 'சட்டபூர்வ அறிவிப்பு',
      disclaimerMedical: 'இது சான்றளிக்கப்பட்ட மருத்துவ சாதனம் அல்ல.',
      disclaimerSynthetic: 'மாதிரி தரவு மட்டுமே. அனைத்து பதிவுகளும் சோதனையானவை.',
      deleteDataBtn: 'என் அனைத்து தரவையும் நீக்கு',
      deleteDataConfirm: 'உங்கள் அனைத்து தரவையும் நிரந்தரமாக நீக்க விரும்புகிறீர்களா?',
      deleteSuccess: 'அனைத்து தரவுகளும் நீக்கப்பட்டன.',
    },
    consent: {
      welcomeTitle: 'ஆஷா குரல் பதிவேடு',
      welcomeSubtitle: 'குரல் மூலம் இல்லப் பார்வையிடல் பதிவு செய்யவும்',
      chooseLang: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      safetyTitle: 'தனியுரிமை மற்றும் பாதுகாப்பு விதிமுறைகள்',
      voiceAiTitle: 'AI குரல் உதவியாளர்',
      voiceAiDesc: 'குரல் பதிவு படிவத்தை நிரப்ப மட்டுமே பயன்படுகிறது. அசல் ஆடியோ சேமிக்கப்படாது.',
      locationTitle: 'இருப்பிட ஒப்புதல்',
      locationDesc: 'வரைபடத்திற்காக உங்கள் அனுமதியுடன் மட்டுமே இருப்பிடம் சேமிக்கப்படும்.',
      medicalTitle: 'மருத்துவ ஆலோசனை அல்ல',
      medicalDesc: 'இந்த செயலி எந்த சிகிச்சையும் அளிக்காது. ஆபத்து நேரத்தில் மருத்துவமனைக்கு பரிந்துரைக்கும்.',
      agreeCheckbox: 'விதிமுறைகளைப் படித்து ஒப்புக்கொள்கிறேன்',
      continueBtn: 'தொடரவும்',
    },
  },

  te: {
    appName: 'ఆశా వాయిస్ రిజిస్టర్',
    tagline: 'గృహ సందర్శన వివరాలను మాట్లాడి నమోదు చేయండి',
    tabs: {
      today: 'నేడు',
      beneficiaries: 'లబ్ధిదారులు',
      record: 'రికార్డ్',
      map: 'మ్యాప్',
      month: 'నా నెల',
    },
    today: {
      greeting: 'నమస్కారం, ఆశా దీదీ',
      subGreeting: 'నేటి గృహ సందర్శన ప్రణాళిక',
      searchPlaceholder: 'లబ్ధిదారు పేరు, కోడ్ లేదా గ్రామం...',
      monthLabel: 'నవంబర్ 2026',
      dangerBannerTitle: 'అత్యవసరం: ప్రమాద సంకేతాల రిఫరల్స్',
      dangerBannerMsg: (count) => `${count} లబ్ధిదారుడికి వెంటనే ఆసుపత్రి రిఫరల్ అవసరం.`,
      overdueSection: (count) => `గడువు దాటినవి (${count})`,
      dueTodaySection: (count) => `నేటి విధులు (${count})`,
      completedSection: (count) => `పూర్తయినవి (${count})`,
      emptyToday: 'ఈ రోజు పెండింగ్ సందర్శనలు లేవు.',
      markDone: 'పూర్తయింది',
      dueOn: 'తేదీ',
      urgentDangerBadge: 'అత్యవసర రిఫరల్',
      overdueBadge: 'గడువు దాటింది',
      doneToast: 'పని పూర్తయినట్లు నమోదు చేయబడింది!',
    },
    recording: {
      aiDisclosureTitle: 'AI వాయిస్ అసిస్టెంట్:',
      aiDisclosureMsg: 'నమస్తే దీదీ! నేను మీ AI అసిస్టెంట్. దయచేసి మీ సందర్శన వివరాలు మాట్లాడండి.',
      liveFieldsTitle: 'గుర్తించబడిన వివరాలు:',
      transcriptTitle: 'మీ వాయిస్ రికార్డ్:',
      listening: 'వింటోంది... (ఆపడానికి నొక్కండి)',
      tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
      cancel: 'రద్దు చేయి',
      finish: 'పూర్తి చేయి',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'ప్రమాద సంకేతం: వెంటనే ఆసుపత్రికి పంపాలి',
      dangerAlertMsg: 'తీవ్ర తలనొప్పి లేదా కంటి చూపు మసకబారడం కనిపించింది. వెంటనే PHC/CHC కి పంపండి.',
      guidelineRefTag: 'MoHFW ప్రమాద మార్గదర్శకాలు, పేజీ 14',
      readbackNotice: 'అసిస్టెంట్ చదివి వినిపించారు: "అన్నీ సరిగ్గా ఉన్నాయా?"',
      listenAgain: 'మళ్లీ వినండి',
      notCheckedTitle: 'తనిఖీ చేయనివి:',
      beneficiaryLabel: 'లబ్ధిదారు',
      visitTypeLabel: 'సందర్శన రకం',
      weightLabel: 'బరువు',
      tempLabel: 'ఉష్ణోగ్రత',
      vaccinationsLabel: 'టీకాలు',
      nextVisitDateLabel: 'తదుపరి సందర్శన తేదీ',
      dangerSignsLabel: 'ప్రమాద సంకేతాలు',
      confirmAndSave: 'నిర్ధారించి భద్రపరచండి',
      reRecord: 'మళ్లీ మాట్లాడండి',
      savedSuccessToast: 'వివరాలు విజయవంతంగా భద్రపరచబడ్డాయి!',
    },
    beneficiaries: {
      title: 'లబ్ధిదారుల రిజిస్టర్',
      totalRegistered: (count) => `మొత్తం ${count} నమోదైన లబ్ధిదారులు`,
      addNew: 'కొత్త లబ్ధిదారు',
      searchPlaceholder: 'పేరు, కోడ్ లేదా గ్రామం వెతకండి...',
      all: 'అందరూ',
      pregnant: 'గర్భిణి',
      newborn: 'నవజాత శిశువు',
      child: 'పిల్లలు',
      idPrefix: 'కోడ్: ',
      eddPrefix: 'ప్రసవ తేదీ: ',
      dobPrefix: 'పుట్టిన తేదీ: ',
      noResults: 'లబ్ధిదారులు ఎవరూ కనుగొనబడలేదు.',
      seedNotice: 'గమనిక: మొత్తం సమాచారం నమూనా డేటా మాత్రమే.',
      seedButton: 'డెమో డేటాను లోడ్ చేయండి',
      seeding: 'లోడ్ అవుతోంది...',
    },
    map: {
      filterAll: 'అన్ని గృహాలు',
      filterToday: 'నేటి రూట్',
      filterDanger: 'ప్రమాద రిఫరల్',
      filterOverdue: 'గడువు దాటినవి',
      recentVisit: 'ఇటీవలి సందర్శన',
      referralPending: 'రిఫరల్ పెండింగ్',
      overdueVaccine: 'టీకా గడువు దాటింది',
      upcomingVisit: 'రాబోయే సందర్శన',
      navigate: 'దారి చూపు',
      startVisit: 'సందర్శన ప్రారంభించు',
      dangerSignNotice: 'ప్రమాద సంకేతం: రిఫరల్ తనిఖీ పెండింగ్',
    },
    month: {
      title: 'నా నెల',
      subTitle: 'నెలవారీ పనుల నివేదిక',
      briefingTitle: 'ఈ ఉదయం సారాంశం',
      briefingText: 'నమస్తే దీదీ! నేడు 3 గృహ సందర్శనలు ఉన్నాయి. 1 గడువు దాటింది మరియు 1 అత్యవసర రిఫరల్ తనిఖీ చేయాలి.',
      listenBriefing: 'వాయిస్‌లో వినండి',
      activityCounts: 'నెలవారీ పనుల సారాంశం',
      totalTasksLogged: 'మొత్తం పనులు',
      completedRecords: 'పూర్తయిన రికార్డులు',
      incompleteRecordsTitle: (count) => `అసంపూర్ణ రికార్డులు (${count})`,
      completeBtn: 'పూర్తి చేయి',
      shareReportBtn: 'ANM వీక్లీ రిపోర్ట్ షేర్ చేయండి (PDF)',
      shareDisclaimer: '* లబ్ధిదారుల వ్యక్తిగత వివరాలు అనుమతి లేకుండా భాగస్వామ్యం చేయబడవు.',
      completeStatus: (count) => `${count} పూర్తయింది`,
      incompleteStatus: (count) => `${count} అసంపూర్ణం`,
      ancVisits: 'ANC గృహ సందర్శనలు',
      hbncCare: 'HBNC నవజాత శిశు సంరక్షణ',
      immunisationSessions: 'టీకా సెషన్లు (VHND)',
      dangerReferrals: 'ప్రమాద సూచికల రిఫరల్స్',
      weightNotRecorded: 'బరువు నమోదు కాలేదు',
      vaccinationMissing: 'MR-1 టీకా తేదీ తప్పిపోయింది',
      monthBadge: 'నవంబర్ 2026',
    },
    sync: {
      synced: 'సింక్ చేయబడింది',
      offline: 'ఆఫ్‌లైన్',
      offlinePending: (count: number) => `ఆఫ్‌లైన్ (${count} మిగిలింది)`,
      syncing: 'సింక్ అవుతోంది...',
    },
    settings: {
      title: 'సెట్టింగులు & గోప్యత',
      subTitle: 'యాప్ నియంత్రణలు మరియు రక్షణ',
      languageTitle: 'భాష',
      languageDesc: 'వాయిస్ మరియు యాప్ భాష',
      latencyTitle: 'స్పీడ్ మీటర్',
      latencyDesc: 'జవాబు వచ్చే సమయాన్ని చూపించు',
      lastLatencyLabel: 'చివరి లేటెన్సీ:',
      noiseModeTitle: 'నాయిస్ మోడ్',
      noiseModeDesc: 'రోడ్డు రణగొణధ్వనిలో నిశ్శబ్ద సమయాన్ని 1200ms కు పెంచండి',
      locationTitle: 'GPS లొకేషన్',
      locationDesc: 'సందర్శన సమయంలో ఇంటి లొకేషన్ భద్రపరచండి',
      precisionLabel: 'లొకేషన్ స్థాయి:',
      villagePrecision: 'గ్రామ స్థాయి (~100m)',
      exactPrecision: 'ఖచ్చితమైన GPS',
      reminderTimeTitle: 'ఉదయం రిమైండర్ సమయం',
      reminderTimeDesc: 'రోజువారీ నోటిఫికేషన్ సమయం',
      demoDataTitle: 'నమూనా డేటా',
      demoDataDesc: '8 నమూనా లబ్ధిదారులు & 20 సందర్శనలు లోడ్ చేయండి',
      seedButton: 'డెమో డేటాను రీసెట్ చేయండి',
      disclaimerTitle: 'చట్టబద్ధమైన హెచ్చరిక',
      disclaimerMedical: 'ఇది ధృవీకరించబడిన వైద్య పరికరం కాదు. ఎలాంటి చికిత్సలు సూచించదు.',
      disclaimerSynthetic: 'నమూనా డెమో డేటా మాత్రమే. వాస్తవ సమ్మతి లేకుండా డేటా రక్షించబడుతుంది.',
      deleteDataBtn: 'నా డేటా అంతా తొలగించు',
      deleteDataConfirm: 'మీ రికార్డులన్నీ శాశ్వతంగా తొలగించాలనుకుంటున్నారా?',
      deleteSuccess: 'డేటా పూర్తిగా తొలగించబడింది.',
    },
    consent: {
      welcomeTitle: 'ఆశా వాయిస్ రిజిస్టర్',
      welcomeSubtitle: 'గృహ సందర్శనలను సులభంగా మాట్లాడి నమోదు చేసుకోండి',
      chooseLang: 'భాషను ఎంచుకోండి',
      safetyTitle: 'గోప్యత మరియు భద్రతా నిబంధనలు',
      voiceAiTitle: 'AI వాయిస్ అసిస్టెంట్',
      voiceAiDesc: 'మీ వాయిస్ ద్వారా ఫారమ్ మాత్రమే నింపబడుతుంది. రికార్డింగ్ నిల్వ చేయబడదు.',
      locationTitle: 'లొకేషన్ సమ్మతి',
      locationDesc: 'మ్యాప్ కోసం మీ అనుమతితో మాత్రమే లొకేషన్ భద్రపరచబడుతుంది.',
      medicalTitle: 'వైద్య సలహా కాదు',
      medicalDesc: 'ఈ యాప్ చికిత్స అందించదు. ప్రమాదకర లక్షణాలు ఉన్నప్పుడు ఆసుపత్రికి పంపుతుంది.',
      agreeCheckbox: 'నేను నిబంధనలను చదివి అంగీకరిస్తున్నాను',
      continueBtn: 'కొనసాగించు',
    },
  },

  kn: {
    appName: 'ಆಶಾ ಧ್ವನಿ ರಿಜಿಸ್ಟರ್',
    tagline: 'ಮನೆ ಭೇಟಿಯ ವಿವರಗಳನ್ನು ಮಾತನಾಡಿ ದಾಖಲಿಸಿ',
    tabs: {
      today: 'ಇಂದು',
      beneficiaries: 'ಫಲಾನುಭವಿಗಳು',
      record: 'ದಾಖಲಿಸಿ',
      map: 'ನಕ್ಷೆ',
      month: 'ನನ್ನ ತಿಂಗಳು',
    },
    today: {
      greeting: 'ನಮಸ್ಕಾರ, ಆಶಾ ದೀದಿ',
      subGreeting: 'ಇಂದಿನ ಮನೆ ಭೇಟಿ ವೇಳಾಪಟ್ಟಿ',
      searchPlaceholder: 'ಫಲಾನುಭವಿ ಹೆಸರು, ಕೋಡ್ ಅಥವಾ ಊರು...',
      monthLabel: 'ನವೆಂಬರ್ 2026',
      dangerBannerTitle: 'ತುರ್ತು: ಅಪಾಯದ ಲಕ್ಷಣಗಳ ರೆಫರಲ್‌ಗಳು',
      dangerBannerMsg: (count) => `${count} ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣದ ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಅಗತ್ಯವಿದೆ.`,
      overdueSection: (count) => `ಬಾಕಿ ಉಳಿದಿದೆ (${count})`,
      dueTodaySection: (count) => `ಇಂದಿನ ಕಾರ್ಯಗಳು (${count})`,
      completedSection: (count) => `ಪೂರ್ಣಗೊಂಡಿದೆ (${count})`,
      emptyToday: 'ಇಂದಿಗೆ ಯಾವುದೇ ಬಾಕಿ ಭೇಟಿಗಳಿಲ್ಲ.',
      markDone: 'ಮುಗಿದಿದೆ',
      dueOn: 'ದಿನಾಂಕ',
      urgentDangerBadge: 'ತುರ್ತು ಶಿಫಾರಸು',
      overdueBadge: 'ಬಾಕಿ',
      doneToast: 'ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    },
    recording: {
      aiDisclosureTitle: 'AI ಧ್ವನಿ ಸಹಾಯಕ:',
      aiDisclosureMsg: 'ನಮಸ್ಕಾರ ದೀದಿ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. ದಯವಿಟ್ಟು ಭೇಟಿಯ ವಿವರಗಳನ್ನು ಮಾತನಾಡಿ.',
      liveFieldsTitle: 'ಗುರುತಿಸಲಾದ ವಿವರಗಳು:',
      transcriptTitle: 'ನಿಮ್ಮ ಧ್ವನಿ ದಾಖಲೆ:',
      listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... (ನಿಲ್ಲಿಸಲು ಒತ್ತಿ)',
      tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      finish: 'ಮುಗಿಸಿ',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'ಅಪಾಯದ ಲಕ್ಷಣ: ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕಳುಹಿಸಬೇಕು',
      dangerAlertMsg: 'ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ದೃಷ್ಟಿ ಮಂದವಾಗಿರುವುದು ವರದಿಯಾಗಿದೆ. ತಕ್ಷಣ PHC/CHC ಗೆ ಕಳುಹಿಸಿ.',
      guidelineRefTag: 'MoHFW ಅಪಾಯದ ಮಾರ್ಗಸೂಚಿಗಳು, ಪುಟ 14',
      readbackNotice: 'ಸಹಾಯಕ ಓದಿದ್ದಾರೆ: "ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆಯೇ?"',
      listenAgain: 'ಮತ್ತೆ ಕೇಳಿ',
      notCheckedTitle: 'ಪರಿಶೀಲಿಸದ ವಿವರಗಳು:',
      beneficiaryLabel: 'ಫಲಾನುಭವಿ',
      visitTypeLabel: 'ಭೇಟಿಯ ವಿಧ',
      weightLabel: 'ತೂಕ',
      tempLabel: 'ತಾಪಮಾನ',
      vaccinationsLabel: 'ಲಸಿಕೆಗಳು',
      nextVisitDateLabel: 'ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ',
      dangerSignsLabel: 'ಅಪಾಯದ ಲಕ್ಷಣಗಳು',
      confirmAndSave: 'ದೃಢೀಕರಿಸಿ ಉಳಿಸಿ',
      reRecord: 'ಮತ್ತೆ ಮಾತನಾಡಿ',
      savedSuccessToast: 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
    },
    beneficiaries: {
      title: 'ಫಲಾನುಭವಿಗಳ ರಿಜಿಸ್ಟರ್',
      totalRegistered: (count) => `ಒಟ್ಟು ${count} ನೋಂದಾಯಿತ ಫಲಾನುಭವಿಗಳು`,
      addNew: 'ಹೊಸ ಫಲಾನುಭವಿ',
      searchPlaceholder: 'ಹೆಸರು, ಕೋಡ್ ಅಥವಾ ಊರು ಹುಡುಕಿ...',
      all: 'ಎಲ್ಲಾ',
      pregnant: 'ಗರ್ಭಿಣಿ',
      newborn: 'ನವಜಾತ ಶಿಶು',
      child: 'ಮಕ್ಕಳು',
      idPrefix: 'ಕೋಡ್: ',
      eddPrefix: 'ನಿರೀಕ್ಷಿತ ಹೆರಿಗೆ: ',
      dobPrefix: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ: ',
      noResults: 'ಯಾವುದೇ ಫಲಾನುಭವಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      seedNotice: 'ಸೂಚನೆ: ಎಲ್ಲಾ ಮಾಹಿತಿಯು ಮಾದರಿ ಡೇಟಾ ಮಾತ್ರ.',
      seedButton: 'ಡೆಮೊ ಡೇಟಾ ಲೋಡ್ ಮಾಡಿ',
      seeding: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    },
    map: {
      filterAll: 'ಎಲ್ಲಾ ಮನೆಗಳು',
      filterToday: 'ಇಂದಿನ ದಾರಿ',
      filterDanger: 'ಅಪಾಯದ ರೆಫರಲ್',
      filterOverdue: 'ಬಾಕಿ ಉಳಿದಿದೆ',
      recentVisit: 'ಇತ್ತೀಚಿನ ಭೇಟಿ',
      referralPending: 'ರೆಫರಲ್ ಬಾಕಿ',
      overdueVaccine: 'ಲಸಿಕೆ ಬಾಕಿ',
      upcomingVisit: 'ಮುಂಬರುವ ಭೇಟಿ',
      navigate: 'ದಾರಿ ತೋರಿಸಿ',
      startVisit: 'ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ',
      dangerSignNotice: 'ಅಪಾಯದ ಲಕ್ಷಣ: ರೆಫರಲ್ ಪರಿಶೀಲನೆ ಬಾಕಿ',
    },
    month: {
      title: 'ನನ್ನ ತಿಂಗಳು',
      subTitle: 'ಮಾಸಿಕ ಕಾರ್ಯಗಳ ವರದಿ',
      briefingTitle: 'ಇಂದಿನ ಮುಂಜಾನೆಯ ಸಾರಾಂಶ',
      briefingText: 'ಶುಭೋದಯ ದೀದಿ! ಇಂದು 3 ಮನೆ ಭೇಟಿಗಳಿವೆ. 1 ಭೇಟಿ ಬಾಕಿ ಇದೆ ಮತ್ತು 1 ತುರ್ತು ರೆಫರಲ್ ತಪಾಸಣೆ ಮಾಡಬೇಕಾಗಿದೆ.',
      listenBriefing: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
      activityCounts: 'ಮಾಸಿಕ ಚಟುವಟಿಕೆಗಳ ಸಾರಾಂಶ',
      totalTasksLogged: 'ಒಟ್ಟು ಕಾರ್ಯಗಳು',
      completedRecords: 'ಪೂರ್ಣಗೊಂಡ ದಾಖಲೆಗಳು',
      incompleteRecordsTitle: (count) => `ಅಪೂರ್ಣ ದಾಖಲೆಗಳು (${count})`,
      completeBtn: 'ಪೂರ್ಣಗೊಳಿಸಿ',
      shareReportBtn: 'ANM ವಾರದ ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ (PDF)',
      shareDisclaimer: '* ಫಲಾನುಭವಿಯ ಖಾಸಗಿ ಮಾಹಿತಿಯನ್ನು ಅನುಮತಿಯಿಲ್ಲದೆ ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ.',
      completeStatus: (count) => `${count} ಮುಗಿದಿದೆ`,
      incompleteStatus: (count) => `${count} ಅಪೂರ್ಣ`,
      ancVisits: 'ANC ಮನೆ ಭೇಟಿಗಳು',
      hbncCare: 'HBNC ನವಜಾತ ಶಿಶು ಆರೈಕೆ',
      immunisationSessions: 'ಲಸಿಕೆ ಸಭೆಗಳು (VHND)',
      dangerReferrals: 'ಅಪಾಯದ ಲಕ್ಷಣಗಳ ರೆಫರಲ್‌ಗಳು',
      weightNotRecorded: 'ತೂಕ ದಾಖಲಾಗಿಲ್ಲ',
      vaccinationMissing: 'MR-1 ಲಸಿಕೆ ದಿನಾಂಕ ತಪ್ಪಿದೆ',
      monthBadge: 'ನವೆಂಬರ್ 2026',
    },
    sync: {
      synced: 'ಸಿಂಕ್ ಆಗಿದೆ',
      offline: 'ಆಫ್‌ಲೈನ್',
      offlinePending: (count: number) => `ಆಫ್‌ಲೈನ್ (${count} ಬಾಕಿ)`,
      syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...',
    },
    settings: {
      title: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಗೌಪ್ಯತೆ',
      subTitle: 'ಆ್ಯಪ್ ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಭದ್ರತೆ',
      languageTitle: 'ಭಾಷೆ',
      languageDesc: 'ಧ್ವನಿ ಮತ್ತು ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ',
      latencyTitle: 'ವೇಗ ಮಾಪಕ',
      latencyDesc: 'ಪ್ರತಿಕ್ರಿಯೆಯ ಸಮಯವನ್ನು ತೋರಿಸಿ',
      lastLatencyLabel: 'ಕೊನೆಯ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ:',
      noiseModeTitle: 'ಶಬ್ದ ನಿಯಂತ್ರಣ ಮೋಡ್',
      noiseModeDesc: 'ಶಬ್ದದ ವಾತಾವರಣದಲ್ಲಿ ಮೌನದ ಸಮಯವನ್ನು 1200ms ಗೆ ಹೆಚ್ಚಿಸಿ',
      locationTitle: 'GPS ಸ್ಥಳ',
      locationDesc: 'ಭೇಟಿಯ ಸಮಯದಲ್ಲಿ ಮನೆಯ ಸ್ಥಳವನ್ನು ಉಳಿಸಿ',
      precisionLabel: 'ಸ್ಥಳದ ನಿಖರತೆ:',
      villagePrecision: 'ಗ್ರಾಮ ಮಟ್ಟ (~100m)',
      exactPrecision: 'ನಿಖರ GPS',
      reminderTimeTitle: 'ಮುಂಜಾನೆಯ ಜ್ಞಾಪನೆ ಸಮಯ',
      reminderTimeDesc: 'ದೈನಂದಿನ ಅಧಿಸೂಚನೆ ಸಮಯ',
      demoDataTitle: 'ಮಾದರಿ ಡೇಟಾ',
      demoDataDesc: '8 ಮಾದರಿ ಫಲಾನುಭವಿಗಳು & 20 ಭೇಟಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
      seedButton: 'ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ',
      disclaimerTitle: 'ಕಾನೂನುಬದ್ಧ ಮಾಹಿತಿ',
      disclaimerMedical: 'ಇದು ಪ್ರಮಾಣೀಕೃತ ವೈದ್ಯಕೀಯ ಸಾಧನವಲ್ಲ. ಯಾವುದೇ ಚಿಕಿತ್ಸೆಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ.',
      disclaimerSynthetic: 'ಮಾದರಿ ಡೆಮೊ ಡೇಟಾ ಮಾತ್ರ. ಅಧಿಕೃತ ಸಮ್ಮತಿಯಿಲ್ಲದೆ ಯಾವುದೇ ನೈಜ ಡೇಟಾ ಬಳಸಲಾಗುವುದಿಲ್ಲ.',
      deleteDataBtn: 'ನನ್ನ ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಅಳಿಸಿ',
      deleteDataConfirm: 'ನಿಮ್ಮ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ಖಚಿತವಾಗಿದೆಯೇ?',
      deleteSuccess: 'ಡೇಟಾ ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸಲಾಗಿದೆ.',
    },
    consent: {
      welcomeTitle: 'ಆಶಾ ಧ್ವನಿ ರಿಜಿಸ್ಟರ್',
      welcomeSubtitle: 'ಧ್ವನಿಯ ಮೂಲಕ ಸುಲಭವಾಗಿ ಮನೆ ಭೇಟಿಯ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ',
      chooseLang: 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
      safetyTitle: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಸುರಕ್ಷತೆಯ ನಿಯಮಗಳು',
      voiceAiTitle: 'AI ಧ್ವನಿ ಸಹಾಯಕ',
      voiceAiDesc: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಫಾರ್ಮ್ ತುಂಬಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಮೂಲ ಆಡಿಯೋ ಉಳಿಸುವುದಿಲ್ಲ.',
      locationTitle: 'ಸ್ಥಳದ ಒಪ್ಪಿಗೆ',
      locationDesc: 'ನಕ್ಷೆಗಾಗಿ ನಿಮ್ಮ ಅನುಮತಿಯೊಂದಿಗೆ ಮಾತ್ರ ಸ್ಥಳವನ್ನು ಉಳಿಸಲಾಗುತ್ತದೆ.',
      medicalTitle: 'ವೈದ್ಯಕೀಯ ಸಲಹೆಯಲ್ಲ',
      medicalDesc: 'ಈ ಆ್ಯಪ್ ಚಿಕಿತ್ಸೆ ನೀಡುವುದಿಲ್ಲ. ಅಪಾಯದ ಲಕ್ಷಣಗಳಿದ್ದಾಗ ಆಸ್ಪತ್ರೆಗೆ ಕಳುಹಿಸಲು ಸೂಚಿಸುತ್ತದೆ.',
      agreeCheckbox: 'ನಾನು ನಿಯಮಗಳನ್ನು ಓದಿದ್ದೇನೆ ಮತ್ತು ಒಪ್ಪುತ್ತೇನೆ',
      continueBtn: 'ಮುಂದುವರಿಯಿರಿ',
    },
  },

  ml: {
    appName: 'ആശ വോയ്‌സ് രജിസ്റ്റർ',
    tagline: 'സംസാരിച്ച് ഭവന സന്ദർശനങ്ങൾ രേഖപ്പെടുത്തുക',
    tabs: {
      today: 'ഇന്ന്',
      beneficiaries: 'ഗുണഭോക്താക്കൾ',
      record: 'റെക്കോർഡ്',
      map: 'മാപ്പ്',
      month: 'എന്റെ മാസം',
    },
    today: {
      greeting: 'നമസ്കാരം, ആശ ദീദി',
      subGreeting: 'ഇന്നത്തെ സന്ദർശന സമയക്രമം',
      searchPlaceholder: 'ഗുണഭോക്താവിന്റെ പേര്, കോഡ് അല്ലെങ്കിൽ ഗ്രാമം...',
      monthLabel: 'നവംബർ 2026',
      dangerBannerTitle: 'അടിയന്തിരം: അപകട ലക്ഷണ റെഫറലുകൾ',
      dangerBannerMsg: (count) => `${count} ഗുണഭോക്താവിന് ഉടൻ ആശുപത്രി റഫറൽ ആവശ്യമാണ്.`,
      overdueSection: (count) => `കാലഹരണപ്പെട്ടവ (${count})`,
      dueTodaySection: (count) => `ഇന്നത്തെ ജോലികൾ (${count})`,
      completedSection: (count) => `പൂർത്തിയായവ (${count})`,
      emptyToday: 'ഇന്ന് ബാക്കി സന്ദർശനങ്ങളൊന്നുമില്ല.',
      markDone: 'പൂർത്തിയായി',
      dueOn: 'തീയതി',
      urgentDangerBadge: 'അടിയന്തിര റഫറൽ',
      overdueBadge: 'കാലഹരണപ്പെട്ടു',
      doneToast: 'ജോലി വിജയകരമായി പൂർത്തിയായി!',
    },
    recording: {
      aiDisclosureTitle: 'AI വോയ്‌സ് അസിസ്റ്റന്റ്:',
      aiDisclosureMsg: 'നമസ്കാരം ദീദി! ഞാൻ നിങ്ങളുടെ AI സഹായിയാണ്. ദയവായി സന്ദർശന വിവരങ്ങൾ സംസാരിക്കുക.',
      liveFieldsTitle: 'തിരിച്ചറിഞ്ഞ വിവരങ്ങൾ:',
      transcriptTitle: 'നിങ്ങളുടെ ശബ്ദരേഖ:',
      listening: 'കേൾക്കുന്നു... (നിർത്താൻ അമർത്തുക)',
      tapToSpeak: 'സംസാരിക്കാൻ അമർത്തുക',
      cancel: 'റദ്ദാക്കുക',
      finish: 'പൂർത്തിയാക്കുക',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'അപകട ലക്ഷണം: ഉടൻ ആശുപത്രിയിലേക്ക് റഫർ ചെയ്യണം',
      dangerAlertMsg: 'കഠിനമായ തലവേദന അല്ലെങ്കിൽ കാഴ്ച മങ്ങൽ റിപ്പോർട്ട് ചെയ്തു. ഉടൻ PHC/CHC ലേക്ക് റഫർ ചെയ്യുക.',
      guidelineRefTag: 'MoHFW അപകട ലക്ഷണ മാർഗ്ഗരേഖ, പേജ് 14',
      readbackNotice: 'സഹായി വായിച്ചു കേൾപ്പിച്ചു: "എല്ലാം ശരിയാണോ?"',
      listenAgain: 'വീണ്ടും കേൾക്കുക',
      notCheckedTitle: 'പരിശോധിക്കാത്ത വിവരങ്ങൾ:',
      beneficiaryLabel: 'ഗുണഭോക്താവ്',
      visitTypeLabel: 'സന്ദർശന തരം',
      weightLabel: 'തൂക്കം',
      tempLabel: 'താപനില',
      vaccinationsLabel: 'വാക്സിനുകൾ',
      nextVisitDateLabel: 'അടുത്ത സന്ദർശന തീയതി',
      dangerSignsLabel: 'അപകട ലക്ഷണങ്ങൾ',
      confirmAndSave: 'സ്ഥിരീകരിച്ച് സേവ് ചെയ്യുക',
      reRecord: 'വീണ്ടും സംസാരിക്കുക',
      savedSuccessToast: 'വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!',
    },
    beneficiaries: {
      title: 'ഗുണഭോക്തൃ രജിസ്റ്റർ',
      totalRegistered: (count) => `ആകെ ${count} രജിസ്റ്റർ ചെയ്ത ഗുണഭോക്താക്കൾ`,
      addNew: 'പുതിയ ഗുണഭോക്താവ്',
      searchPlaceholder: 'പേര്, കോഡ് അല്ലെങ്കിൽ ഗ്രാമം തിരയുക...',
      all: 'എല്ലാം',
      pregnant: 'ഗർഭിണി',
      newborn: 'നവജാതശിശു',
      child: 'കുട്ടികൾ',
      idPrefix: 'കോഡ്: ',
      eddPrefix: 'പ്രതീക്ഷിത പ്രസവ തീയതി: ',
      dobPrefix: 'ജനന തീയതി: ',
      noResults: 'ഗുണഭോക്താക്കളെയൊന്നും കണ്ടെത്തിയില്ല.',
      seedNotice: 'ശ്രദ്ധിക്കുക: എല്ലാ വിവരങ്ങളും ഡെമോ ഡാറ്റ മാത്രമാണ്.',
      seedButton: 'ഡെമോ ഡാറ്റ ലോഡ് ചെയ്യുക',
      seeding: 'ലോഡ് ചെയ്യുന്നു...',
    },
    map: {
      filterAll: 'എല്ലാ വീടുകളും',
      filterToday: 'ഇന്നത്തെ റൂട്ട്',
      filterDanger: 'അപകട റഫറൽ',
      filterOverdue: 'കാലഹരണപ്പെട്ടവ',
      recentVisit: 'അടുത്തിടെ സന്ദർശിച്ചത്',
      referralPending: 'റഫറൽ ബാക്കി',
      overdueVaccine: 'വാക്സിൻ ബാക്കി',
      upcomingVisit: 'അടുത്ത സന്ദർശനം',
      navigate: 'വഴി കാട്ടുക',
      startVisit: 'സന്ദർശനം തുടങ്ങുക',
      dangerSignNotice: 'അപകട ലക്ഷണം: റഫറൽ പരിശോധന ബാക്കി',
    },
    month: {
      title: 'എന്റെ മാസം',
      subTitle: 'പ്രതിമാസ പ്രവർത്തന റിപ്പോർട്ട്',
      briefingTitle: 'ഇന്നത്തെ പ്രഭാത വിവരണം',
      briefingText: 'ശുഭദിനം ദീദി! ഇന്ന് 3 ഭവന സന്ദർശനങ്ങൾ ഉണ്ട്. 1 എണ്ണം കാലഹരണപ്പെട്ടതും 1 എണ്ണം അടിയന്തിര റഫറൽ പരിശോധനയുമാണ്.',
      listenBriefing: 'ശബ്ദത്തിൽ കേൾക്കുക',
      activityCounts: 'പ്രതിമാസ പ്രവർത്തന സംഗ്രഹം',
      totalTasksLogged: 'ആകെ ജോലികൾ',
      completedRecords: 'പൂർത്തിയായ രേഖകൾ',
      incompleteRecordsTitle: (count) => `അപൂർണ്ണ രേഖകൾ (${count})`,
      completeBtn: 'പൂർത്തിയാക്കുക',
      shareReportBtn: 'ANM പ്രതിവാര റിപ്പോർട്ട് പങ്കിടുക (PDF)',
      shareDisclaimer: '* സ്വകാര്യ വിവരങ്ങൾ അനുമതിയില്ലാതെ പങ്കിടില്ല.',
      completeStatus: (count) => `${count} പൂർത്തിയായി`,
      incompleteStatus: (count) => `${count} അപൂർണ്ണം`,
      ancVisits: 'ANC ഭവന സന്ദർശനങ്ങൾ',
      hbncCare: 'HBNC നവജാത ശിശു പരിചരണം',
      immunisationSessions: 'പ്രതിരോധ കുത്തിവയ്പ്പ് സെഷനുകൾ (VHND)',
      dangerReferrals: 'അപകട സൂചന റഫറലുകൾ',
      weightNotRecorded: 'ഭാരം രേഖപ്പെടുത്തിയിട്ടില്ല',
      vaccinationMissing: 'MR-1 കുത്തിവയ്പ്പ് തീയതി വിട്ടുപോയി',
      monthBadge: 'നവംബർ 2026',
    },
    sync: {
      synced: 'സമന്വയിപ്പിച്ചു',
      offline: 'ഓഫ്‌ലൈൻ',
      offlinePending: (count: number) => `ഓഫ്‌ലൈൻ (${count} ബാക്കി)`,
      syncing: 'സമന്വയിപ്പിക്കുന്നു...',
    },
    settings: {
      title: 'ക്രമീകരണങ്ങളും സ്വകാര്യതയും',
      subTitle: 'ആപ്പ് നിയന്ത്രണങ്ങളും സുരക്ഷയും',
      languageTitle: 'ഭാഷ',
      languageDesc: 'വോയ്‌സ്, ആപ്പ് ഭാഷ',
      latencyTitle: 'സ്പീഡ് മീറ്റർ',
      latencyDesc: 'മറുപടി ലഭിക്കുന്ന സമയം കാണിക്കുക',
      lastLatencyLabel: 'അവസാന പ്രതികരണ സമയം:',
      noiseModeTitle: 'നോയിസ് മോഡ്',
      noiseModeDesc: 'ശബ്ദമുള്ള സാഹചര്യങ്ങളിൽ നിശബ്ദ സമയം 1200ms ആയി വർദ്ധിപ്പിക്കുക',
      locationTitle: 'GPS ലൊക്കേഷൻ',
      locationDesc: 'സന്ദർശന സമയത്ത് വീടിന്റെ ലൊക്കേഷൻ സേവ് ചെയ്യുക',
      precisionLabel: 'ലൊക്കേഷൻ കൃത്യത:',
      villagePrecision: 'ഗ്രാമ തലം (~100m)',
      exactPrecision: 'കൃത്യമായ GPS',
      reminderTimeTitle: 'പ്രഭാത ഓർമ്മപ്പെടുത്തൽ സമയം',
      reminderTimeDesc: 'ദൈനംദിന അറിയിപ്പ് സമയം',
      demoDataTitle: 'ഡെമോ ഡാറ്റ',
      demoDataDesc: '8 സാമ്പിൾ ഗുണഭോക്താക്കളും 20 സന്ദർശനങ്ങളും ലോഡ് ചെയ്യുക',
      seedButton: 'ഡെമോ ഡാറ്റ പുനഃക്രമീകരിക്കുക',
      disclaimerTitle: 'നിയമപരമായ അറിയിപ്പ്',
      disclaimerMedical: 'ഇതൊരു സർട്ടിഫൈഡ് മെഡിക്കൽ ഉപകരണമല്ല. യാതൊരു ചികിത്സയും നൽകുന്നില്ല.',
      disclaimerSynthetic: 'സാമ്പിൾ ഡെമോ ഡാറ്റ മാത്രം. കൃത്യമായ സമ്മതമില്ലാതെ യഥാർത്ഥ വിവരങ്ങൾ ഉപയോഗിക്കില്ല.',
      deleteDataBtn: 'എന്റെ എല്ലാ വിവരങ്ങളും മായ്ക്കുക',
      deleteDataConfirm: 'എല്ലാ വിവരങ്ങളും ശാശ്വതമായി മായ്ക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?',
      deleteSuccess: 'ഡാറ്റ പൂർണ്ണമായും മായ്ച്ചു.',
    },
    consent: {
      welcomeTitle: 'ആശ വോയ്‌സ് രജിസ്റ്റർ',
      welcomeSubtitle: 'സംസാരിച്ച് ഭവന സന്ദർശനങ്ങൾ വേഗത്തിൽ രേഖപ്പെടുത്തുക',
      chooseLang: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
      safetyTitle: 'സ്വകാര്യതയും സുരക്ഷാ നിബന്ധനകളും',
      voiceAiTitle: 'AI വോയ്‌സ് അസിസ്റ്റന്റ്',
      voiceAiDesc: 'ഫോം പൂരിപ്പിക്കാൻ ശബ്ദം മാത്രമേ ഉപയോഗിക്കുന്നുള്ളൂ. യഥാർത്ഥ ഓഡിയോ സൂക്ഷിക്കില്ല.',
      locationTitle: 'ലൊക്കേഷൻ അനുമതി',
      locationDesc: 'മാപ്പിനായി നിങ്ങളുടെ അനുമതിയോടെ മാത്രമേ ലൊക്കേഷൻ എടുക്കൂ.',
      medicalTitle: 'മെഡിക്കൽ ഉപദേശമല്ല',
      medicalDesc: 'ഈ ആപ്പ് ചികിത്സ നൽകില്ല. അപകട ലക്ഷണം കണ്ടാൽ ആശുപത്രിയിലേക്ക് റഫർ ചെയ്യും.',
      agreeCheckbox: 'നിബന്ധനകൾ വായിച്ച് സമ്മതിക്കുന്നു',
      continueBtn: 'തുടരുക',
    },
  },

  mr: {
    appName: 'आशा व्हॉइस रजिस्टर',
    tagline: 'गृहभेटींची माहिती बोलून नोंदवा आणि वेळेवर काळजी घ्या',
    tabs: {
      today: 'आज',
      beneficiaries: 'लाभार्थी',
      record: 'नोंदवा',
      map: 'नక্शा',
      month: 'माझा महिना',
    },
    today: {
      greeting: 'नमस्ते, आशा ताई',
      subGreeting: 'आजचे गृहभेट वेळापत्रक व कामे',
      searchPlaceholder: 'लाभार्थी नाव, कोड किंवा गाव शोधा...',
      monthLabel: 'नोव्हेंबर २०२६',
      dangerBannerTitle: 'तातडीचे: धोक्याची लक्षणे रेफरल्स',
      dangerBannerMsg: (count) => `${count} लाभार्थ्याला तातडीने PHC/CHC मध्ये रेफर करणे आवश्यक आहे.`,
      overdueSection: (count) => `मुदत उलटून गेलेले (${count})`,
      dueTodaySection: (count) => `आजची कामे (${count})`,
      completedSection: (count) => `पूर्ण झालेली कामे (${count})`,
      emptyToday: 'आजसाठी कोणतीही प्रलंबित भेट नाही.',
      markDone: 'झाले',
      dueOn: 'दिनांक',
      urgentDangerBadge: 'तातडीचे रेफरल',
      overdueBadge: 'मुदत संपली',
      doneToast: 'काम पूर्ण झाले म्हणून नोंदवले गेले!',
    },
    recording: {
      aiDisclosureTitle: 'AI व्हॉइस सहाय्यक:',
      aiDisclosureMsg: 'नमस्ते आशा ताई! मी तुमचा AI सहाय्यक आहे. कृपया तुमच्या भेटीची माहिती बोला.',
      liveFieldsTitle: 'ओळखलेली माहिती:',
      transcriptTitle: 'तुमचा आवाज (ट्रान्सкрип्ट):',
      listening: 'ऐकत आहे... (थांबवण्यासाठी टॅप करा)',
      tapToSpeak: 'बोलण्यासाठी टॅप करा',
      cancel: 'रद्द करा',
      finish: 'पूर्ण झाले',
      pcmLabel: '16 kHz PCM',
    },
    confirm: {
      dangerAlertTitle: 'धोक्याचे लक्षण: त्वरित दवाखान्यात पाठवणे आवश्यक',
      dangerAlertMsg: 'लाभार्थ्यामध्ये तीव्र डोकेदुखी/अंधुक दिसणे नोंदवले गेले आहे. तातडीने PHC/CHC मध्ये पाठवा.',
      guidelineRefTag: 'MoHFW माता आरोग्य धोक्याची लक्षणे, पान १४',
      readbackNotice: 'सहाय्यकाने वाचून दाखवले: "सर्व बरोबर आहे का?"',
      listenAgain: 'पुन्हा ऐका',
      notCheckedTitle: 'तपासले नाही / अज्ञात:',
      beneficiaryLabel: 'लाभार्थी',
      visitTypeLabel: 'भेटीचा प्रकार',
      weightLabel: 'वजन',
      tempLabel: 'तापमान',
      vaccinationsLabel: 'देय लस',
      nextVisitDateLabel: 'पुढील भेटीची तारीख',
      dangerSignsLabel: 'धोक्याची लक्षणे',
      confirmAndSave: 'खात्री करा आणि जतन करा',
      reRecord: 'पुन्हा बोला',
      savedSuccessToast: 'नोंद यशस्वीरीत्या सेव्ह झाली!',
    },
    beneficiaries: {
      title: 'लाभार्थी रजिस्टर',
      totalRegistered: (count) => `एकूण ${count} नोंदणीकृत लाभार्थी`,
      addNew: 'नवीन लाभार्थी',
      searchPlaceholder: 'नाव, कोड किंवा गाव शोधा...',
      all: 'सर्व',
      pregnant: 'गरोदर माता',
      newborn: 'नवजात बाळ',
      child: 'लहान मुले',
      idPrefix: 'आयडी: ',
      eddPrefix: 'संभाव्य प्रसूती: ',
      dobPrefix: 'जन्म तारीख: ',
      noResults: 'कोणताही लाभार्थी सापडला नाही.',
      seedNotice: 'सूचना: सर्व माहिती फक्त नमुना (डेमो) डेटा आहे.',
      seedButton: 'डेमो डेटा लोड करा',
      seeding: 'लोड होत आहे...',
    },
    map: {
      filterAll: 'सर्व घरे',
      filterToday: 'आजचा मार्ग',
      filterDanger: 'धोका रेफरल',
      filterOverdue: 'मुदत संपलेले',
      recentVisit: 'नुकतीच झालेली भेट',
      referralPending: 'रेफरल प्रलंबित',
      overdueVaccine: 'लस बाकी',
      upcomingVisit: 'पुढील भेट',
      navigate: 'मार्ग दाखवा',
      startVisit: 'भेट सुरू करा',
      dangerSignNotice: 'धोक्याचे लक्षण: रेफरल तपासणी बाकी',
    },
    month: {
      title: 'माझा महिना',
      subTitle: 'मासिक कामांची नोंद व अहवाल',
      briefingTitle: 'आजचा सकाळचा सारांश',
      briefingText: 'सुप्रभात ताई! आज ३ गृहभेटी आहेत. १ भेट थकीत आहे आणि १ तातडीचे धोक्याचे लक्षण तपासणी करायची आहे.',
      listenBriefing: 'आवाजात ऐका',
      activityCounts: 'मासिक कामांचा सारांश',
      totalTasksLogged: 'एकूण नोंदवलेली कामे',
      completedRecords: 'पूर्ण नोंदी',
      incompleteRecordsTitle: (count) => `अपूर्ण नोंदी (${count})`,
      completeBtn: 'पूर्ण करा',
      shareReportBtn: 'ANM साप्ताहिक अहवाल शेअर करा (PDF)',
      shareDisclaimer: '* कोणतीही वैयक्तिक माहिती परवानगीशिवाय शेअर केली जात नाही.',
      completeStatus: (count) => `${count} पूर्ण`,
      incompleteStatus: (count) => `${count} अपूर्ण`,
      ancVisits: 'ANC गृहभेटी',
      hbncCare: 'HBNC नवजात शिशु काळजी',
      immunisationSessions: 'लसीकरण सत्रे (VHND)',
      dangerReferrals: 'धोक्याची लक्षणे रेफरल्स',
      weightNotRecorded: 'वजन नोंदवले नाही',
      vaccinationMissing: 'MR-1 लसीची तारीख सुटली',
      monthBadge: 'नोव्हेंबर 2026',
    },
    sync: {
      synced: 'सिंक झाले',
      offline: 'ऑफलाइन',
      offlinePending: (count: number) => `ऑफलाइन (${count} शिल्लक)`,
      syncing: 'सिंक होत आहे...',
    },
    settings: {
      title: 'सेटिंग्ज आणि गोपनीयता',
      subTitle: 'ॲप नियंत्रणे आणि सुरक्षा',
      languageTitle: 'भाषा',
      languageDesc: 'व्हॉइस व ॲपची भाषा',
      latencyTitle: 'स्पीड व लेटन्सी मीटर',
      latencyDesc: 'उत्तर येण्याचा वेळ दाखवा',
      lastLatencyLabel: 'मागील लेटन्सी:',
      noiseModeTitle: 'आवाज नियंत्रण मोड',
      noiseModeDesc: 'गोंगाटाच्या वातावरणात शांततेचा वेळ १२००ms वाढवा',
      locationTitle: 'GPS स्थान',
      locationDesc: 'भेटीदरम्यान घराचे स्थान जतन करा',
      precisionLabel: 'स्थान अचूकता:',
      villagePrecision: 'गाव पातळी (~100m)',
      exactPrecision: 'अचूक GPS',
      reminderTimeTitle: 'सकाळची आठवण वेळ',
      reminderTimeDesc: 'दैनंदिन सूचना वेळ',
      demoDataTitle: 'नमुना डेटा',
      demoDataDesc: '८ नमुना लाभार्थी आणि २० भेटी लोड करा',
      seedButton: 'डेमो डेटा रीसेट करा',
      disclaimerTitle: 'वैधानिक सूचना',
      disclaimerMedical: 'हे प्रमाणित वैद्यकीय उपकरण नाही. कोणताही वैद्यकीय सल्ला दिला जात नाही.',
      disclaimerSynthetic: 'फक्त नमुना डेमो डेटा. अधिकृत संमतीशिवाय कोणताही खरा डेटा वापरला जात नाही.',
      deleteDataBtn: 'माझा सर्व डेटा हटवा',
      deleteDataConfirm: 'तुम्हाला तुमचा सर्व डेटा कायमचा हटवायचा आहे का?',
      deleteSuccess: 'सर्व डेटा यशस्वीरीत्या हटवला गेला.',
    },
    consent: {
      welcomeTitle: 'आशा व्हॉइस रजिस्टर',
      welcomeSubtitle: 'बोलून गृहभेटींची नोंद करा आणि वेळेवर काळजी घ्या',
      chooseLang: 'भाषा निवडा',
      safetyTitle: 'गोपनीयता आणि सुरक्षा अटी',
      voiceAiTitle: 'AI व्हॉइस सहाय्यक',
      voiceAiDesc: 'तुमचा आवाज फक्त फॉर्म भरण्यासाठी वापरला जातो. मूळ ऑडिओ सेव्ह केला जात नाही.',
      locationTitle: 'स्थान संमती',
      locationDesc: 'नక্शा तयार करण्यासाठी तुमच्या संमतीनेच स्थान घेतले जाते.',
      medicalTitle: 'वैद्यकीय सल्ला नाही',
      medicalDesc: 'हे ॲप कोणताही उपचार सुचवत नाही. धोका असल्यास रुग्णालयात जाण्याचा सल्ला देते.',
      agreeCheckbox: 'मी सर्व अटी वाचल्या आहेत आणि मान्य करतो',
      continueBtn: 'पुढे जा',
    },
  },
};

export function getT(lang: SupportedLanguage): Translations {
  return translations[lang] || translations.en;
}

