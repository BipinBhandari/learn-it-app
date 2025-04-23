import { collection, getDocs, doc, getDoc, query, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LessonItem, Chapter } from '../types';

export const getLessons = async (): Promise<LessonItem[]> => {
  try {
    const lessonsRef = collection(db, 'lessons');
    const q = query(lessonsRef, limit(3));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LessonItem[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const getAllLessons = async (): Promise<LessonItem[]> => {
  try {
    const lessonsRef = collection(db, 'lessons');
    const querySnapshot = await getDocs(lessonsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LessonItem[];
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    return [];
  }
};

export const getLessonById = async (id: string): Promise<LessonItem | null> => {
  try {
    const lessonRef = doc(db, 'lessons', id);
    const lessonDoc = await getDoc(lessonRef);
    
    if (!lessonDoc.exists()) {
      return null;
    }
    
    // Get chapters for this lesson
    const chaptersRef = collection(db, 'lessons', id, 'chapters');
    const chaptersSnapshot = await getDocs(chaptersRef);
    const chapters = await Promise.all(
      chaptersSnapshot.docs.map(async (chapterDoc) => {
        const pagesRef = collection(db, 'lessons', id, 'chapters', chapterDoc.id, 'pages');
        const pagesSnapshot = await getDocs(pagesRef);
        const pages = pagesSnapshot.docs.map(pageDoc => ({
          id: pageDoc.id,
          ...pageDoc.data()
        }));
        
        return {
          id: chapterDoc.id,
          ...chapterDoc.data(),
          pages
        };
      })
    );
    
    return {
      id: lessonDoc.id,
      ...lessonDoc.data(),
      chapters
    } as LessonItem;
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    return null;
  }
};

export const getChapterById = async (lessonId: string, chapterId: string): Promise<Chapter | null> => {
  try {
    const chapterRef = doc(db, 'lessons', lessonId, 'chapters', chapterId);
    const chapterDoc = await getDoc(chapterRef);
    
    if (!chapterDoc.exists()) {
      return null;
    }
    
    // Get pages for this chapter
    const pagesRef = collection(db, 'lessons', lessonId, 'chapters', chapterId, 'pages');
    const pagesSnapshot = await getDocs(pagesRef);
    const pages = pagesSnapshot.docs.map(pageDoc => ({
      id: pageDoc.id,
      ...pageDoc.data()
    }));
    
    return {
      id: chapterDoc.id,
      ...chapterDoc.data(),
      pages
    } as Chapter;
  } catch (error) {
    console.error('Error fetching chapter by ID:', error);
    return null;
  }
};