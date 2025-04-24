import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoveHorizontal as MoreHorizontal, Bookmark, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useChapters } from '../../hooks/useChapters';
import { Tables } from '../../lib/database.types';
import ProgressRing from '../../components/ProgressRing';

type Lesson = Tables['lessons']['Row'];
type Chapter = Tables['chapters']['Row'];

export default function LessonDetailsScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { chapters, loading: chaptersLoading, error: chaptersError } = useChapters(id as string);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/lessons?id=eq.${id}`, {
          headers: {
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });
        const data = await response.json();
        setLesson(data[0]);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadLesson();
    }
  }, [id]);

  const handleStartLesson = () => {
    if (chapters.length > 0) {
      router.push(`/chapter/${id}/${chapters[0].id}`);
    }
  };

  const handleContinueLesson = () => {
    // Find the first incomplete chapter or the last accessed one
    const nextChapter = chapters.find(chapter => !chapter.completed) || chapters[0];
    if (nextChapter) {
      router.push(`/chapter/${id}/${nextChapter.id}`);
    }
  };

  const renderChapter = (chapter: Chapter, index: number) => (
    <Pressable 
      key={chapter.id}
      style={styles.chapterItem}
      onPress={() => router.push(`/chapter/${id}/${chapter.id}`)}
    >
      <View style={styles.chapterNumber}>
        <Text style={styles.chapterNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.chapterContent}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={styles.chapterDescription}>{chapter.description}</Text>
        <View style={styles.chapterMeta}>
          <Text style={styles.chapterDuration}>{chapter.estimated_duration} min</Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading || chaptersLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || chaptersError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {error?.message || chaptersError?.message || 'Failed to load lesson'}
        </Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const progress = 0; // Calculate based on completed chapters

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
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton}>
              <Bookmark size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Share2 size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <MoreHorizontal size={24} color="#fff" />
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
            <Text style={styles.lessonDescription}>
              {(lesson.content as any).description}
            </Text>

            <View style={styles.progressSection}>
              <ProgressRing
                progress={progress}
                size={64}
                strokeWidth={6}
              />
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>{progress}% Complete</Text>
                <Text style={styles.lessonStats}>
                  {chapters.length} chapters • {lesson.estimated_duration} min total
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.chaptersSection}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            {chapters.map((chapter, index) => renderChapter(chapter, index))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          {progress > 0 ? (
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
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#1F2937',
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
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    color: '#fff',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: '#9CA3AF',
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
    color: '#fff',
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
    color: '#fff',
    marginBottom: 16,
  },
  chapterItem: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 16,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  chapterMeta: {
    flexDirection: 'row',
  },
  chapterDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  startButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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