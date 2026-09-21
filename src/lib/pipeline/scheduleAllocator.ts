import { Question, Requirement, Schedule, ScheduleDay } from '@/types/kit';

/**
 * DETERMINISTIC SCHEDULE ALLOCATOR
 * Groups questions by topic & allocates at least 5 questions per day for thorough preparation.
 */
export function buildDeterministicSchedule(
  daysAvailable: number,
  questions: Question[],
  requirements: Requirement[]
): Schedule {
  const safeDays = Math.max(1, Math.floor(daysAvailable));

  if (questions.length === 0) {
    const days: ScheduleDay[] = Array.from({ length: safeDays }, (_, i) => ({
      day: i + 1,
      focus: `General Review & Interview Prep`,
      question_ids: [],
      minutes: 45,
    }));
    return { days_available: safeDays, days };
  }

  // Group questions by category/topic
  const topicMap: Record<string, Question[]> = {
    technical: [],
    'system-design': [],
    behavioural: [],
    'company-fit': []
  };

  questions.forEach(q => {
    const cat = q.category || 'technical';
    if (!topicMap[cat]) topicMap[cat] = [];
    topicMap[cat].push(q);
  });

  // Flattened ordered question list
  const orderedQuestions = [
    ...(topicMap['technical'] || []),
    ...(topicMap['system-design'] || []),
    ...(topicMap['behavioural'] || []),
    ...(topicMap['company-fit'] || [])
  ];

  // Initialize days
  const days: ScheduleDay[] = Array.from({ length: safeDays }, (_, i) => ({
    day: i + 1,
    focus: '',
    question_ids: [],
    minutes: 0,
  }));

  // Initial distribution
  const targetPerDay = Math.max(3, Math.ceil(orderedQuestions.length / safeDays));
  orderedQuestions.forEach((q, idx) => {
    const targetDayIndex = Math.min(Math.floor(idx / targetPerDay), safeDays - 1);
    days[targetDayIndex].question_ids.push(q.id);
  });

  // Ensure EVERY DAY gets at least 5 questions for thorough practice
  days.forEach((dayObj, i) => {
    let offset = 0;
    while (dayObj.question_ids.length < 5 && questions.length > 0) {
      const candidateQ = questions[(i * 2 + offset) % questions.length];
      if (candidateQ && !dayObj.question_ids.includes(candidateQ.id)) {
        dayObj.question_ids.push(candidateQ.id);
      }
      offset++;
      if (offset > questions.length * 2) break;
    }

    // Calculate total duration (each question ~15-25 mins)
    const dayQuestions = questions.filter(q => dayObj.question_ids.includes(q.id));
    const totalMins = dayQuestions.reduce((sum, q) => sum + (q.difficulty === 3 ? 30 : q.difficulty === 2 ? 20 : 15), 0);
    dayObj.minutes = Math.max(60, totalMins);

    // Build clean Topic Focus title WITHOUT "Day X:" prefix or question prompts on schedule page
    const categories = Array.from(new Set(dayQuestions.map(q => q.category)));
    if (categories.includes('system-design')) {
      dayObj.focus = 'System Design & High Availability Architecture';
    } else if (categories.includes('technical')) {
      dayObj.focus = 'Core Technical Concepts & API Development';
    } else if (categories.includes('behavioural')) {
      dayObj.focus = 'Behavioural & Leadership Scenarios';
    } else if (categories.includes('company-fit')) {
      dayObj.focus = 'Company Culture & Values Alignment';
    } else {
      dayObj.focus = 'Full-Stack Technical Review & Practice';
    }
  });

  return {
    days_available: safeDays,
    days,
  };
}
