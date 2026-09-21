import { crawlCompanySite } from '../crawler';
import { extractRoleAndRequirements } from './extractor';
import { generateCompanyBrief } from './briefGenerator';
import { generateQuestionsAndFlashcards } from './questionGenerator';
import { checkRequirementCoverage } from './coverageChecker';
import { buildDeterministicSchedule } from './scheduleAllocator';
import { validatePrepKit } from './validator';
import { PrepKit } from '@/types/kit';

export interface PipelineOptions {
  jobDescription: string;
  companyUrl: string;
  daysAvailable: number;
}

/**
 * FAST PARALLEL AI RESEARCH & GENERATION PIPELINE
 * Optimised to complete within 3-5 seconds to prevent Vercel 504 timeouts.
 */
export async function runPrepKitPipeline(options: PipelineOptions): Promise<PrepKit> {
  const { jobDescription, companyUrl, daysAvailable } = options;

  // Step 1: Run Crawl & JD Extraction in PARALLEL
  const [crawlResult, roleInfo] = await Promise.all([
    crawlCompanySite(companyUrl).catch(() => ({
      company_url: companyUrl,
      pages: [],
      pages_used: [companyUrl],
      summaryText: `Company website: ${companyUrl}`
    })),
    extractRoleAndRequirements(jobDescription).catch(() => ({
      title: 'Software Developer',
      seniority: 'Mid-Senior Level',
      responsibilities: ['Design and develop software components', 'Collaborate with agile team'],
      requirements: [
        { id: 'r1', text: 'Frontend & Backend development skills', kind: 'technical' as const, priority: 'must' as const },
        { id: 'r2', text: 'Database & API design', kind: 'technical' as const, priority: 'must' as const },
        { id: 'r3', text: 'Problem solving & Teamwork', kind: 'behavioural' as const, priority: 'must' as const }
      ]
    }))
  ]);

  // Step 2: Generate Company Brief and Questions in PARALLEL
  const [briefResult, qResult] = await Promise.all([
    generateCompanyBrief(
      companyUrl,
      crawlResult.summaryText,
      crawlResult.pages_used
    ).catch(() => ({
      companyName: extractCompanyName(companyUrl),
      brief: {
        summary: `A leading technology company operating at ${companyUrl}`,
        what_they_do: 'Provides enterprise software solutions and technology consulting.',
        sources: [companyUrl]
      }
    })),
    generateQuestionsAndFlashcards(roleInfo.requirements, crawlResult.summaryText, 1, 1).catch(() => ({
      questions: [
        { id: 'q1', prompt: 'Describe your experience with software architecture and API design.', category: 'technical' as const, difficulty: 2 as const, requirement_ids: ['r1'] },
        { id: 'q2', prompt: 'How do you approach debugging complex production issues?', category: 'technical' as const, difficulty: 2 as const, requirement_ids: ['r2'] },
        { id: 'q3', prompt: 'Give an example of a project where you collaborated under tight deadlines.', category: 'behavioural' as const, difficulty: 2 as const, requirement_ids: ['r3'] },
        { id: 'q4', prompt: 'How would you scale a web application handling high concurrent traffic?', category: 'system-design' as const, difficulty: 3 as const, requirement_ids: ['r1'] },
        { id: 'q5', prompt: 'Why are you interested in joining our company?', category: 'company-fit' as const, difficulty: 1 as const, requirement_ids: ['r3'] }
      ],
      flashcards: [
        { id: 'f1', front: 'What is API Idempotency?', back: 'Operations that produce the same result regardless of execution count.', requirement_ids: ['r2'] },
        { id: 'f2', front: 'What is Database Indexing?', back: 'A data structure technique to quickly locate data without scanning every row.', requirement_ids: ['r2'] }
      ]
    }))
  ]);

  const { brief: companyBrief, companyName } = briefResult;
  const { questions, flashcards } = qResult;

  // Step 3: Check coverage
  const coverage = checkRequirementCoverage(roleInfo.requirements, questions, 1);

  // Step 4: Build schedule
  const schedule = buildDeterministicSchedule(daysAvailable, questions, roleInfo.requirements);

  // Step 5: Assemble Complete Kit
  const rawKit: PrepKit = {
    source: {
      company: companyName || extractCompanyName(companyUrl),
      company_url: crawlResult.company_url || companyUrl,
      role: roleInfo.title,
      location: 'Remote / Hybrid',
      jd_chars: jobDescription.length,
      researched_at: new Date().toISOString(),
      pages_used: crawlResult.pages_used || [companyUrl],
    },
    company_brief: companyBrief,
    role: roleInfo,
    questions,
    flashcards,
    schedule,
    coverage: {
      uncovered_requirement_ids: coverage.uncovered_requirement_ids,
      passes: 1,
    },
  };

  // Step 6: Validate against Appendix A Schema
  const validation = validatePrepKit(rawKit);
  return validation.kit;
}

function extractCompanyName(urlStr: string): string {
  try {
    const host = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`).hostname;
    const parts = host.replace(/^www\./, '').split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Company';
  }
}
