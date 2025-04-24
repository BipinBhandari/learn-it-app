import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

export type Chapter = Tables['chapters']['Row'];

export function useChapters(lessonId: string | undefined) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    async function loadChapters() {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index');

        if (error) throw error;
        setChapters(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, [lessonId]);

  return { chapters, loading, error };
}