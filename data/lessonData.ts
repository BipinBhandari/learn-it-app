import { createClient } from '@supabase/supabase-js';
import { LessonItem, Chapter } from '../types';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export const getLessons = async (): Promise<LessonItem[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(3);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const getAllLessons = async (): Promise<LessonItem[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    return [];
  }
};

export const getLessonById = async (id: string): Promise<LessonItem | null> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return data as LessonItem;
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    return null;
  }
};

export const getChapterById = async (lessonId: string, chapterId: string): Promise<Chapter | null> => {
  try {
    // Since chapters are stored in the lessons.content JSONB field,
    // we need to fetch the lesson first and then find the chapter
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('content')
      .eq('id', lessonId)
      .single();
    
    if (error) throw error;
    if (!lesson) return null;
    
    const content = lesson.content as { chapters?: Chapter[] };
    const chapter = content.chapters?.find(ch => ch.id === chapterId);
    
    return chapter || null;
  } catch (error) {
    console.error('Error fetching chapter by ID:', error);
    return null;
  }
};