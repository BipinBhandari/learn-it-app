import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Tables['profiles']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`public:profiles:user_id=eq.${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`
      }, payload => {
        setProfile(payload.new as Tables['profiles']['Row']);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { profile, loading, error };
}