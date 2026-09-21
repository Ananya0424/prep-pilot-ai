import { callLLMStructured } from '../llm';
import { Requirement, Question, Flashcard, QuestionCategory } from '@/types/kit';

interface GeneratorResponse {
  questions: Array<{
    requirement_ids: string[];
    category: QuestionCategory;
    prompt: string;
    answer_outline: string;
    difficulty: number;
  }>;
  flashcards: Array<{
    requirement_ids: string[];
    front: string;
    back: string;
  }>;
}

const QUESTION_GENERATOR_SYSTEM_PROMPT = `You are a Senior Technical Interviewer and Engineering Manager.
Your goal is to generate tailored, realistic interview questions and flashcards for a specific candidate based on job requirements and company research.

RULES:
1. Generate AT LEAST 15-20 highly specific questions and flashcards in total. Cover every single requirement deeply.
2. Every generated question MUST reference 1 or more exact requirement ID(s) provided in the input (e.g., ["r1"]).
3. Category must be one of: "technical", "behavioural", "system-design", "company-fit".
   - Technical requirements (e.g. 5 yrs React, Node.js) should produce "technical" or "system-design" questions.
   - Soft skills/mentorship should produce "behavioural" questions.
4. Difficulty MUST be an integer: 1 (Easy), 2 (Medium), or 3 (Hard). Include a good mix of difficulties.
5. Provide clear, actionable "answer_outline" for each question.
6. Create corresponding revision flashcards ("front" concept/question, "back" concise summary answer). Make sure to generate AT LEAST 15 flashcards.
7. Output MUST be valid JSON matching this schema:
{
  "questions": [
    {
      "requirement_ids": ["r1"],
      "category": "technical",
      "prompt": "How does React Fiber architecture work?",
      "answer_outline": "Key points to mention: reconciliation algorithm...",
      "difficulty": 2
    }
  ],
  "flashcards": [
    {
      "requirement_ids": ["r1"],
      "front": "What is Reconciliation in React?",
      "back": "The process where React updates the DOM by comparing Virtual DOM trees."
    }
  ]
}`;

