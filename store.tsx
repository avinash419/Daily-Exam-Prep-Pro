
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Exam, Subject, Question, Difficulty, Language } from './types';
import { INITIAL_EXAMS, INITIAL_SUBJECTS, INITIAL_QUESTIONS } from './constants';

interface AppContextType {
  user: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (role: Role) => void;
  logout: () => void;
  exams: Exam[];
  subjects: Subject[];
  questions: Question[];
  completedMocks: string[];
  bestScores: Record<string, number>;
  toggleTopic: (subjectId: string, topicName: string) => void;
  addMockResult: (mockId: string, score: number) => void;
  addQuestion: (q: Omit<Question, 'id'>) => void;
  deleteQuestion: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || Language.ENGLISH;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [completedMocks, setCompletedMocks] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedMocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [bestScores, setBestScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bestScores');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('completedMocks', JSON.stringify(completedMocks));
    localStorage.setItem('bestScores', JSON.stringify(bestScores));
    localStorage.setItem('app_lang', language);
  }, [user, subjects, questions, completedMocks, bestScores, language]);

  const login = (role: Role) => {
    setUser({ id: 'u1', username: role === Role.ADMIN ? 'admin_user' : 'student_user', role });
  };

  const logout = () => setUser(null);

  const toggleTopic = (subjectId: string, topicName: string) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      const updatedTopics = sub.topics.map(t => t.name === topicName ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTopics.filter(t => t.completed).length;
      const progress = Math.round((completedCount / updatedTopics.length) * 100);
      return { ...sub, topics: updatedTopics, progress };
    }));
  };

  const addMockResult = (mockId: string, score: number) => {
    setCompletedMocks(prev => [...new Set([...prev, mockId])]);
    setBestScores(prev => ({
      ...prev,
      [mockId]: Math.max(prev[mockId] || 0, score)
    }));
  };

  const addQuestion = (q: Omit<Question, 'id'>) => {
    const newQ: Question = { ...q, id: `custom-${Date.now()}` };
    setQuestions(prev => [newQ, ...prev]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, language, setLanguage, login, logout, exams: INITIAL_EXAMS, subjects, questions,
      completedMocks, bestScores, toggleTopic, addMockResult, addQuestion, deleteQuestion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
