import { describe, it, expect } from 'vitest';
import { buildDeterministicSchedule } from '../lib/pipeline/scheduleAllocator';
import { Question, Requirement } from '../types/kit';

describe('Deterministic Schedule Allocator', () => {
  const sampleRequirements: Requirement[] = [
    { id: 'r1', text: 'React 5+ yrs', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'System Design', kind: 'technical', priority: 'must' },
    { id: 'r3', text: 'Mentoring', kind: 'behavioural', priority: 'nice' },
  ];

  const sampleQuestions: Question[] = [
    { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'React question', answer_outline: 'ans', difficulty: 2 },
    { id: 'q2', requirement_ids: ['r2'], category: 'system-design', prompt: 'Design question', answer_outline: 'ans', difficulty: 3 },
    { id: 'q3', requirement_ids: ['r3'], category: 'behavioural', prompt: 'Mentorship question', answer_outline: 'ans', difficulty: 1 },
  ];

  it('allocates material across exact number of requested days', () => {
    const result = buildDeterministicSchedule(3, sampleQuestions, sampleRequirements);
    expect(result.days_available).toBe(3);
    expect(result.days.length).toBe(3);
    expect(result.days[0].day).toBe(1);
    expect(result.days[1].day).toBe(2);
    expect(result.days[2].day).toBe(3);
  });

  it('places harder and must-have material earlier', () => {
    const result = buildDeterministicSchedule(3, sampleQuestions, sampleRequirements);
    // q2 is difficulty 3 and must-have -> should land in Day 1
    expect(result.days[0].question_ids).toContain('q2');
  });

  it('uses integer minutes for all day durations', () => {
    const result = buildDeterministicSchedule(5, sampleQuestions, sampleRequirements);
    result.days.forEach(day => {
      expect(Number.isInteger(day.minutes)).toBe(true);
      expect(day.minutes).toBeGreaterThan(0);
    });
  });
});
