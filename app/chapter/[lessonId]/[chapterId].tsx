import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate, Extrapolate } from 'react-native-reanimated';
import { getChapterById } from '../../../data/lessonData';
import { Chapter, Page } from '../../../types';
import ChapterPageContent from '../../../components/ChapterPageContent';
import QuizContent from '../../../components/QuizContent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

export default function ChapterScreen() {
  const { lessonId, chapterId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFastMode, setIsFastMode] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (lessonId && chapterId) {
      const chapterData = getChapterById(Number(lessonId), Number(chapterId));
      setChapter(chapterData);
    }
  }, [lessonId, chapterId]);
  
  const nextPage = () => {
    if (!chapter) return;
    
    if (currentPageIndex < chapter.pages.length - 1) {
      setCurrentPageIndex(prevIndex => prevIndex + 1);
      translateX.value = 0;
    } else {
      // Last page in chapter - navigate to next chapter or back to lesson
      if (Number(chapterId) < chapter.totalChapters) {
        router.push(`/chapter/${lessonId}/${Number(chapterId) + 1}`);
      } else {
        router.push(`/lesson/${lessonId}`);
      }
    }
  };
  
  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prevIndex => prevIndex - 1);
      translateX.value = 0;
    } else {
      router.back();
    }
  };
  
  const handleFastMode = () => {
    setIsFastMode(true);
    // Skip to condensed content or merge multiple pages
    nextPage();
    setTimeout(() => {
      setIsFastMode(false);
    }, 300);
  };
  
  const handleSlowMode = () => {
    setIsSlowMode(true);
    // Break current page into more detailed content
    setTimeout(() => {
      setIsSlowMode(false);
    }, 300);
  };
  
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Handle horizontal swipe
      translateX.value = event.translationX;
      
      // Handle vertical swipe
      if (Math.abs(event.translationX) < 50) {
        translateY.value = event.translationY;
      }
      
      // Fade card as it moves
      if (Math.abs(event.translationX) > 50) {
        cardOpacity.value = interpolate(
          Math.abs(event.translationX),
          [0, SCREEN_WIDTH / 2],
          [1, 0.5],
          Extrapolate.CLAMP
        );
      }
    })
    .onEnd((event) => {
      // Handle horizontal swipe gesture end
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
          translateX.value = 0;
          runOnJS(nextPage)();
        });
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, {}, () => {
          translateX.value = 0;
          runOnJS(prevPage)();
        });
      } else {
        translateX.value = withTiming(0);
        cardOpacity.value = withTiming(1);
      }
      
      // Handle vertical swipe - downward left or right
      if (event.translationY > SWIPE_THRESHOLD && event.translationX < -50) {
        // Swipe down-right for fast mode
        runOnJS(handleFastMode)();
      } else if (event.translationY > SWIPE_THRESHOLD && event.translationX > 50) {
        // Swipe down-left for slow mode
        runOnJS(handleSlowMode)();
      }
      
      translateY.value = withTiming(0);
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
    opacity: cardOpacity.value,
  }));
  
  const progressValue = chapter ? (currentPageIndex + 1) / chapter.pages.length : 0;
  
  const renderCurrentPage = () => {
    if (!chapter) return null;
    
    const currentPage = chapter.pages[currentPageIndex];
    
    if (currentPage.type === 'quiz') {
      return (
        <QuizContent 
          quizData={currentPage.content} 
          onComplete={nextPage}
        />
      );
    } else {
      return (
        <ChapterPageContent 
          page={currentPage} 
          fastMode={isFastMode} 
          slowMode={isSlowMode}
        />
      );
    }
  };
  
  if (!chapter) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chapter...</Text>
      </View>
    );
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => router.push(`/lesson/${lessonId}`)}
          >
            <X size={24} color="#111827" />
          </Pressable>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: `${progressValue * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentPageIndex + 1} / {chapter.pages.length}
            </Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.card, animatedStyle]}>
              {renderCurrentPage()}
            </Animated.View>
          </GestureDetector>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              Swipe horizontally to navigate • Swipe down-left for detailed mode • Swipe down-right for quick mode
            </Text>
          </View>
        </View>
        
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          <Pressable
            style={[styles.navButton, currentPageIndex === 0 && styles.disabledButton]}
            onPress={prevPage}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft size={24} color={currentPageIndex === 0 ? "#9CA3AF" : "#111827"} />
            <Text style={[styles.navButtonText, currentPageIndex === 0 && styles.disabledButtonText]}>
              Previous
            </Text>
          </Pressable>
          
          <Pressable
            style={styles.navButton}
            onPress={nextPage}
          >
            <Text style={styles.navButtonText}>
              Next
            </Text>
            <ChevronRight size={24} color="#111827" />
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipContainer: {
    position: 'absolute',
    bottom: 16,
    padding: 16,
  },
  tipText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});