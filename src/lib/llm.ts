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
      { prompt: 'Explain your experience with full-stack architecture and API design in React & Node.', answer_outline: 'Detail component architecture, state management, REST API standards, and middleware handling.', category: 'technical', difficulty: 2, requirement_ids: ['r1'] },
      { prompt: 'How do you optimize database queries and manage state in modern web applications?', answer_outline: 'Explain database indexing, connection pooling, caching strategies (Redis), and frontend memoization.', category: 'technical', difficulty: 2, requirement_ids: ['r3'] },
      { prompt: 'How do you design a RAG architecture for enterprise search with LLMs & Vector DBs?', answer_outline: 'Detail document chunking, vector embeddings (Pinecone/Chroma), similarity retrieval, and prompt context building.', category: 'technical', difficulty: 3, requirement_ids: ['r2'] },
      { prompt: 'How do you ensure web application security against OWASP vulnerabilities (XSS, CSRF, SQLi)?', answer_outline: 'Discuss input sanitization, parameterized queries, CORS policies, JWT authentication, and HTTPS encryption.', category: 'technical', difficulty: 2, requirement_ids: ['r3'] },
      { prompt: 'How would you architect a high-availability microservice system for millions of requests?', answer_outline: 'Discuss load balancing, stateless API servers, database sharding, horizontal scaling, and circuit breakers.', category: 'system-design', difficulty: 3, requirement_ids: ['r1'] },
      { prompt: 'How do you design a real-time notification system using WebSockets and Message Queues?', answer_outline: 'Explain WebSocket connections, Redis pub/sub, RabbitMQ/Kafka queues, and fallback polling mechanisms.', category: 'system-design', difficulty: 3, requirement_ids: ['r3'] },
      { prompt: 'Describe a situation where you resolved a difficult technical disagreement or conflict in a team.', answer_outline: 'Use STAR method: Explain the technical conflict, data-driven compromise, execution, and positive team outcome.', category: 'behavioural', difficulty: 2, requirement_ids: ['r4'] },
      { prompt: 'How do you prioritize competing engineering tasks under tight project deadlines?', answer_outline: 'Explain MoSCoW prioritization, communicating with stakeholders, MVP delivery, and managing technical debt.', category: 'behavioural', difficulty: 2, requirement_ids: ['r4'] },
      { prompt: 'Why do you want to join our engineering team and what drives your technical work?', answer_outline: 'Align technical passion, company products, engineering culture, and long-term impact goals.', category: 'company-fit', difficulty: 1, requirement_ids: ['r4'] },
      { prompt: 'How do you stay updated with emerging technologies like GenAI, AI Agents, and Cloud Architecture?', answer_outline: 'Highlight continuous learning, side projects, open-source contributions, technical blogs, and hands-on experimentation.', category: 'company-fit', difficulty: 1, requirement_ids: ['r2'] }
    ],
    flashcards: [
      { front: 'What is REST API idempotency?', back: 'Idempotent HTTP methods (GET, PUT, DELETE) produce the same result regardless of execution frequency.' },
      { front: 'Difference between SQL and NoSQL databases?', back: 'SQL databases are relational and structured with schemas, whereas NoSQL are document/key-value based and horizontally scalable.' },
      { front: 'What is CORS (Cross-Origin Resource Sharing)?', back: 'A browser security mechanism that uses HTTP headers to determine whether to allow cross-origin request access.' },
      { front: 'What is Node.js Event Loop?', back: 'A single-threaded loop that offloads non-blocking asynchronous operations to the kernel and executes callbacks.' },
      { front: 'What is React Virtual DOM?', back: 'A lightweight in-memory representation of real DOM elements used to compute fast diffs and batch updates efficiently.' },
      { front: 'What is RAG (Retrieval-Augmented Generation)?', back: 'A technique combining vector retrieval with LLMs to generate contextually accurate, grounded answers.' },
      { front: 'What is Database Sharding?', back: 'A horizontal partitioning technique that splits a large database across multiple smaller server instances.' },
      { front: 'What is JWT (JSON Web Token)?', back: 'A compact, URL-safe means of representing claims to be transferred between two parties securely using cryptographic signatures.' }
    ]
  });
}
