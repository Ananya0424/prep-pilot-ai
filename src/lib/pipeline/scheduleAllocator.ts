import { Question, Requirement, Schedule, ScheduleDay } from '@/types/kit';

/**
 * DETERMINISTIC SCHEDULE ALLOCATOR
 * Groups questions by topic & allocates multiple questions per day.
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

  // Flattened ordered question list (Technical & System Design early, Behavioural & Company Fit later)
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

  // Assign questions to days ensuring multiple questions per day
  const targetPerDay = Math.max(2, Math.ceil(orderedQuestions.length / safeDays));

  orderedQuestions.forEach((q, idx) => {
    const targetDayIndex = Math.min(Math.floor(idx / targetPerDay), safeDays - 1);
    days[targetDayIndex].question_ids.push(q.id);
  });

  // Ensure later empty or 1-item days get linked review questions from earlier topics
  days.forEach((dayObj, i) => {
    if (dayObj.question_ids.length === 0) {
      // Pick 2-3 questions from all available questions for review
      const reviewQs = questions.slice((i * 2) % questions.length, ((i * 2) + 3) % questions.length || questions.length);
      dayObj.question_ids = reviewQs.map(q => q.id);
    }

    // Calculate total duration (each question ~20-30 mins)
    const dayQuestions = questions.filter(q => dayObj.question_ids.includes(q.id));
    const totalMins = dayQuestions.reduce((sum, q) => sum + (q.difficulty === 3 ? 45 : q.difficulty === 2 ? 30 : 20), 0);
    dayObj.minutes = Math.max(45, totalMins);

    // Build clean Topic Focus title WITHOUT duplicate "Day X:"
    const categories = Array.from(new Set(dayQuestions.map(q => q.category)));
    if (categories.includes('system-design')) {
      dayObj.focus = 'System Design & High Availability Architecture';
    } else if (categories.includes('technical')) {
      dayObj.focus = 'Core Technical Concepts & API Development';
    } else if (categories.includes('behavioural')) {
      dayObj.focus = 'Behavioural & Leadership Scenarios';
    } else if (categories.includes('company-fit')) {
      dayObj.focus = 'Company Culture & Fit Alignment';
    } else {
      dayObj.focus = 'Full-Stack Review & Practice Session';
    }
  });

  return {
    days_available: safeDays,
    days,
  };
}
