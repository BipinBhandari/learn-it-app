import { supabase } from './supabase';

export async function getLearningPaths() {
  const { data, error } = await supabase
    .from('learning_paths')
    .select(`
      *,
      lessons:lessons(*)
    `);

  if (error) throw error;
  return data;
}

export async function getLearningPathById(id: string) {
  const { data, error } = await supabase
    .from('learning_paths')
    .select(`
      *,
      lessons:lessons(*),
      user_progress:user_progress(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function enrollInLearningPath(userId: string, pathId: string) {
  // Get the learning path
  const { data: path, error: pathError } = await supabase
    .from('learning_paths')
    .select('lessons')
    .eq('id', pathId)
    .single();

  if (pathError) throw pathError;

  // Create progress entries for all lessons in the path
  const { error: progressError } = await supabase
    .from('user_progress')
    .insert(
      path.lessons.map((lessonId: string) => ({
        user_id: userId,
        lesson_id: lessonId,
        status: 'not_started',
      }))
    );

  if (progressError) throw progressError;
}