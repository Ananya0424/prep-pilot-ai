export interface KitSource {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
}

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export type RequirementKind = 'technical' | 'behavioural' | 'domain';
export type RequirementPriority = 'must' | 'nice';

export interface Requirement {
  id: string;
  text: string;
  kind: RequirementKind;
  priority: RequirementPriority;
}

export interface RoleInfo {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: Requirement[];
}

export type QuestionCategory = 'technical' | 'behavioural' | 'system-design' | 'company-fit';

export interface Question {
  id: string;
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface Schedule {
  days_available: number;
  days: ScheduleDay[];
}

export interface UserProgress {
  confidence_ratings?: Record<string, 'low' | 'medium' | 'high'>;
  completed_days?: number[];
  day_scores?: Record<number, number>;
}

export interface PrepKit {
  source: KitSource;
  company_brief: CompanyBrief;
  role: RoleInfo;
  questions: Question[];
  flashcards: Flashcard[];
  schedule: Schedule;
  coverage: Coverage;
  user_progress?: UserProgress;
}

// Appendix B Types
export interface BatchCaseInput {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

export interface BatchCaseSuccess {
  id: string;
  status: 'ok';
  kit: PrepKit;
  error: null;
}

export interface BatchCaseFailure {
  id: string;
  status: 'failed';
  kit: null;
  error: {
    code: string;
    message: string;
  };
}

export type BatchCaseResult = BatchCaseSuccess | BatchCaseFailure;

export interface BatchOutputFile {
  version: string;
  generated_at: string;
  kits: BatchCaseResult[];
}
