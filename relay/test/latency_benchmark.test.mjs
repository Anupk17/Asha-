import test from 'node:test';
import assert from 'node:assert';

process.env.PORT = process.env.PORT || '8080';
process.env.GNANI_API_KEY = process.env.GNANI_API_KEY || 'dev_placeholder_gnani_key';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'mock_anthropic_key';

const { extractRecord } = await import('../dist/extract.js');
const { GnaniTtsStreamer } = await import('../dist/gnaniTts.js');

test('Latency Assessment: p50 and p95 over 30 turns of end-of-speech -> first agent audio', async () => {
  const turns = [
    'Meena Devi visit SYN-0001, vajan 52 kilo, tapman 36.8, agle somvar checkup',
    'Baby checkup day 14, doodh pee raha hai, weight 3.2 kg, breaths 45',
    'Pooja Kumari follow-up, high BP reported, sir dard tez hai',
    'Record Meena Devi visit, no complaints, next visit 2026-11-20',
    'Aarav Singh immunization, measles rubella 1 due, next visit next week',
    'Baby fever 38.2 celsius, cold extremities, refer to PHC',
    'Sunita baby checkup, weight 2.9 kg, breathing normal 44 per minute',
    'Rekha Pal SYN-0005, ANC 3 checkup done, IFA tablets given',
    'Meena ka visit ho gaya, sab normal hai',
    'Kavita Verma visit, pregnant, weight 58 kg, BP normal',
    'Baby chest indrawing pasli chal rahi hai, need immediate ambulance',
    'Gita Devi baby SYN-0007, routine follow up, normal feeding',
    'Manish Yadav checkup, child healthy, weight 12 kg',
    'Pooja Kumari follow up, blurring of vision resolved after rest',
    'Meena Devi next checkup due on Monday, confirmed with family',
    'Baby not feeding unable to suck breast milk, referral required',
    'Sunita baby routine checkup, BCG and OPV 0 administered',
    'Aarav Singh weight 9.5 kg, height normal, active and playful',
    'Rekha Pal BP 120 by 80, hemoglobin 11, iron tablets refill',
    'Emergency high fever in pregnant mother, temperature 39.1',
    'Baby temperature 35.0 hypothermia, kangaroo mother care initiated',
    'Meena Devi blood pressure 110 over 70, weight 53.5 kg',
    'Aarav Singh pentavalent 2 vaccination done, next dose in 4 weeks',
    'Newborn day 7 home visit, cord clean and dry, jaundice absent',
    'Pooja Kumari hemoglobin test result normal 11.2 gm/dl',
    'Sunita baby weight gain 250 grams in one week, thriving well',
    'Rekha Pal tetanus toxoid booster given, registered on RCH portal',
    'Baby respiratory rate 58 breaths per minute, observe closely',
    'Meena Devi routine checkup completed, scheduled 4th ANC checkup',
    'Final visit for the day completed, all records synced with PHC',
  ];

  assert.strictEqual(turns.length, 30, 'Must benchmark exactly 30 turns');

  const ttsStreamer = new GnaniTtsStreamer();
  const latencies = [];

  console.log('\n--- ⏱️ LATENCY BENCHMARK: 30 TURNS (END-OF-SPEECH -> FIRST AUDIO) ---');

  for (let i = 0; i < turns.length; i++) {
    const utterance = turns[i];
    const endOfSpeechTimestamp = performance.now();

    // 1. Extraction phase
    const extractRes = await extractRecord({
      transcript: utterance,
      beneficiaryType: i % 2 === 0 ? 'pregnant' : 'newborn',
    });

    // 2. Generate agent reply (concise <= 2 sentences)
    const replyText = extractRes.danger_flags.length > 0
      ? 'Danger sign detected! Immediate hospital referral is required.'
      : `Record saved for ${extractRes.record.beneficiary_name || 'beneficiary'}. Next visit scheduled.`;

    // 3. First audio chunk synthesis
    await new Promise((resolve) => {
      let firstChunkReceived = false;
      ttsStreamer.stream({
        text: replyText,
        language: 'en',
        onAudioChunk: () => {
          if (!firstChunkReceived) {
            firstChunkReceived = true;
            const firstAudioTimestamp = performance.now();
            const latencyMs = Math.round(firstAudioTimestamp - endOfSpeechTimestamp);
            latencies.push(latencyMs);
            resolve();
          }
        },
        onDone: () => {
          if (!firstChunkReceived) resolve();
        },
      });
    });
  }

  // Calculate p50 and p95
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const minLatency = latencies[0];
  const maxLatency = latencies[latencies.length - 1];

  console.log(`Turns evaluated: ${latencies.length}/30`);
  console.log(`Min Latency    : ${minLatency}ms`);
  console.log(`p50 (Median)   : ${p50}ms`);
  console.log(`p95            : ${p95}ms`);
  console.log(`Max Latency    : ${maxLatency}ms`);
  console.log('----------------------------------------------------\n');

  // Verify latency targets for snappy edge voice interaction
  assert.ok(p50 < 400, `p50 must be under 400ms, got ${p50}ms`);
  assert.ok(p95 < 800, `p95 must be under 800ms, got ${p95}ms`);
});
