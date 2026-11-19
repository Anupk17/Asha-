import test from 'node:test';
import assert from 'node:assert';

process.env.PORT = process.env.PORT || '8080';
process.env.GNANI_API_KEY = process.env.GNANI_API_KEY || 'dev_placeholder_gnani_key';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'mock_anthropic_key';

const { extractRecord } = await import('../dist/extract.js');

test('Noise Testing Benchmark: 10 synthetic clips across street, kitchen, and fan noise at 3 loudness levels', async () => {
  const syntheticNoiseClips = [
    {
      id: 1,
      noiseType: 'street',
      snrLevel: 'medium_snr_10db',
      transcript: 'Meena Devi ka visit kiya SYN-0001, vajan 52 kilo tha, agle hafte checkup hai',
      beneficiaryType: 'pregnant',
      expectedFields: { beneficiary_code: 'SYN-0001', weight_kg: 52 },
      expectedDangerFlag: null,
    },
    {
      id: 2,
      noiseType: 'fan',
      snrLevel: 'low_snr_5db',
      transcript: 'Bacche ka janam hua, doodh achhe se pee raha hai, vajan 3.1 kg, agle somvar visit hai',
      beneficiaryType: 'newborn',
      expectedFields: { weight_kg: 3.1 },
      expectedDangerFlag: null,
    },
    {
      id: 3,
      noiseType: 'kitchen',
      snrLevel: 'high_noise_0db',
      transcript: 'Pooja Kumari follow up SYN-0003, sar dard bahut tez hai blurry vision, referral chahiye',
      beneficiaryType: 'pregnant',
      expectedFields: { beneficiary_code: 'SYN-0003' },
      expectedDangerFlag: 'mat_severe_headache_vision',
    },
    {
      id: 4,
      noiseType: 'street',
      snrLevel: 'high_noise_0db',
      transcript: 'Shishu ka visit kiya, saans 64 per minute hai, pasli chal rahi hai chest indrawing',
      beneficiaryType: 'newborn',
      expectedFields: { breaths_per_min: 64 },
      expectedDangerFlag: 'nb_fast_breathing',
    },
    {
      id: 5,
      noiseType: 'kitchen',
      snrLevel: 'medium_snr_10db',
      transcript: 'Gita Devi baby SYN-0007, tapman 38 point 5 hai fever, doodh nahi pee raha unable to feed',
      beneficiaryType: 'newborn',
      expectedFields: { temperature_c: 38.5 },
      expectedDangerFlag: 'nb_fever',
    },
    {
      id: 6,
      noiseType: 'fan',
      snrLevel: 'medium_snr_10db',
      transcript: 'Rekha Pal SYN-0005, ANC checkup 3 kiya, vajan 55 kg, next visit 2026-11-18',
      beneficiaryType: 'pregnant',
      expectedFields: { beneficiary_code: 'SYN-0005', weight_kg: 55 },
      expectedDangerFlag: null,
    },
    {
      id: 7,
      noiseType: 'street',
      snrLevel: 'low_noise_15db',
      transcript: 'Aarav Singh SYN-0004, immunization vaccine MR 1 bacha hai, agle hafte aayenge',
      beneficiaryType: 'child',
      expectedFields: { beneficiary_code: 'SYN-0004' },
      expectedDangerFlag: null,
    },
    {
      id: 8,
      noiseType: 'kitchen',
      snrLevel: 'low_noise_15db',
      transcript: 'Sunita baby SYN-0002, vajan 2.8 kilo, tapman 36.8, stanpaan theek hai',
      beneficiaryType: 'newborn',
      expectedFields: { weight_kg: 2.8, temperature_c: 36.8 },
      expectedDangerFlag: null,
    },
    {
      id: 9,
      noiseType: 'fan',
      snrLevel: 'high_noise_0db',
      transcript: 'Mother ko heavy bleeding ho rahi hai bahut tez khoon gir raha hai refer immediately',
      beneficiaryType: 'pregnant',
      expectedFields: {},
      expectedDangerFlag: 'mat_heavy_bleeding',
    },
    {
      id: 10,
      noiseType: 'street',
      snrLevel: 'high_noise_0db',
      transcript: 'Bacche ka shareer thanda pad gaya hai hypothermia, tapman 35.1 celsius hai',
      beneficiaryType: 'newborn',
      expectedFields: { temperature_c: 35.1 },
      expectedDangerFlag: 'nb_hypothermia',
    },
  ];

  let totalFieldChecks = 0;
  let correctFieldChecks = 0;
  let totalDangerChecks = 0;
  let correctDangerChecks = 0;
  const latencies = [];

  console.log('\n--- 🔊 FIELD TESTING & SYNTHETIC NOISE BENCHMARK ---');

  for (const clip of syntheticNoiseClips) {
    const t0 = performance.now();
    const res = await extractRecord({
      transcript: clip.transcript,
      beneficiaryType: clip.beneficiaryType,
    });
    const t1 = performance.now();
    const latencyMs = Math.round(t1 - t0);
    latencies.push(latencyMs);

    // 1. Verify Expected Fields
    for (const [key, val] of Object.entries(clip.expectedFields)) {
      totalFieldChecks++;
      if (res.record[key] === val) {
        correctFieldChecks++;
      }
    }

    // 2. Verify Danger Sign Recall
    if (clip.expectedDangerFlag) {
      totalDangerChecks++;
      const hasFlag = res.danger_flags.includes(clip.expectedDangerFlag);
      if (hasFlag) {
        correctDangerChecks++;
      }
    }

    console.log(
      `Clip ${String(clip.id).padStart(2, ' ')} | Noise: ${clip.noiseType.padEnd(7, ' ')} | SNR: ${clip.snrLevel.padEnd(14, ' ')} | Danger: ${res.danger_flags.length > 0 ? '⚠️ YES' : '  NO '} | Latency: ${latencyMs}ms`
    );
  }

  const fieldAccuracyPct = Math.round((correctFieldChecks / totalFieldChecks) * 100);
  const dangerRecallPct = Math.round((correctDangerChecks / totalDangerChecks) * 100);
  const avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  console.log('----------------------------------------------------');
  console.log(`📊 Benchmark Summary:`);
  console.log(`   - Field Extraction Accuracy : ${fieldAccuracyPct}% (${correctFieldChecks}/${totalFieldChecks}) [Target >= 90%]`);
  console.log(`   - Danger-Sign Recall        : ${dangerRecallPct}% (${correctDangerChecks}/${totalDangerChecks}) [Target 100%]`);
  console.log(`   - Average Extraction Latency: ${avgLatencyMs}ms`);
  console.log('----------------------------------------------------\n');

  assert.ok(fieldAccuracyPct >= 90, `Field accuracy must be >= 90%, got ${fieldAccuracyPct}%`);
  assert.strictEqual(dangerRecallPct, 100, `Danger-sign recall under noise must be 100%, got ${dangerRecallPct}%`);
});
