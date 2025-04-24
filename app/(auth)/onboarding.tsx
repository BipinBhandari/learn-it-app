import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useTopics } from '../../hooks/useTopics';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    topics,
    selectedTopics,
    loading,
    error,
    saving,
    toggleTopic,
    savePreferences,
  } = useTopics(user?.id);

  const handleContinue = async () => {
    if (selectedTopics.length > 0) {
      try {
        await savePreferences();
      } catch (error) {
        // Error is handled in the hook
        return;
      }
    }
    router.push('/sign-in');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading topics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View 
        entering={FadeIn.delay(200)}
        style={styles.header}
      >
        <Text style={styles.title}>Welcome to LearnIt</Text>
        <Text style={styles.subtitle}>
          Select topics that interest you to personalize your learning experience
        </Text>
      </Animated.View>

      <View style={styles.topicsContainer}>
        {topics.map((topic, index) => (
          <Animated.View
            key={topic.id}
            entering={FadeInDown.delay(300 + index * 50)}
          >
            <Pressable 
              style={[
                styles.topicChip,
                selectedTopics.includes(topic.id) && styles.selectedTopic
              ]}
              onPress={() => toggleTopic(topic.id)}
            >
              <Text 
                style={[
                  styles.topicText,
                  selectedTopics.includes(topic.id) && styles.selectedTopicText
                ]}
              >
                {topic.name}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        <Pressable 
          style={[
            styles.continueButton,
            saving && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={saving}
        >
          <Text style={styles.continueText}>
            {saving ? 'Saving...' : 'Continue'}
          </Text>
          {!saving && <ChevronRight size={20} color="#fff" />}
        </Pressable>

        <Pressable 
          style={styles.skipButton}
          onPress={() => router.push('/sign-in')}
          disabled={saving}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedTopic: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  topicText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTopicText: {
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});