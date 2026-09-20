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
1. Every generated question MUST reference 1 or more exact requirement ID(s) provided in the input (e.g., ["r1"]).
2. Category must be one of: "technical", "behavioural", "system-design", "company-fit".
   - Technical requirements (e.g. 5 yrs React, Node.js) should produce "technical" or "system-design" questions.
   - Soft skills/mentorship should produce "behavioural" questions.
3. Difficulty MUST be an integer: 1 (Easy), 2 (Medium), or 3 (Hard).
4. Provide clear, actionable "answer_outline" for each question.
5. Create corresponding revision flashcards ("front" concept/question, "back" concise summary answer).
6. Output MUST be valid JSON matching this schema:
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
    return { questions: [], flashcards: [] };
  }

  const prompt = `Requirements:\n${JSON.stringify(requirements, null, 2)}\n\nCompany Brief:\n${companyBriefSummary}`;

  try {
    const res = await callLLMStructured<GeneratorResponse>(prompt, QUESTION_GENERATOR_SYSTEM_PROMPT);

    let qIdx = startQuestionIndex;
    const questions: Question[] = (res.questions || []).map(q => {
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
  } catch (err) {
    console.warn('[Question Generator Warning] Falling back to template generation:', err);
    // Graceful fallback for failures
    const questions: Question[] = requirements.map((req, i) => ({
      id: `q${startQuestionIndex + i}`,
      requirement_ids: [req.id],
      category: req.kind === 'behavioural' ? 'behavioural' : 'technical',
      prompt: `Can you describe your experience with ${req.text}?`,
      answer_outline: `Demonstrate hands-on experience, key challenges faced, and measurable impact related to ${req.text}.`,
      difficulty: 2,
    }));

    const flashcards: Flashcard[] = requirements.map((req, i) => ({
      id: `f${startFlashcardIndex + i}`,
      front: `Core concept: ${req.text}`,
      back: `Essential principles and best practices for ${req.text}.`,
      requirement_ids: [req.id],
    }));

    return { questions, flashcards };
  }
}
