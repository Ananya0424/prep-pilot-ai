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
  maxPasses?: number;
}

/**
 * FULL AI RESEARCH & GENERATION PIPELINE
 * Strictly follows the multi-step sequence prescribed in Sections 2, 3, 4, 5, 8.
 */
export async function runPrepKitPipeline(options: PipelineOptions): Promise<PrepKit> {
  const { jobDescription, companyUrl, daysAvailable, maxPasses = 2 } = options;

  // 1. Crawl & Retrieve Company Information
  const crawlResult = await crawlCompanySite(companyUrl);

  // 2. Extract Role & Requirements from JD
  const roleInfo = await extractRoleAndRequirements(jobDescription);

  // 3. Generate Company Brief
  const { brief: companyBrief, companyName } = await generateCompanyBrief(
    companyUrl,
    crawlResult.summaryText,
    crawlResult.pages_used
  );

  // 4. First Pass: Generate Questions & Flashcards for requirements
  const { questions: initialQuestions, flashcards: initialFlashcards } =
    await generateQuestionsAndFlashcards(roleInfo.requirements, companyBrief.summary, 1, 1);

  let currentQuestions = [...initialQuestions];
  let currentFlashcards = [...initialFlashcards];
  let passCount = 1;

  // 5. Coverage Check & Second Pass Loop
  let coverage = checkRequirementCoverage(roleInfo.requirements, currentQuestions, passCount);

  while (coverage.uncovered_requirement_ids.length > 0 && passCount < maxPasses) {
    passCount++;

    // Find uncovered requirement objects
    const missingRequirements = roleInfo.requirements.filter(r =>
      coverage.uncovered_requirement_ids.includes(r.id)
    );

    if (missingRequirements.length > 0) {
      const startQIdx = currentQuestions.length + 1;
      const startFIdx = currentFlashcards.length + 1;

      const gapResult = await generateQuestionsAndFlashcards(
        missingRequirements,
        companyBrief.summary,
        startQIdx,
        startFIdx
      );

      currentQuestions.push(...gapResult.questions);
      currentFlashcards.push(...gapResult.flashcards);
    }

    coverage = checkRequirementCoverage(roleInfo.requirements, currentQuestions, passCount);
  }

  // 6. Deterministic Schedule Allocation (Math/Code algorithm)
  const schedule = buildDeterministicSchedule(daysAvailable, currentQuestions, roleInfo.requirements);

  // 7. Assemble Complete Kit
  const rawKit: PrepKit = {
    source: {
      company: companyName,
      company_url: crawlResult.company_url,
      role: roleInfo.title,
      location: 'Remote / Unspecified',
      jd_chars: jobDescription.length,
      researched_at: new Date().toISOString(),
      pages_used: crawlResult.pages_used,
    },
    company_brief: companyBrief,
    role: roleInfo,
    questions: currentQuestions,
    flashcards: currentFlashcards,
    schedule,
    coverage: {
      uncovered_requirement_ids: coverage.uncovered_requirement_ids,
      passes: passCount,
    },
  };

  // 8. Validate against Appendix A Schema
  const validation = validatePrepKit(rawKit);
  if (!validation.success) {
    console.warn('[Validation Warning] Generated kit had schema warnings:', validation.error.format());
  }

  return rawKit;
}
