import { describe, it, expect } from 'vitest';
import { checkRequirementCoverage } from '../lib/pipeline/coverageChecker';
import { Question, Requirement } from '../types/kit';

describe('Coverage Checker Logic', () => {
  const requirements: Requirement[] = [
    { id: 'r1', text: 'Node.js', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'MongoDB', kind: 'technical', priority: 'must' },
    { id: 'r3', text: 'GraphQL', kind: 'technical', priority: 'nice' },
  ];

  it('correctly identifies covered and uncovered must-have requirements', () => {
    const questions: Question[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'Node question', answer_outline: 'ans', difficulty: 2 },
    ];

    const result = checkRequirementCoverage(requirements, questions, 1);
    expect(result.uncovered_requirement_ids).toContain('r2');
    expect(result.uncovered_requirement_ids).not.toContain('r1');
    expect(result.uncovered_requirement_ids).not.toContain('r3'); // nice-to-have does not fail must-have coverage
    expect(result.passes).toBe(1);
  });

  it('returns empty uncovered list when all must-haves are covered', () => {
    const questions: Question[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'Node question', answer_outline: 'ans', difficulty: 2 },
      { id: 'q2', requirement_ids: ['r2'], category: 'technical', prompt: 'Mongo question', answer_outline: 'ans', difficulty: 2 },
    ];

    const result = checkRequirementCoverage(requirements, questions, 2);
    expect(result.uncovered_requirement_ids.length).toBe(0);
  });
});
