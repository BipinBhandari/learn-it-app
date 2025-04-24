import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

type ChapterWithSlides = Tables['chapters']['Row'] & {
  slides: Tables['slides']['Row'][];
};

export function useLessons(filters?: {
  difficulty?: Tables['chapters']['Row']['difficulty'];
  category?: string;
}) {
  const [chapters, setChapters] = useState<ChapterWithSlides[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadChapters() {
      try {
        let query = supabase
          .from('chapters')
          .select(`
            *,
            slides (*)
          `);

        if (filters?.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        setChapters(data as ChapterWithSlides[]);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:chapters')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'chapters'
      }, payload => {
        setChapters(current => {
          const updated = [...current];
          const index = updated.findIndex(chapter => chapter.id === payload.new.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...payload.new };
          } else {
            updated.push(payload.new as ChapterWithSlides);
          }
          return updated;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters?.difficulty, filters?.category]);

  return { lessons: chapters, loading, error };
}