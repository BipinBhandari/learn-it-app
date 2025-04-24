import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

export type Topic = Tables['topics']['Row'];
export type UserTopicPreference = Tables['user_topic_preferences']['Row'];

export function useTopics(userId?: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      try {
        // Fetch all topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*')
          .order('name');

        if (topicsError) throw topicsError;
        setTopics(topicsData);

        // If we have a userId, fetch their preferences
        if (userId) {
          const { data: preferencesData, error: preferencesError } = await supabase
            .from('user_topic_preferences')
            .select('topic_id')
            .eq('user_id', userId);

          if (preferencesError) throw preferencesError;
          setSelectedTopics(preferencesData.map(pref => pref.topic_id));
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, [userId]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(current =>
      current.includes(topicId)
        ? current.filter(id => id !== topicId)
        : [...current, topicId]
    );
  };

  const savePreferences = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      // Delete existing preferences
      await supabase
        .from('user_topic_preferences')
        .delete()
        .eq('user_id', userId);

      // Insert new preferences
      if (selectedTopics.length > 0) {
        const { error } = await supabase
          .from('user_topic_preferences')
          .insert(
            selectedTopics.map(topicId => ({
              user_id: userId,
              topic_id: topicId,
            }))
          );

        if (error) throw error;
      }
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return {
    topics,
    selectedTopics,
    loading,
    error,
    saving,
    toggleTopic,
    savePreferences,
  };
}