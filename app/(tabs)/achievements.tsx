import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, Clock, Zap, BookOpen, Star } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useAchievements } from '../../hooks/useAchievements';
import { useProfile } from '../../hooks/useProfile';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { achievements, loading, error } = useAchievements(user?.id);
  const { profile } = useProfile(user?.id);
  
  const renderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'award':
        return <Award size={24} color={color} />;
      case 'zap':
        return <Zap size={24} color={color} />;
      case 'clock':
        return <Clock size={24} color={color} />;
      case 'bookOpen':
        return <BookOpen size={24} color={color} />;
      case 'star':
        return <Star size={24} color={color} />;
      default:
        return <Award size={24} color={color} />;
    }
  };
  
  const renderAchievement = (achievement: any, index: number) => {
    const isUnlocked = achievement.user_achievements.length > 0;
    const color = isUnlocked ? achievement.badge_color || '#3B82F6' : '#9CA3AF';
    
    return (
      <Animated.View 
        key={achievement.id}
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.achievementCard,
          !isUnlocked && styles.lockedAchievement
        ]}
      >
        <View style={[styles.achievementIcon, { backgroundColor: `${color}20` }]}>
          {renderIcon(achievement.icon || 'award', color)}
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        <Text style={styles.achievementDate}>
          {isUnlocked 
            ? new Date(achievement.user_achievements[0].earned_at).toLocaleDateString()
            : 'Locked'}
        </Text>
      </Animated.View>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Please sign in to view achievements</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading achievements...</Text>
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
  
  const unlockedAchievements = achievements.filter(a => a.user_achievements.length > 0);
  const totalAchievements = achievements.length;
  const completionPercentage = Math.round((unlockedAchievements.length / totalAchievements) * 100);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.learning_streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completionPercentage}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {achievements.map((achievement, index) => renderAchievement(achievement, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});