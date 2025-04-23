import { supabase } from './supabase';

export async function getAchievements() {
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!left(
        earned_at
      )
    `);

  if (error) throw error;
  return data;
}

export async function checkAndAwardAchievements(userId: string) {
  // Get user's current progress and stats
  const { data: userProgress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (progressError) throw progressError;

  // Get all achievements that haven't been earned yet
  const { data: availableAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!left(earned_at)
    `)
    .is('user_achievements.earned_at', null);

  if (achievementsError) throw achievementsError;

  // Check each achievement's criteria and award if met
  const achievementsToAward = availableAchievements.filter(achievement => {
    const criteria = achievement.criteria as {
      type: string;
      required_value: number;
    };

    switch (criteria.type) {
      case 'lessons_completed':
        return userProgress.filter(p => p.status === 'completed').length >= criteria.required_value;
      case 'total_points':
        return userProgress.reduce((sum, p) => sum + (p.score || 0), 0) >= criteria.required_value;
      default:
        return false;
    }
  });

  // Award achievements
  if (achievementsToAward.length > 0) {
    const { error: awardError } = await supabase
      .from('user_achievements')
      .insert(
        achievementsToAward.map(achievement => ({
          user_id: userId,
          achievement_id: achievement.id,
        }))
      );

    if (awardError) throw awardError;
  }

  return achievementsToAward;
}