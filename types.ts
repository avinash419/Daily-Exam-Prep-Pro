
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  BHOJPURI_ENGLISH = 'bh_en'
}

export interface Question {
  id: string;
  examName: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  year?: string;
  source?: string;
}

export interface Subject {
  id: string;
  name: string;
  progress: number; // 0-100
  topics: {
    name: string;
    completed: boolean;
  }[];
}

export interface Exam {
  id: string;
  name: string;
  subjects: string[]; // Subject IDs
}

export interface UserProgress {
  userId: string;
  completedMockIds: string[];
  subjectProgress: Record<string, number>; // subjectId -> progress
  bestScores: Record<string, number>; // mockId -> score
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  role: Role;
}
