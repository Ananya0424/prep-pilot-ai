import { Question, Requirement, Schedule, ScheduleDay } from '@/types/kit';

/**
 * DETERMINISTIC (NON-LLM) SCHEDULE ALLOCATOR
 * Arithmetic allocation of questions across requested days_available.
 * Priority: Harder & Must-have items land earlier.
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
      focus: `Day ${i + 1}: General Preparation`,
      question_ids: [],
      minutes: 45,
    }));
    return { days_available: safeDays, days };
  }

  // Create requirement priority lookup
  const reqPriorityMap = new Map<string, 'must' | 'nice'>();
  requirements.forEach(r => reqPriorityMap.set(r.id, r.priority));

  // Sort questions: Must-have first, then Difficulty (3 > 2 > 1)
  const sortedQuestions = [...questions].sort((a, b) => {
    const aMust = a.requirement_ids.some(id => reqPriorityMap.get(id) === 'must');
    const bMust = b.requirement_ids.some(id => reqPriorityMap.get(id) === 'must');

    if (aMust && !bMust) return -1;
    if (!aMust && bMust) return 1;

    return b.difficulty - a.difficulty; // Higher difficulty earlier
  });

  // Initialize days
  const days: ScheduleDay[] = Array.from({ length: safeDays }, (_, i) => ({
    day: i + 1,
    focus: '',
    question_ids: [],
    minutes: 0,
  }));

  // Sequential chunking: earlier days get the front of the sorted array (harder & must-have)
  const itemsPerDay = Math.ceil(sortedQuestions.length / safeDays);
  
  sortedQuestions.forEach((q, idx) => {
    // Determine which day this goes to sequentially
    const targetDayIndex = Math.min(Math.floor(idx / itemsPerDay), safeDays - 1);
    days[targetDayIndex].question_ids.push(q.id);

    // Duration based on difficulty: diff 3 = 45m, diff 2 = 30m, diff 1 = 20m
    const qMinutes = q.difficulty === 3 ? 45 : q.difficulty === 2 ? 30 : 20;
    days[targetDayIndex].minutes += qMinutes;
  });

  // Ensure every day has a non-zero integer duration and clear focus title
  days.forEach((dayObj, i) => {
    if (dayObj.minutes === 0) dayObj.minutes = 30; // fallback integer minutes

    // Determine focus title from question categories in that day
    const dayQuestions = questions.filter(q => dayObj.question_ids.includes(q.id));
    const categories = Array.from(new Set(dayQuestions.map(q => q.category)));

    if (categories.length > 0) {
      const catTitle = categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ');
      dayObj.focus = `Day ${i + 1}: ${catTitle}`;
    } else {
      dayObj.focus = `Day ${i + 1}: General Review & Prep`;
    }
  });

  return {
    days_available: safeDays,
    days,
  };
}
