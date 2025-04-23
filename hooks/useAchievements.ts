import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

type AchievementWithStatus = Tables['achievements']['Row'] & {
  user_achievements: Tables['user_achievements']['Row'][];
};

export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function loadAchievements() {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select(`
            *,
            user_achievements!left(*)
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAchievements(data as AchievementWithStatus[]);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();

    // Subscribe to realtime changes
    const achievementsSubscription = supabase
      .channel('public:achievements')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'achievements'
      }, payload => {
        setAchievements(current => {
          const updated = [...current];
          const index = updated.findIndex(achievement => achievement.id === payload.new.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...payload.new };
          } else {
            updated.push(payload.new as AchievementWithStatus);
          }
          return updated;
        });
      })
      .subscribe();

    const userAchievementsSubscription = supabase
      .channel(`public:user_achievements:user_id=eq.${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      }, payload => {
        setAchievements(current => {
          return current.map(achievement => {
            if (achievement.id === payload.new.achievement_id) {
              return {
                ...achievement,
                user_achievements: [payload.new as Tables['user_achievements']['Row']]
              };
            }
            return achievement;
          });
        });
      })
      .subscribe();

    return () => {
      achievementsSubscription.unsubscribe();
      userAchievementsSubscription.unsubscribe();
    };
  }, [userId]);

  return { achievements, loading, error };
}