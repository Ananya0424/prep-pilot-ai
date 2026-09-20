import { Requirement, Question, Coverage } from '@/types/kit';

/**
 * DETERMINISTIC (NON-LLM) COVERAGE CHECKER
 * Compares generated questions against extracted requirements.
 * Identifies any MUST-HAVE requirement ID that has 0 associated questions.
 */
export function checkRequirementCoverage(
  requirements: Requirement[],
  questions: Question[],
  currentPassCount: number
): Coverage {
  // Extract set of requirement IDs covered by at least one question
  const coveredIds = new Set<string>();
  
  questions.forEach(q => {
    (q.requirement_ids || []).forEach(reqId => coveredIds.add(reqId));
  });

  // Filter for uncovered MUST-HAVE requirements
  const mustHaveRequirements = requirements.filter(r => r.priority === 'must');
  
  const uncoveredIds = mustHaveRequirements
    .filter(req => !coveredIds.has(req.id))
    .map(req => req.id);

  return {
    uncovered_requirement_ids: uncoveredIds,
    passes: currentPassCount,
  };
}
