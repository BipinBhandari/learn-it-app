import { supabase } from './supabase';
import { Tables } from './database.types';

export async function getLessons(filters?: {
  difficulty?: Tables['lessons']['Row']['difficulty'];
  category?: string;
}) {
  let query = supabase.from('lessons').select(`
    *,
    user_progress!inner(
      status,
      score,
      last_accessed
    )
  `);

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLessonById(id: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      user_progress(
        status,
        score,
        last_accessed,
        notes
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgress(userId: string, lessonId: string, updates: {
  status?: Tables['user_progress']['Row']['status'];
  score?: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      ...updates,
      last_accessed: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}