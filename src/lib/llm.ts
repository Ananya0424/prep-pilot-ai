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

/**
 * Sleep helper for exponential backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core LLM caller with rate-limit retries (Exponential backoff)
 */
export async function callLLM(prompt: string, systemPrompt?: string, options: LLMOptions = {}): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      if (provider === 'openai' && openaiKey) {
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
      } else {
        // Default to Google Gemini
        if (!geminiKey) {
          throw new Error('No GEMINI_API_KEY or OPENAI_API_KEY found in environment variables.');
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        // Use gemini-1.5-flash or gemini-2.5-flash or gemini-pro
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: options.temperature ?? 0.3,
            responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return responseText;
      }
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || 
                          err?.message?.includes('429') || 
                          err?.message?.includes('RESOURCE_EXHAUSTED') ||
                          err?.message?.includes('rate limit') ||
                          err?.message?.includes('slow down');

      if (isRateLimit && attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1500 + Math.random() * 500;
        console.warn(`[LLM Rate-Limit Warning] Rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(backoffMs)}ms...`);
        await sleep(backoffMs);
      } else if (attempt < maxRetries) {
        console.warn(`[LLM Error] ${err?.message || err}. Retrying (attempt ${attempt}/${maxRetries})...`);
        await sleep(1000);
      } else {
        throw err;
      }
    }
  }

  throw new Error('LLM call failed after maximum retries');
}

/**
 * Helper to call LLM and parse JSON output safely
 */
export async function callLLMStructured<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const rawResponse = await callLLM(prompt, systemPrompt, { jsonMode: true, temperature: 0.2 });
  const cleanedJson = extractJsonFromResponse(rawResponse);
  
  try {
    return JSON.parse(cleanedJson) as T;
  } catch (parseErr) {
    console.error('[LLM JSON Parse Error] Raw text was:', rawResponse);
    throw new Error(`Failed to parse LLM response as JSON: ${(parseErr as Error).message}`);
  }
}
