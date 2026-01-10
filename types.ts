
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  STUDY_MODE = 'STUDY_MODE',
  TALK_MODE = 'TALK_MODE',
  HELPER_MODE = 'HELPER_MODE',
  CHALLENGE_MODE = 'CHALLENGE_MODE',
  MATH_SOLVER = 'MATH_SOLVER'
}

export interface StudyExplanation {
  bengali: string;
  english: string;
  story: string;
  keyPoints: string[];
}

export interface MathSolution {
  steps: string[];
  finalAnswer: string;
  concept: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  completed: boolean;
}

export interface TranscriptionItem {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}
