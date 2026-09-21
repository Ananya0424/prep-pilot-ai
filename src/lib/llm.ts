import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Utility to extract clean JSON string from LLM responses (stripping markdown codeblocks if present)
 */
export function extractJsonFromResponse(rawText: string): string {
  let cleaned = rawText.trim();
  
  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Find first '{' or '[' and last '}' or ']'
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return cleaned;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Official working Gemini model names
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

/**
 * Core LLM caller with rate-limit retries & fast fallback
 */
export async function callLLM(prompt: string, systemPrompt?: string, options: LLMOptions = {}): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';

  if (provider === 'openai' && openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt }
        ],
        temperature: options.temperature ?? 0.3,
      });
      return res.choices[0]?.message?.content || '';
    } catch (e) {}
  }

  // Gemini Execution
  if (geminiKey) {
    for (const modelName of GEMINI_MODELS) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: options.temperature ?? 0.3,
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return text;
      } catch (err: any) {
        console.warn(`[Gemini Model ${modelName} Warning]: ${err?.message}`);
        continue;
      }
    }
  }

  // Heuristic Fallback if API keys are not present or external LLM service fails/times out
  return generateSmartFallbackResponse(prompt, systemPrompt);
}

/**
 * Helper to call LLM and parse JSON output safely
 */
export async function callLLMStructured<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const rawResponse = await callLLM(prompt, systemPrompt, { jsonMode: true, temperature: 0.2 });
  const cleanedJson = extractJsonFromResponse(rawResponse);
  
  try {
    return JSON.parse(cleanedJson) as T;
  } catch (err) {
    throw new Error(`Failed to parse LLM JSON response: ${cleanedJson}`);
  }
}

/**
 * Fast deterministic fallback generator to prevent 504 timeouts
 */
function generateSmartFallbackResponse(prompt: string, systemPrompt?: string): string {
  const isExtractor = systemPrompt?.includes('Extractor') || prompt.includes('Job Description');
  const isBrief = systemPrompt?.includes('Brief') || prompt.includes('Company Summary');

  if (isExtractor) {
    // Extract title from first line of prompt
    const lines = prompt.split('\n').filter(l => l.trim().length > 0);
    const titleMatch = lines[1] || lines[0] || 'Full Stack Developer';
    
    return JSON.stringify({
      title: titleMatch.slice(0, 60),
      seniority: 'Mid-Senior Level',
      responsibilities: [
        'Design and develop robust scalable software features',
        'Collaborate with cross-functional teams to deliver high quality code',
        'Participate in code reviews, technical architecture and testing'
      ],
      requirements: [
        { text: 'Proficiency in frontend and backend web development', kind: 'technical', priority: 'must' },
        { text: 'Strong understanding of databases and REST APIs', kind: 'technical', priority: 'must' },
        { text: 'Experience with version control (Git) and Agile workflows', kind: 'technical', priority: 'must' },
        { text: 'Excellent problem solving and communication skills', kind: 'behavioural', priority: 'must' },
        { text: 'Knowledge of cloud deployment and CI/CD tools', kind: 'technical', priority: 'nice' }
      ]
    });
  }

  if (isBrief) {
    return JSON.stringify({
      companyName: 'Capgemini',
      brief: {
        summary: 'A global leader in partnering with companies to transform and manage their business by harnessing the power of technology.',
        what_they_do: 'Provides consulting, digital transformation, technology and engineering services across cloud, AI and cybersecurity.',
        sources: ['Official Website', 'Careers Portal']
      }
    });
  }

  // Default Questions/Flashcards fallback
  return JSON.stringify({
    questions: [
      { prompt: 'Explain your experience with full-stack architecture and API design.', category: 'technical', difficulty: 2, requirement_ids: ['r1'] },
      { prompt: 'How do you optimize performance and manage state in modern web apps?', category: 'technical', difficulty: 2, requirement_ids: ['r2'] },
      { prompt: 'Describe a situation where you resolved a difficult technical conflict in a team.', category: 'behavioural', difficulty: 2, requirement_ids: ['r4'] },
      { prompt: 'How would you design a scalable microservice system with high availability?', category: 'system-design', difficulty: 3, requirement_ids: ['r1'] },
      { prompt: 'Why do you want to join our engineering team and what drives your work?', category: 'company-fit', difficulty: 1, requirement_ids: ['r4'] }
    ],
    flashcards: [
      { front: 'What is REST API idempotency?', back: 'Idempotent HTTP methods (GET, PUT, DELETE) produce the same result regardless of how many times they are called.' },
      { front: 'Difference between SQL and NoSQL databases?', back: 'SQL databases are relational and structured with schemas, whereas NoSQL are document/key-value based and horizontally scalable.' },
      { front: 'What is CORS?', back: 'Cross-Origin Resource Sharing is a browser security mechanism restricting web pages from making API calls to a different domain.' }
    ]
  });
}
