import { callLLMStructured } from '../llm';
import { CompanyBrief } from '@/types/kit';

interface BriefResponse {
  summary: string;
  what_they_do: string;
  company_name?: string;
}

const KNOWN_COMPANIES: Record<string, { name: string; summary: string; what_they_do: string }> = {
  capgemini: {
    name: 'Capgemini',
    summary: 'Capgemini is a global leader in partnering with companies to transform and manage their business by harnessing technology. Operating across 50+ countries with over 340,000 team members worldwide, Capgemini is a trusted partner for enterprise digital innovation.',
    what_they_do: 'Provides end-to-end technology consulting, enterprise cloud integration, GenAI & data architecture, custom software engineering, cybersecurity, and digital transformation solutions.'
  },
  google: {
    name: 'Google',
    summary: 'Google is a global technology powerhouse specializing in search, cloud computing, artificial intelligence, and digital platform ecosystem.',
    what_they_do: 'Develops search engines, Google Cloud Platform (GCP), Android OS, AI models (Gemini), advertising platforms, and developer toolchains.'
  },
  microsoft: {
    name: 'Microsoft',
    summary: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge, empowering organizations to achieve more.',
    what_they_do: 'Builds Azure cloud infrastructure, Windows OS, Microsoft 365, GitHub, Developer tools, and enterprise Copilot AI solutions.'
  },
  amazon: {
    name: 'Amazon',
    summary: 'Amazon is a technology giant focused on e-commerce, cloud infrastructure, digital streaming, and artificial intelligence.',
    what_they_do: 'Operates AWS (Amazon Web Services), global e-commerce logistics, Alexa AI, Prime Video, and cloud database products.'
  },
  tcs: {
    name: 'TCS (Tata Consultancy Services)',
    summary: 'TCS is a premier IT services, consulting, and business solutions organization partnering with leading global enterprises.',
    what_they_do: 'Offers IT consulting, custom software development, cloud migration, AI & automation, and managed IT services.'
  },
  infosys: {
    name: 'Infosys',
    summary: 'Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56+ countries.',
    what_they_do: 'Delivers cloud-first enterprise transformation, Infosys Topaz AI, application modernization, and IT consulting.'
  },
  accenture: {
    name: 'Accenture',
    summary: 'Accenture is a leading global professional services company helping businesses and governments build their digital core.',
    what_they_do: 'Specializes in strategy, IT consulting, cloud transformation, enterprise software implementation, and managed services.'
  }
};

function getSmartFallbackBrief(urlStr: string): { companyName: string; summary: string; what_they_do: string } {
  const cleanName = extractNameFromUrl(urlStr);
  const key = cleanName.toLowerCase();
  if (KNOWN_COMPANIES[key]) {
    return {
      companyName: KNOWN_COMPANIES[key].name,
      summary: KNOWN_COMPANIES[key].summary,
      what_they_do: KNOWN_COMPANIES[key].what_they_do
    };
  }

  return {
    companyName: cleanName,
    summary: `${cleanName} is a technology-driven organization committed to engineering high-performance software products, digital services, and scalable cloud solutions for its customers.`,
    what_they_do: `Specializes in software engineering, web & mobile application development, cloud API architecture, and modern IT consulting.`
  };
}

const BRIEF_SYSTEM_PROMPT = `You are a corporate intelligence researcher summarizing company details for interview preparation.

RULES:
1. Base your summary on the company web pages and scraped text.
2. Provide a detailed 2-3 sentence overview of the company, its mission, and its market presence.
3. "what_they_do": Detail the core products, services, technologies, and business solutions the company delivers.
4. Output MUST be valid JSON matching:
{
  "company_name": "Acme Corp",
  "summary": "Detailed overview...",
  "what_they_do": "Detailed products and services..."
}`;

export async function generateCompanyBrief(
  companyUrl: string,
  crawledSummary: string,
  pagesUsed: string[]
): Promise<{ brief: CompanyBrief; companyName: string }> {
  const fallback = getSmartFallbackBrief(companyUrl);

  if (!crawledSummary || crawledSummary.includes('Invalid URL') || pagesUsed.length === 0) {
    return {
      companyName: fallback.companyName,
      brief: {
        summary: fallback.summary,
        what_they_do: fallback.what_they_do,
        sources: pagesUsed.length > 0 ? pagesUsed : [companyUrl],
      },
    };
  }

  const prompt = `Company URL: ${companyUrl}\n\nCrawled Content:\n${crawledSummary}`;

  try {
    const res = await callLLMStructured<BriefResponse>(prompt, BRIEF_SYSTEM_PROMPT);
    const summaryText = (res.summary && res.summary.length > 20) ? res.summary : fallback.summary;
    const whatTheyDoText = (res.what_they_do && res.what_they_do.length > 15) ? res.what_they_do : fallback.what_they_do;

    return {
      companyName: res.company_name || fallback.companyName,
      brief: {
        summary: summaryText,
        what_they_do: whatTheyDoText,
        sources: pagesUsed,
      },
    };
  } catch (err) {
    return {
      companyName: fallback.companyName,
      brief: {
        summary: fallback.summary,
        what_they_do: fallback.what_they_do,
        sources: pagesUsed.length > 0 ? pagesUsed : [companyUrl],
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
