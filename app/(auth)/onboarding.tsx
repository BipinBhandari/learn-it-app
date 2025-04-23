import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const interests = [
    'Technology', 'Science', 'Design', 'Business',
    'Innovation', 'Health', 'Personal growth', 'Leadership',
    'Communication', 'Productivity', 'Creativity', 'Education'
  ];

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

      <View style={styles.interestsContainer}>
        {interests.map((interest, index) => (
          <Animated.View
            key={interest}
            entering={FadeIn.delay(300 + index * 50)}
          >
            <Pressable style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        <Pressable 
          style={styles.continueButton}
          onPress={() => router.push('/sign-in')}
        >
          <Text style={styles.continueText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </Pressable>

        <Pressable 
          style={styles.skipButton}
          onPress={() => router.push('/sign-in')}
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
});