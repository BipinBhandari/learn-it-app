import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoveHorizontal as MoreHorizontal, Bookmark, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { getLessonById } from '../../data/lessonData';
import { LessonItem, Chapter } from '../../types';
import ProgressRing from '../../components/ProgressRing';

export default function LessonDetailsScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  
  useEffect(() => {
    if (id) {
      const lessonData = getLessonById(Number(id));
      setLesson(lessonData);
    }
  }, [id]);
  
  const handleStartLesson = () => {
    if (lesson) {
      router.push(`/chapter/${lesson.id}/1`);
    }
  };
  
  const handleContinueLesson = () => {
    if (lesson) {
      // Navigate to the last accessed chapter or the next incomplete one
      const nextChapterId = lesson.lastAccessedChapter || 1;
      router.push(`/chapter/${lesson.id}/${nextChapterId}`);
    }
  };
  
  const renderChapter = (chapter: Chapter, index: number) => (
    <Pressable 
      key={chapter.id}
      style={styles.chapterItem}
      onPress={() => router.push(`/chapter/${lesson?.id}/${chapter.id}`)}
    >
      <View style={styles.chapterNumber}>
        <Text style={styles.chapterNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.chapterContent}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={styles.chapterDescription}>{chapter.description}</Text>
        <View style={styles.chapterMeta}>
          <Text style={styles.chapterPages}>{chapter.pagesCount} pages</Text>
          <Text style={styles.chapterDuration}>{chapter.estimatedTime} min</Text>
        </View>
      </View>
      {chapter.completed ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed</Text>
        </View>
      ) : null}
    </Pressable>
  );
  
  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lesson...</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#111827" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton}>
              <Bookmark size={24} color="#111827" />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Share2 size={24} color="#111827" />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <MoreHorizontal size={24} color="#111827" />
            </Pressable>
          </View>
        </View>
        
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            
            <View style={styles.progressSection}>
              <ProgressRing
                progress={lesson.progress}
                size={64}
                strokeWidth={6}
              />
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>{lesson.progress}% Complete</Text>
                <Text style={styles.lessonStats}>
                  {lesson.chaptersCount} chapters • {lesson.estimatedTime} min total
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.chaptersSection}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            {lesson.chapters.map(renderChapter)}
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          {lesson.progress > 0 ? (
            <Pressable
              style={styles.continueButton}
              onPress={handleContinueLesson}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.startButton}
              onPress={handleStartLesson}
            >
              <Text style={styles.startButtonText}>Start Learning</Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  lessonHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressDetails: {
    marginLeft: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lessonStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  chaptersSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chapterItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  chapterMeta: {
    flexDirection: 'row',
  },
  chapterPages: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 12,
  },
  chapterDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  completedBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});