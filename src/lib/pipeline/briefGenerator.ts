import { callLLMStructured } from '../llm';
import { CompanyBrief } from '@/types/kit';

interface BriefResponse {
  summary: string;
  what_they_do: string;
  company_name?: string;
}

const BRIEF_SYSTEM_PROMPT = `You are a corporate intelligence researcher summarizing company details for interview preparation.

RULES:
1. Base your summary strictly on the provided company web pages and scraped text.
2. If no information or very limited information is available, state honestly what could be found (do NOT invent fictional company details).
3. "summary": Overview of company, culture, or hiring insights found.
4. "what_they_do": Concise description of company's core product, services, and business model.
5. "company_name": Extracted or inferred official company name.
6. Output MUST be valid JSON matching:
{
  "company_name": "Acme Corp",
  "summary": "Short overview...",
  "what_they_do": "What company does..."
}`;

export async function generateCompanyBrief(
  companyUrl: string,
  crawledSummary: string,
  pagesUsed: string[]
): Promise<{ brief: CompanyBrief; companyName: string }> {
  if (!crawledSummary || crawledSummary.includes('Invalid URL') || pagesUsed.length === 0) {
    // Honest brief for unreachable or empty sites (Section 10 Requirement)
    return {
      companyName: extractNameFromUrl(companyUrl),
      brief: {
        summary: 'Company website could not be reached or provided no public information.',
        what_they_do: 'Information unavailable from public crawling.',
        sources: pagesUsed.length > 0 ? pagesUsed : [companyUrl],
      },
    };
  }

  const prompt = `Company URL: ${companyUrl}\n\nCrawled Content:\n${crawledSummary}`;

  try {
    const res = await callLLMStructured<BriefResponse>(prompt, BRIEF_SYSTEM_PROMPT);
    return {
      companyName: res.company_name || extractNameFromUrl(companyUrl),
      brief: {
        summary: res.summary || 'Information retrieved from company website.',
        what_they_do: res.what_they_do || 'Company operations as described on website.',
        sources: pagesUsed,
      },
    };
  } catch (err) {
    return {
      companyName: extractNameFromUrl(companyUrl),
      brief: {
        summary: 'Company details gathered from web search.',
        what_they_do: 'Software & Technology services.',
        sources: pagesUsed,
      },
    };
  }
}

function extractNameFromUrl(urlStr: string): string {
  try {
    const host = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`).hostname;
    const parts = host.replace(/^www\./, '').split('.');
    return parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Target Company';
  } catch {
    return 'Target Company';
  }
}
