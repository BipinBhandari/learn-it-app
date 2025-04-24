import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X, ChevronRight, Clock, BookOpen, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { Tables } from '../../lib/database.types';
import Animated, { 
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type LearningPathWithLessons = Tables['learning_paths']['Row'] & {
  lessons_data: Tables['lessons']['Row'][];
};

const LessonItem = ({ item }: { item: Tables['lessons']['Row'] }) => (
  <Animated.View
    entering={FadeInDown.springify().damping(15)}
  >
    <Pressable
      style={styles.lessonItem}
      onPress={() => router.push(`/lesson/${item.id}`)}
    >
      <View style={styles.lessonIcon}>
        <BookOpen size={20} color="#fff" />
      </View>
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <View style={styles.lessonMeta}>
          <Clock size={14} color="#9CA3AF" />
          <Text style={styles.lessonDuration}>{item.estimated_duration} min</Text>
          <View style={[styles.difficultyBadge, styles[`${item.difficulty}Badge`]]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#6B7280" />
    </Pressable>
  </Animated.View>
);

const PathItem = ({ 
  item, 
  index, 
  isExpanded, 
  onToggle 
}: { 
  item: LearningPathWithLessons; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const itemHeight = 88; // Height of each lesson item
  const maxHeight = item.lessons_data.length * itemHeight;
  
  const arrowStyle = useAnimatedStyle(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 200,
    });
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    height.value = withTiming(
      isExpanded ? maxHeight : 0,
      {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }
    );
    return {
      height: height.value,
      opacity: withTiming(isExpanded ? 1 : 0, { duration: 200 }),
    };
  });
  
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.pathCard}
    >
      <Pressable onPress={onToggle}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.pathHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.pathInfo}>
            <View style={styles.pathTitleContainer}>
              <Text style={styles.pathTitle}>{item.title}</Text>
              <Animated.View style={arrowStyle}>
                <ChevronDown size={20} color="#fff" />
              </Animated.View>
            </View>
            <Text style={styles.pathDescription}>{item.description}</Text>
            <View style={styles.pathMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.estimated_duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <BookOpen size={16} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.lessons_data.length} lessons</Text>
              </View>
              <View style={[styles.difficultyBadge, styles[`${item.difficulty}Badge`]]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
      
      <Animated.View style={[styles.lessonsList, contentStyle]}>
        {item.lessons_data.map((lesson) => (
          <LessonItem key={lesson.id} item={lesson} />
        ))}
      </Animated.View>
    </Animated.View>
  );
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { paths, loading, error } = useLearningPaths();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  const filteredPaths = paths.filter(path => 
    path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.lessons_data.some(lesson => 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const togglePath = (pathId: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathId)) {
        next.delete(pathId);
      } else {
        next.add(pathId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>Loading learning paths...</Text>
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
        <Text style={styles.title}>Library</Text>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search learning paths and lessons"
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm('')} style={styles.clearButton}>
              <X size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>
      
      <FlatList
        data={filteredPaths}
        renderItem={({ item, index }) => (
          <PathItem
            item={item}
            index={index}
            isExpanded={expandedPaths.has(item.id)}
            onToggle={() => togglePath(item.id)}
          />
        )}
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    height: 48,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  pathCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pathHeader: {
    padding: 20,
  },
  pathInfo: {
    gap: 8,
  },
  pathTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  pathDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  pathMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  lessonsList: {
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  lessonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  beginnerBadge: {
    backgroundColor: '#065F46',
  },
  intermediateBadge: {
    backgroundColor: '#9F580A',
  },
  advancedBadge: {
    backgroundColor: '#991B1B',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textTransform: 'capitalize',
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