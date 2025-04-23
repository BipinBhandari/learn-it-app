import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { getAllLessons } from '../../data/lessonData';
import { LessonItem } from '../../types';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [allLessons, setAllLessons] = useState<LessonItem[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<LessonItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const lessons = getAllLessons();
    setAllLessons(lessons);
    setFilteredLessons(lessons);
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = allLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons(allLessons);
    }
  }, [searchTerm, allLessons]);
  
  const renderCategoryItem = ({ item }: { item: string }) => (
    <View style={styles.categoryChip}>
      <Text style={styles.categoryText}>{item}</Text>
    </View>
  );
  
  const renderLessonItem = ({ item }: { item: LessonItem }) => (
    <Pressable
      style={styles.lessonItem}
      onPress={() => router.push(`/lesson/${item.id}`)}
    >
      <View style={[styles.lessonColor, { backgroundColor: item.gradientColors[0] }]} />
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <Text style={styles.lessonMetrics}>{item.chaptersCount} chapters • {item.estimatedTime} min</Text>
      </View>
    </Pressable>
  );
  
  const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Trending'];
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for lessons"
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
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item}
        contentContainerStyle={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
      />
      
      <FlatList
        data={filteredLessons}
        renderItem={renderLessonItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lessonsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: 48,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  lessonsContainer: {
    padding: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonColor: {
    width: 8,
  },
  lessonInfo: {
    padding: 16,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lessonMetrics: {
    fontSize: 14,
    color: '#6B7280',
  },
});