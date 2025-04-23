export interface LessonItem {
  id: number;
  title: string;
  description: string;
  progress: number;
  chaptersCount: number;
  estimatedTime: number;
  gradientColors: string[];
  icon: string;
  tags: string[];
  chapters: Chapter[];
  lastAccessedChapter?: number;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  pagesCount: number;
  estimatedTime: number;
  completed: boolean;
  pages: Page[];
  totalChapters: number;
}

export interface Page {
  id: number;
  type: 'content' | 'quiz';
  title: string;
  content: string[];
  image?: string;
  tip?: string;
  fastModeTitle?: string;
  fastModeContent?: string[];
  slowModeTitle?: string;
  slowModeContent?: string[];
}

export interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  explanation?: string;
}