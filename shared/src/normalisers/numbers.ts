/**
 * Spoken number normaliser for Hindi, English, and Hinglish.
 * Converts phrases like "do point aath kilo", "one hundred point four", "painsath" to numeric values.
 */

const WORD_TO_DIGIT: Record<string, number> = {
  zero: 0, shunya: 0,
  one: 1, ek: 1,
  two: 2, do: 2,
  three: 3, teen: 3,
  four: 4, char: 4, chaar: 4,
  five: 5, panch: 5, paanch: 5,
  six: 6, chhah: 6, che: 6,
  seven: 7, saat: 7,
  eight: 8, aath: 8, ath: 8,
  nine: 9, nau: 9,
  ten: 10, das: 10,
  eleven: 11, gyarah: 11,
  twelve: 12, barah: 12,
  thirteen: 13, terah: 13,
  fourteen: 14, chaudah: 14,
  fifteen: 15, pandrah: 15,
  sixteen: 16, solah: 16,
  seventeen: 17, satrah: 17,
  eighteen: 18, atharah: 18,
  nineteen: 19, unnees: 19,
  twenty: 20, bees: 20,
  twentyone: 21, ikkees: 21,
  twentytwo: 22, baees: 22,
  twentythree: 23, teees: 23,
  twentyfour: 24, chaubees: 24,
  twentyfive: 25, pachchees: 25,
  thirty: 30, tees: 30,
  thirtyfive: 35, paitis: 35,
  forty: 40, chalees: 40,
  fortyfive: 45, paitalis: 45,
  fifty: 50, pachas: 50,
  fiftyfive: 55, pachpan: 55,
  sixty: 60, saath: 60,
  sixtyfive: 65, painsath: 65,
  seventy: 70, sattar: 70,
  eighty: 80, assi: 80,
  ninety: 90, nabbe: 90,
  hundred: 100, sau: 100,
};

export function parseSpokenNumber(text: string): number | null {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // 1. Direct standard float/integer match
  const directMatch = clean.match(/(\d+(\.\d+)?)/);
  if (directMatch) {
    return parseFloat(directMatch[1]);
  }

  // 2. Point / Decimal spoken words (e.g. "do point aath", "two point eight")
  if (clean.includes('point') || clean.includes('dashamlav')) {
    const parts = clean.split(/point|dashamlav/);
    if (parts.length === 2) {
      const left = parseSpokenNumber(parts[0]);
      const right = parseSpokenNumber(parts[1]);
      if (left !== null && right !== null) {
        return parseFloat(`${left}.${right}`);
      }
    }
  }

  // 3. Spoken compounds (e.g. "teen sau" -> 300, "one hundred point four")
  const tokens = clean.split(/\s+/);
  let total = 0;
  let current = 0;
  let found = false;

  for (const tok of tokens) {
    if (WORD_TO_DIGIT[tok] !== undefined) {
      found = true;
      const val = WORD_TO_DIGIT[tok];
      if (val === 100) {
        current = (current === 0 ? 1 : current) * 100;
      } else {
        current += val;
      }
    } else {
      if (current > 0) {
        total += current;
        current = 0;
      }
    }
  }
  total += current;

  return found ? total : null;
}

/**
 * Validates clinical measurements against physiological bounds.
 * Flagged out-of-range values require explicit human confirmation.
 */
export function validateMeasurementSanity(
  field: 'weight_kg' | 'temperature_c' | 'breaths_per_min',
  val: number
): { isValid: boolean; warning?: string } {
  if (field === 'weight_kg') {
    // 0.5kg (extreme preemie) to 180kg (maternal obesity)
    if (val < 0.5 || val > 180) {
      return { isValid: false, warning: `Weight of ${val} kg is outside safe clinical bounds (0.5 to 180 kg)` };
    }
  } else if (field === 'temperature_c') {
    // Convert Fahrenheit if detected > 60
    let tempC = val;
    if (val > 60) {
      tempC = (val - 32) * (5 / 9);
    }
    if (tempC < 30.0 || tempC > 44.0) {
      return { isValid: false, warning: `Temperature of ${val}° is outside human survival bounds (30°C to 44°C)` };
    }
  } else if (field === 'breaths_per_min') {
    if (val < 10 || val > 140) {
      return { isValid: false, warning: `Breaths per minute (${val}) is outside plausible bounds (10 to 140)` };
    }
  }

  return { isValid: true };
}