export async function generateQuestionsAndFlashcards(
  requirements: Requirement[],
  companyBriefSummary: string,
  startQuestionIndex = 1,
  startFlashcardIndex = 1
): Promise<{ questions: Question[]; flashcards: Flashcard[] }> {
  if (requirements.length === 0) {
    requirements = [
      { id: 'r1', text: 'Full-Stack Web Development (React & Node)', kind: 'technical', priority: 'must' },
      { id: 'r2', text: 'GenAI & RAG Architecture', kind: 'technical', priority: 'must' },
      { id: 'r3', text: 'Database & API Optimization', kind: 'technical', priority: 'must' },
      { id: 'r4', text: 'Problem Solving & Team Leadership', kind: 'behavioural', priority: 'must' },
    ];
  }

  const prompt = `Requirements:\n${JSON.stringify(requirements, null, 2)}\n\nCompany Brief:\n${companyBriefSummary}`;

  try {
    const res = await callLLMStructured<GeneratorResponse>(prompt, QUESTION_GENERATOR_SYSTEM_PROMPT);

    if (res.questions && res.questions.length >= 5) {
      let qIdx = startQuestionIndex;
      const questions: Question[] = res.questions.map(q => {
        const difficultyVal = Number(q.difficulty);
        const difficulty: 1 | 2 | 3 = (difficultyVal === 1 || difficultyVal === 3) ? difficultyVal : 2;

        return {
          id: `q${qIdx++}`,
          requirement_ids: Array.isArray(q.requirement_ids) && q.requirement_ids.length > 0 ? q.requirement_ids : [requirements[0].id],
          category: q.category || 'technical',
          prompt: q.prompt || 'Explain your experience with this requirement.',
          answer_outline: q.answer_outline || 'Discuss real-world projects and problem solving.',
          difficulty,
        };
      });

      let fIdx = startFlashcardIndex;
      const flashcards: Flashcard[] = (res.flashcards || []).map(f => ({
        id: `f${fIdx++}`,
        front: f.front || 'Key Concept',
        back: f.back || 'Key Answer Outline',
        requirement_ids: Array.isArray(f.requirement_ids) && f.requirement_ids.length > 0 ? f.requirement_ids : [requirements[0].id],
      }));

      return { questions, flashcards };
    }
  } catch (err) {
    console.warn('[Question Generator Warning] Using robust multi-question fallback:', err);
  }

  // Robust Multi-Question Fallback (Generates 2-3 questions per requirement)
  let qIdx = startQuestionIndex;
  let fIdx = startFlashcardIndex;
  const questions: Question[] = [];
  const flashcards: Flashcard[] = [];

  requirements.forEach((req) => {
    if (req.kind === 'technical') {
      questions.push({
        id: `q${qIdx++}`,
        requirement_ids: [req.id],
        category: 'technical',
        prompt: `Explain your core technical experience and architecture approach with ${req.text}.`,
        answer_outline: `Discuss component design, state management, REST API integration, and error handling for ${req.text}.`,
        difficulty: 2,
      });
      questions.push({
        id: `q${qIdx++}`,
        requirement_ids: [req.id],
        category: 'system-design',
        prompt: `How would you scale and optimize performance when implementing ${req.text} in production?`,
        answer_outline: `Explain database indexing, caching strategies (Redis), CDN distribution, and connection pooling for ${req.text}.`,
        difficulty: 3,
      });
      flashcards.push({
        id: `f${fIdx++}`,
        front: `Core Principle of ${req.text}`,
        back: `Key architectural best practices, patterns, and trade-offs when implementing ${req.text}.`,
        requirement_ids: [req.id],
      });
      flashcards.push({
        id: `f${fIdx++}`,
        front: `Performance Tuning for ${req.text}`,
        back: `Optimization strategies including caching, async execution, lazy loading, and query indexing.`,
        requirement_ids: [req.id],
      });
    } else if (req.kind === 'behavioural') {
      questions.push({
        id: `q${qIdx++}`,
        requirement_ids: [req.id],
        category: 'behavioural',
        prompt: `Describe a situation where you demonstrated ${req.text} under tight project deadlines.`,
        answer_outline: `Use the STAR method: Situation, Task, Action taken, and measurable business Result regarding ${req.text}.`,
        difficulty: 2,
      });
      questions.push({
        id: `q${qIdx++}`,
        requirement_ids: [req.id],
        category: 'company-fit',
        prompt: `How does your experience with ${req.text} align with our company culture and engineering values?`,
        answer_outline: `Highlight technical drive, collaboration, continuous learning, and alignment with company goals.`,
        difficulty: 1,
      });
      flashcards.push({
        id: `f${fIdx++}`,
        front: `STAR Framework for ${req.text}`,
        back: `Situation: Context. Task: Challenge. Action: Your contribution. Result: Measurable outcome.`,
        requirement_ids: [req.id],
      });
    } else {
      questions.push({
        id: `q${qIdx++}`,
        requirement_ids: [req.id],
        category: 'technical',
        prompt: `Can you walk us through a domain challenge you solved related to ${req.text}?`,
        answer_outline: `Explain domain context, technical requirements, implementation steps, and security considerations for ${req.text}.`,
        difficulty: 2,
      });
      flashcards.push({
        id: `f${fIdx++}`,
        front: `Domain Essentials: ${req.text}`,
        back: `Key business logic, regulatory compliance, and architectural considerations for ${req.text}.`,
        requirement_ids: [req.id],
      });
    }
  });

  // Ensure at least 12 questions and 10 flashcards in total
  while (questions.length < 12) {
    const defaultQs = [
      { prompt: 'How do you design a high-availability REST API architecture?', cat: 'technical' as const, outline: 'Discuss stateless servers, JWT auth, rate limiting, and database indexing.' },
      { prompt: 'How do you handle technical debt vs delivering new feature deadlines?', cat: 'behavioural' as const, outline: 'Explain stakeholder communication, MVP strategy, and refactoring sprints.' },
      { prompt: 'Why are you interested in our team and what drives your engineering excellence?', cat: 'company-fit' as const, outline: 'Align technical passion, career growth, and company vision.' },
    ];
    const pick = defaultQs[questions.length % defaultQs.length];
    questions.push({
      id: `q${qIdx++}`,
      requirement_ids: [requirements[0]?.id || 'r1'],
      category: pick.cat,
      prompt: pick.prompt,
      answer_outline: pick.outline,
      difficulty: 2,
    });
  }

  while (flashcards.length < 10) {
    flashcards.push({
      id: `f${fIdx++}`,
      front: `Revision Concept #${flashcards.length + 1}`,
      back: `Essential concept outline and best practices for interview revision.`,
      requirement_ids: [requirements[0]?.id || 'r1'],
    });
  }

  return { questions, flashcards };
}
