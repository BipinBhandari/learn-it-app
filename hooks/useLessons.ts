import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

type LessonWithProgress = Tables['lessons']['Row'] & {
  user_progress: Tables['user_progress']['Row'][];
};

export function useLessons(filters?: {
  difficulty?: Tables['lessons']['Row']['difficulty'];
  category?: string;
}) {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLessons() {
      try {
        let query = supabase
          .from('lessons')
          .select(`
            *,
            user_progress (*)
          `);

        if (filters?.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        setLessons(data as LessonWithProgress[]);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:lessons')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'lessons'
      }, payload => {
        setLessons(current => {
          const updated = [...current];
          const index = updated.findIndex(lesson => lesson.id === payload.new.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...payload.new };
          } else {
            updated.push(payload.new as LessonWithProgress);
          }
          return updated;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters?.difficulty, filters?.category]);

  return { lessons, loading, error };
}