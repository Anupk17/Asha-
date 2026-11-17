import { type FollowUp, addDays, getTodayIST, findFollowUpByVoiceCommand } from '@asha/shared';

export interface VoiceQueryResult {
  type: 'today_pending' | 'tomorrow_visits' | 'overdue' | 'beneficiary_next' | 'mark_done' | 'unrecognized';
  spokenResponse: string; // At most 2 spoken sentences
  matchedTasks: FollowUp[];
  targetBeneficiary?: string;
  markedDoneTask?: FollowUp;
}

/**
 * Format names according to requirement:
 * "If more than 3 items, say the count and the first 3 names."
 * Max 2 spoken sentences strictly respected.
 */
function formatSpokenList(
  items: FollowUp[],
  timeframeLabelEn: string,
  timeframeLabelHi: string,
  isHindi: boolean
): string {
  const count = items.length;
  if (count === 0) {
    return isHindi
      ? `${timeframeLabelHi} कोई भेंट लंबित नहीं है।`
      : `You have no visits scheduled ${timeframeLabelEn}.`;
  }

  const names = items.map((i) => i.beneficiary_name);

  if (count <= 3) {
    const listStr = names.join(', ');
    return isHindi
      ? `${timeframeLabelHi} ${count} भेंट निर्धारित हैं: ${listStr}।`
      : `You have ${count} visit${count > 1 ? 's' : ''} ${timeframeLabelEn}: ${listStr}.`;
  }

  // More than 3 items: say count and first 3 names
  const first3 = names.slice(0, 3).join(', ');
  const remaining = count - 3;
  return isHindi
    ? `${timeframeLabelHi} कुल ${count} भेंट हैं, जिनमें ${first3}, और ${remaining} अन्य शामिल हैं। पूरी सूची स्क्रीन पर दिखाई जा रही है।`
    : `You have ${count} visits ${timeframeLabelEn}: ${first3}, and ${remaining} more. Full list is displayed on your screen.`;
}

/**
 * Voice query processor for ASHA workflow assistant.
 * Handles:
 * 1. "Aaj kiske follow-up pending hain?"
 * 2. "Kal kiska visit hai?"
 * 3. "Overdue kaun hai?"
 * 4. "Meena ka next visit kab hai?"
 * 5. "Meena ka visit ho gaya" (Voice completion)
 */
export function processVoiceQuery(
  spokenText: string,
  followUps: FollowUp[],
  language: string = 'en',
  referenceDateISO?: string
): VoiceQueryResult {
  const clean = spokenText.toLowerCase().trim();
  const today = referenceDateISO || getTodayIST();
  const tomorrow = addDays(today, 1);
  const isHindi = language === 'hi';

  const activeTasks = followUps.filter((f) => f.status !== 'done' && f.status !== 'cancelled');

  // 1. Spoken Completion Command: "Meena ka visit ho gaya" / "Meena done"
  const doneMatch = findFollowUpByVoiceCommand(followUps, spokenText);
  if (doneMatch.matchedTask) {
    const task = doneMatch.matchedTask;
    const spoken = isHindi
      ? `सत्यापित हुआ। ${task.beneficiary_name} की ${task.type} भेंट पूरी दर्ज कर दी गई है।`
      : `Confirmed. Visit for ${task.beneficiary_name} has been marked as completed.`;

    return {
      type: 'mark_done',
      spokenResponse: spoken,
      matchedTasks: [task],
      targetBeneficiary: task.beneficiary_name,
      markedDoneTask: task,
    };
  }

  // 2. Query: "Aaj kiske follow-up pending hain?" / "Who has visits today?"
  if (
    clean.includes('aaj') ||
    clean.includes('today') ||
    clean.includes('pending today') ||
    clean.includes('आज')
  ) {
    const todayTasks = activeTasks.filter((t) => t.due_date === today);
    const spoken = formatSpokenList(todayTasks, 'today', 'आज के लिए', isHindi);
    return {
      type: 'today_pending',
      spokenResponse: spoken,
      matchedTasks: todayTasks,
    };
  }

  // 3. Query: "Kal kiska visit hai?" / "Who has visits tomorrow?"
  if (
    clean.includes('kal') ||
    clean.includes('tomorrow') ||
    clean.includes('कल')
  ) {
    const tomorrowTasks = activeTasks.filter((t) => t.due_date === tomorrow);
    const spoken = formatSpokenList(tomorrowTasks, 'tomorrow', 'कल के लिए', isHindi);
    return {
      type: 'tomorrow_visits',
      spokenResponse: spoken,
      matchedTasks: tomorrowTasks,
    };
  }

  // 4. Query: "Overdue kaun hai?" / "Who is overdue?"
  if (
    clean.includes('overdue') ||
    clean.includes('deri') ||
    clean.includes('chhut') ||
    clean.includes('late') ||
    clean.includes('ओवरड्यू') ||
    clean.includes('बकाया')
  ) {
    const overdueTasks = activeTasks.filter((t) => t.status === 'overdue' || t.due_date < today);
    const spoken = formatSpokenList(overdueTasks, 'overdue', 'ओवरड्यू में', isHindi);
    return {
      type: 'overdue',
      spokenResponse: spoken,
      matchedTasks: overdueTasks,
    };
  }

  // 5. Query: "Meena ka next visit kab hai?" / "When is Meena's next visit?"
  if (
    clean.includes('next visit') ||
    clean.includes('kab hai') ||
    clean.includes('agli bhent') ||
    clean.includes('when is') ||
    clean.includes('अगली') ||
    clean.includes('कब है')
  ) {
    // Look for matching beneficiary in active tasks
    for (const task of followUps) {
      const firstName = task.beneficiary_name.split(' ')[0].toLowerCase();
      const code = task.beneficiary_code.toLowerCase();

      if (clean.includes(firstName) || clean.includes(code)) {
        const beneficiaryTasks = followUps
          .filter(
            (f) =>
              (f.beneficiary_code === task.beneficiary_code || f.beneficiary_name === task.beneficiary_name) &&
              f.status !== 'done'
          )
          .sort((a, b) => a.due_date.localeCompare(b.due_date));

        if (beneficiaryTasks.length > 0) {
          const nextTask = beneficiaryTasks[0];
          const spoken = isHindi
            ? `${nextTask.beneficiary_name} की अगली भेंट ${nextTask.due_date} को ${nextTask.type} के लिए है।`
            : `${nextTask.beneficiary_name}'s next visit is scheduled for ${nextTask.due_date}, for ${nextTask.type}.`;

          return {
            type: 'beneficiary_next',
            spokenResponse: spoken,
            matchedTasks: beneficiaryTasks,
            targetBeneficiary: nextTask.beneficiary_name,
          };
        } else {
          const spoken = isHindi
            ? `${task.beneficiary_name} के लिए कोई आगामी भेंट निर्धारित नहीं है।`
            : `No upcoming visits are currently scheduled for ${task.beneficiary_name}.`;

          return {
            type: 'beneficiary_next',
            spokenResponse: spoken,
            matchedTasks: [],
            targetBeneficiary: task.beneficiary_name,
          };
        }
      }
    }
  }

  // 6. Unrecognized
  const fallbackSpoken = isHindi
    ? 'आप पूछ सकती हैं कि आज, कल, या किसका विजिट ओवरड्यू है, या किसी लाभार्थी का नाम ले सकती हैं।'
    : 'You can ask who has visits today, tomorrow, who is overdue, or check a beneficiary\'s next visit.';

  return {
    type: 'unrecognized',
    spokenResponse: fallbackSpoken,
    matchedTasks: activeTasks,
  };
}
