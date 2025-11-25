export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum QuestionType {
  MCQ = 'mcq',
  ShortAnswer = 'short',
  Analytical = 'analytical',
}

export interface Question {
  type: QuestionType;
  question: string;
  options?: string[]; // Only for MCQ
  correct_index?: number; // Only for MCQ
  answer: string; // Model answer
  source_location: string;
  points_to_consider?: string[]; // Only for Analytical
}

export interface ProcessingResult {
  domain: string;
  difficulty: string;
  summary: string;
  meta: {
    original_words: number;
    summary_words: number;
  };
  questions: Question[];
}

export interface ApiRequest {
  text: string;
  domain?: string;
  difficulty?: string;
}

export interface LoadingState {
  status: 'idle' | 'analyzing' | 'summarizing' | 'generating_questions' | 'complete' | 'error';
  message: string;
}