/**
 * Relative date normaliser for home visits and follow-up scheduling.
 * Converts phrases like "kal", "parso", "agle somvar", "next monday", "15 tareekh" to ISO YYYY-MM-DD.
 */

const DAYS_OF_WEEK: Record<string, number> = {
  sunday: 0, ravi: 0, ravivar: 0, itwar: 0,
  monday: 1, som: 1, somvar: 1, pir: 1,
  tuesday: 2, mangal: 2, mangalvar: 2,
  wednesday: 3, budh: 3, budhvar: 3,
  thursday: 4, guru: 4, guruvar: 4, brihaspati: 4,
  friday: 5, shukra: 5, shukravar: 5, jumma: 5,
  saturday: 6, shani: 6, shanivar: 6,
};

export function parseRelativeDate(text: string, baseDate: Date = new Date()): string | null {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // 1. Direct ISO Date match YYYY-MM-DD
  const isoMatch = clean.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return isoMatch[1];
  }

  const d = new Date(baseDate.getTime());

  // 2. Day after tomorrow: "parso", "day after tomorrow"
  if (clean.includes('parso') || clean.includes('day after tomorrow')) {
    d.setDate(d.getDate() + 2);
    return formatIso(d);
  }

  // 3. Tomorrow: "kal", "tomorrow"
  if (clean.includes('kal') || clean.includes('tomorrow')) {
    d.setDate(d.getDate() + 1);
    return formatIso(d);
  }

  // 4. Today: "aaj", "today"
  if (clean.includes('aaj') || clean.includes('today')) {
    return formatIso(d);
  }

  // 5. In N days / N din baad: "3 din baad", "in 3 days"
  const inDaysMatch = clean.match(/(\d+)\s*(days?|din)/);
  if (inDaysMatch) {
    const daysToAdd = parseInt(inDaysMatch[1], 10);
    d.setDate(d.getDate() + daysToAdd);
    return formatIso(d);
  }

  // 6. Day of week: "agle somvar", "next monday", "somvar ko"
  for (const [dayName, targetDay] of Object.entries(DAYS_OF_WEEK)) {
    if (clean.includes(dayName)) {
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0 || clean.includes('agle') || clean.includes('next')) {
        diff += 7;
      }
      d.setDate(d.getDate() + diff);
      return formatIso(d);
    }
  }

  // 7. Day of month: "15 tareekh", "15th", "tareekh 20"
  const dateOfMonthMatch = clean.match(/(\d{1,2})\s*(tareekh|tarikh|th|st|nd|rd)/) || clean.match(/(tareekh|tarikh)\s*(\d{1,2})/);
  if (dateOfMonthMatch) {
    const day = parseInt(dateOfMonthMatch[1] || dateOfMonthMatch[2], 10);
    if (day >= 1 && day <= 31) {
      d.setDate(day);
      const isPastIntent = clean.includes('gaye') || clean.includes('the') || clean.includes('thi') || clean.includes('hui') || clean.includes('past') || clean.includes('visited');
      // Only advance month if explicit future follow-up intent is stated and day has passed
      if (!isPastIntent && (clean.includes('agle') || clean.includes('next') || clean.includes('aana'))) {
        if (d.getTime() < baseDate.getTime()) {
          d.setMonth(d.getMonth() + 1);
        }
      }
      return formatIso(d);
    }
  }

  return null;
}

function formatIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
