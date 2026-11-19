# ASHA Voice Register 🩺📱

A voice-first Android application enabling Accredited Social Health Activists (ASHA workers) on low-end smartphones to record home visit notes in Indic languages with English code-mix, generating structured records, MoHFW/NHM danger sign alerts, smart follow-up reminders, household maps, and monthly briefing reports.

---

## ⚠️ Statutory Regulatory & Clinical Disclaimer

> **NOT A CERTIFIED MEDICAL DEVICE**
>
> This software is an administrative and field data capture register designed to assist community health workers. It does not provide clinical diagnosis, medical prescriptions, or therapeutic treatments.
>
> **Clinical Validation Prerequisite**: Any real-world deployment or clinical use strictly requires prior independent review and validation of all clinical rule files (`shared/src/danger/danger_signs.json`) and incentive activity files (`shared/src/incentives.json`) by a qualified clinician or the designated national/state health authority (e.g., MoHFW / NHM).

---

## 🔒 Safety, Privacy & Security Architecture

1. **AI & Clinical Role Disclosure**: In Turn 1 of every voice session across all 7 supported languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi), the agent explicitly identifies itself as an AI assistant and discloses that it gives no medical advice.
2. **Clinical No-Advice Guard**: A dedicated safety guard (`shared/src/safety/noAdviceGuard.ts`) intercepts any spoken or text request asking for medication, drug dosages, clinical diagnosis, or home treatments. It strictly responds with a mandatory referral:
   > *"I cannot give medical advice or prescribe medicine. Please speak to the ANM or doctor at the PHC."*
3. **Deterministic Danger-Sign Engine**: Evaluates clinical danger signs using deterministic rule evaluation based on MoHFW/HBNC protocols. The LLM extraction pipeline cannot soften, suppress, or remove a flagged danger sign. When a key symptom is mentioned without an objective measurement (e.g. fever without temperature, or rapid breathing without breath count), the engine prompts for measurement rather than falsely reporting "no danger signs".
4. **DPDP Act Compliance & Data Minimisation**:
   - Zero raw audio or audio recordings are stored on disk or server.
   - Spoken audio is processed in-memory for STT and immediately discarded.
   - No persistent raw transcripts are retained.
   - Right to erasure: The user can permanently delete all their records, visits, and follow-ups at any time via Settings (`Delete All My Data`).
   - Location capture is strictly opt-in and can be toggled between Village-level (~1km) or Exact GPS. Location coordinates are excluded by default from shared reports.
5. **Polite, Supportive Reminders**: Reminder notifications use gentle, supportive phrasing without punitive words (e.g. "Wishing you a safe day in the field", "Please visit when convenient").
6. **No Voice Cloning**: Relay strictly uses stock `timbre-v3` voices from Gnani. No voice cloning or biometric voice replication is supported.
7. **Per-User Scoped Firestore Security**: Cloud Firestore security rules strictly isolate data under `/users/{userId}/**` requiring `request.auth.uid == userId`. Root collections and unauthorized cross-user access are denied.
8. **Relay Rate Limiting**: The relay enforces an in-memory rate limiter of 120 requests/minute per authenticated user to prevent denial-of-service and quota exhaustion.

---

## 📋 Rule Governance: Updating Clinical & Incentive Rules

All clinical danger sign thresholds and incentive activities are managed as declarative JSON rule files in the `@asha/shared` package.

### Build Guard Enforcement
A production build (`npm run build` or `npm test`) will **strictly fail and abort** via `scripts/verify-governance.mjs` if:
- Any danger sign or incentive activity has `"reviewed": false`.
- Any rule lacks an official `guideline_ref` (must include `guideline_id`, `section`, and `page`).

### How to Update Rules When Official Guidelines Change

When the Ministry of Health and Family Welfare (MoHFW) or National Health Mission (NHM) releases updated guidelines:

1. **Locate the Rule File**:
   - Danger sign rules: `shared/src/danger/danger_signs.json`
   - Incentive activities: `shared/src/incentives.json`
2. **Review Against Official Documents**:
   - Verify the exact guideline document title, publication year, section, and page number.
   - Ensure clinical thresholds (e.g., respiratory rate, temperature in Celsius, blood pressure) match the updated protocol exactly.
3. **Update the JSON Entry**:
   ```json
   {
     "id": "nb_fast_breathing",
     "applies_to": ["newborn"],
     "category": "respiratory",
     "trigger": {
       "type": "measurement",
       "field": "breaths_per_min",
       "operator": ">=",
       "value": 60,
       "unit": "breaths_per_min"
     },
     "guideline_ref": {
       "guideline_id": "mohfw_hbnc_2026",
       "section": "Management of Sick Newborn",
       "page": "24",
       "version": "2026"
     },
     "reviewed": true,
     "last_updated": "2026-11-19"
   }
   ```
4. **Clinical Sign-off**:
   - Mark `"reviewed": true` only after clinical validation by the supervising medical officer or health authority.
5. **Run Governance Validation**:
   ```bash
   npm run governance:check
   npm test
   ```

---

## 🛠️ Project Architecture & Tech Stack

```
asha-voice-register/
├── shared/     # Pure TypeScript clinical rules, normalisers, date calculators, and incentives
├── relay/      # Node.js Express + WebSocket relay for Gnani STT/TTS & Claude Haiku extraction
├── app/        # React + Vite + Tailwind + Zustand + Leaflet offline-first mobile web / Capacitor app
├── scripts/    # Rule governance and build verification scripts
└── test/       # End-to-end security, privacy, and firestore rules tests
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Zustand, React-Leaflet.
- **Relay**: Express, `ws` (WebSockets), Zod, Dotenv.
- **AI & Speech**: Gnani Voice (Timbre-v3 TTS & ASR), Anthropic Claude 3.5 Haiku (data extraction only; danger rules evaluated deterministically).
- **Offline Storage**: Firebase Firestore offline persistence + localStorage fallback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Node 22 / 26 supported)
- npm 10+

### Installation & Build
```bash
git clone https://github.com/Anupk17/Asha-.git
cd Asha-
npm install
npm run build
npm test
```

### Running Locally
```bash
# Terminal 1: Run Relay Server (Port 8080)
npm run dev:relay

# Terminal 2: Run Mobile Web App (Port 5174)
npm run dev:app
```
Access the application at `http://localhost:5174`.
