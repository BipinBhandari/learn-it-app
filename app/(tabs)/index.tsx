import { View, StyleSheet, FlatList, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Zap, Award } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import ProgressRing from '../../components/ProgressRing';
import { useLessons } from '../../hooks/useLessons';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Tables } from '../../lib/database.types';

type LessonWithProgress = Tables['lessons']['Row'] & {
  user_progress: Tables['user_progress']['Row'][];
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { lessons, loading, error } = useLessons();
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filteredLessons = () => {
    if (!lessons) return [];
    
    switch (activeTab) {
      case 'in-progress':
        return lessons.filter(lesson => 
          lesson.user_progress?.some(p => p.status === 'in_progress')
        );
      case 'completed':
        return lessons.filter(lesson => 
          lesson.user_progress?.some(p => p.status === 'completed')
        );
      default:
        return lessons;
    }
  };

  const getProgress = (lesson: LessonWithProgress) => {
    if (!lesson.user_progress || !Array.isArray(lesson.user_progress) || lesson.user_progress.length === 0) {
      return 0;
    }
    
    const progress = lesson.user_progress[0];
    switch (progress.status) {
      case 'completed':
        return 100;
      case 'in_progress':
        return Math.round((progress.score || 0) / 100 * 100);
      default:
        return 0;
    }
  };

  const renderLessonItem = ({ item }: { item: LessonWithProgress }) => (
    <Pressable
      style={styles.lessonCard}
      onPress={() => router.push(`/lesson/${item.id}`)}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.gradientBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.lessonIconContainer}>
          <BookOpen color="#fff" size={24} />
        </View>
      </LinearGradient>
      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <ProgressRing 
            progress={getProgress(item)} 
            size={40} 
            strokeWidth={3}
          />
        </View>
        <Text style={styles.lessonDescription}>
          {(item.content as any)?.description || 'No description available'}
        </Text>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonChapters}>
            {((item.content as any)?.sections?.length || 0)} chapters
          </Text>
          <Text style={styles.lessonDuration}>{item.estimated_duration} min</Text>
        </View>
      </View>
    </Pressable>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>Please sign in to view lessons</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>Loading lessons...</Text>
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.userName}>{profile?.bio || user.email}</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'in-progress' && styles.activeTab]} 
          onPress={() => setActiveTab('in-progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in-progress' && styles.activeTabText]}>In Progress</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </Pressable>
      </View>
      
      <FlatList
        data={filteredLessons()}
        renderItem={renderLessonItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#ef4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  lessonCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  gradientBanner: {
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  lessonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonContent: {
    padding: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonChapters: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  messageText: {
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