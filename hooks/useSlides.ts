import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';

export type Slide = Tables['slides']['Row'];

export function useSlides(chapterId: string | undefined) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }

    async function loadSlides() {
      try {
        const { data, error } = await supabase
          .from('slides')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('order_index');

        if (error) throw error;
        setSlides(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadSlides();
  }, [chapterId]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  return {
    slides,
    currentSlide: slides[currentSlideIndex],
    currentSlideIndex,
    totalSlides: slides.length,
    loading,
    error,
    nextSlide,
    previousSlide,
    goToSlide,
  };
}