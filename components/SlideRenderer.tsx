import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Slide } from '../hooks/useSlides';
import { CodeBlock } from './CodeBlock';
import { QuizBlock } from './QuizBlock';

interface SlideRendererProps {
  slide: Slide;
  onComplete?: () => void;
}

export function SlideRenderer({ slide, onComplete }: SlideRendererProps) {
  const renderContent = () => {
    switch (slide.type) {
      case 'code':
        return (
          <CodeBlock
            code={slide.content}
            language={(slide.metadata as any).language || 'javascript'}
            highlightedLines={(slide.metadata as any).highlightedLines}
          />
        );
      case 'quiz':
        return (
          <QuizBlock
            content={slide.content}
            metadata={slide.metadata as any}
            onComplete={onComplete}
          />
        );
      default:
        return (
          <Markdown
            style={{
              body: styles.markdown,
              heading1: styles.heading1,
              heading2: styles.heading2,
              paragraph: styles.paragraph,
              link: styles.link,
              list: styles.list,
              listItem: styles.listItem,
              image: styles.image,
            }}
          >
            {slide.content}
          </Markdown>
        );
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 20,
  },
  markdown: {
    color: '#fff',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e0e0e0',
    marginBottom: 12,
  },
  link: {
    color: '#60a5fa',
  },
  list: {
    marginBottom: 12,
  },
  listItem: {
    color: '#e0e0e0',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 16,
  },
});