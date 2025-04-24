import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

type LearningPathWithLessons = Tables['learning_paths']['Row'] & {
  lessons_data: Tables['lessons']['Row'][];
};

export function useLearningPaths() {
  const [paths, setPaths] = useState<LearningPathWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLearningPaths() {
      try {
        // First, get all learning paths
        const { data: pathsData, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .order('created_at');

        if (pathsError) throw pathsError;

        // For each path, get its lessons
        const pathsWithLessons = await Promise.all(
          pathsData.map(async (path) => {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .in('id', path.lessons);

            if (lessonsError) throw lessonsError;

            return {
              ...path,
              lessons_data: lessonsData || [],
            };
          })
        );

        setPaths(pathsWithLessons);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadLearningPaths();
  }, []);

  return { paths, loading, error };
}