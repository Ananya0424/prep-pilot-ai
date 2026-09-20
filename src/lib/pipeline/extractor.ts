import { callLLMStructured } from '../llm';
import { Requirement, RoleInfo } from '@/types/kit';

interface ExtractorResponse {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: Array<{
    id?: string;
    text: string;
    kind: 'technical' | 'behavioural' | 'domain';
    priority: 'must' | 'nice';
  }>;
}

const EXTRACTOR_SYSTEM_PROMPT = `You are a strict, precise HR and Technical Analyst.
Your task is to analyze a Job Description (JD) and extract details into structured JSON format.

RULES:
1. Extract the role title, estimated seniority (e.g. Junior, Mid, Senior, Lead, Unspecified), and key responsibilities.
2. Extract all explicit requirements as an array.
3. For each requirement:
   - "text": A concise summary of what is required.
   - "kind": Exactly one of "technical", "behavioural", or "domain".
     - "technical": Specific programming languages, frameworks, databases, tools, system design skills, computer science concepts.
     - "behavioural": Soft skills, leadership, mentorship, collaboration, communication, work ethic.
     - "domain": Specific domain knowledge (e.g., FinTech, Healthcare, E-commerce, Compliance).
   - "priority": Exactly one of "must" or "nice".
     - "must": Explicitly required skills, qualifications, or core responsibilities ("5+ years React", "Must know Node.js", "Degree required").
     - "nice": Optional or bonus qualifications ("Bonus points for", "Nice to have", "Plus if you know Docker").
4. IMPORTANT: Do NOT invent or fabricate requirements that are not mentioned in the JD. If the JD is a 2-line stub, extract only what is actually present and do not hallucinate!
5. Output MUST be strictly valid JSON matching this schema:
{
  "title": "Role Title",
  "seniority": "Seniority Level",
  "responsibilities": ["resp1", "resp2"],
  "requirements": [
    { "text": "Requirement text", "kind": "technical", "priority": "must" }
  ]
}`;

export async function extractRoleAndRequirements(jobDescription: string): Promise<RoleInfo> {
  const prompt = `Here is the Job Description to analyze:\n\n${jobDescription}`;

  try {
    const res = await callLLMStructured<ExtractorResponse>(prompt, EXTRACTOR_SYSTEM_PROMPT);

    // Format with stable sequential requirement IDs (r1, r2, ...)
    const formattedRequirements: Requirement[] = (res.requirements || []).map((req, idx) => ({
      id: `r${idx + 1}`,
      text: req.text,
      kind: req.kind || 'technical',
      priority: req.priority || 'must',
    }));

    return {
      title: res.title || 'Unspecified Role',
      seniority: res.seniority || 'Unspecified',
      responsibilities: Array.isArray(res.responsibilities) ? res.responsibilities : [],
      requirements: formattedRequirements,
    };
  } catch (err) {
    console.warn('[Extractor Error] Falling back to standard extraction. Error:', err);
    // Fallback if LLM parsing fails on stub JDs
    return {
      title: 'Job Position',
      seniority: 'Unspecified',
      responsibilities: ['General software engineering responsibilities'],
      requirements: [
        {
          id: 'r1',
          text: jobDescription.slice(0, 100) || 'General Role Requirements',
          kind: 'technical',
          priority: 'must',
        },
      ],
    };
  }
}
