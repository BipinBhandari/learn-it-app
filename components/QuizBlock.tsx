import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Check, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface QuizBlockProps {
  content: string;
  metadata: {
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
  onComplete?: () => void;
}

export function QuizBlock({ content, metadata, onComplete }: QuizBlockProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const currentQuestion = metadata.questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answerIndex);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswerChecked(true);
    if (selectedAnswer === currentQuestion.correctIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < metadata.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setIsQuizComplete(true);
      onComplete?.();
    }
  };

  if (isQuizComplete) {
    const score = Math.round((correctAnswers / metadata.questions.length) * 100);

    return (
      <Animated.View 
        entering={FadeIn}
        style={styles.resultContainer}
      >
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        <Text style={styles.scoreText}>{score}%</Text>
        <Text style={styles.scoreLabel}>
          You got {correctAnswers} out of {metadata.questions.length} correct
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Markdown style={{ body: styles.markdown }}>
        {content}
      </Markdown>

      <View style={styles.questionContainer}>
        {currentQuestion.options.map((option, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.option,
                selectedAnswer === index && styles.selectedOption,
                isAnswerChecked && index === currentQuestion.correctIndex && styles.correctOption,
                isAnswerChecked && selectedAnswer === index && 
                index !== currentQuestion.correctIndex && styles.incorrectOption,
              ]}
              onPress={() => handleAnswerSelect(index)}
              disabled={isAnswerChecked}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText,
                isAnswerChecked && index === currentQuestion.correctIndex && styles.correctOptionText,
              ]}>
                {option}
              </Text>
              {isAnswerChecked && index === currentQuestion.correctIndex && (
                <Check size={20} color="#10b981" />
              )}
              {isAnswerChecked && selectedAnswer === index && 
                index !== currentQuestion.correctIndex && (
                <X size={20} color="#ef4444" />
              )}
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {isAnswerChecked && (
        <Animated.View 
          entering={FadeIn}
          style={styles.explanation}
        >
          <Text style={styles.explanationText}>
            {currentQuestion.explanation}
          </Text>
        </Animated.View>
      )}

      <View style={styles.footer}>
        {isAnswerChecked ? (
          <Pressable 
            style={styles.nextButton}
            onPress={nextQuestion}
          >
            <Text style={styles.buttonText}>
              {currentQuestionIndex === metadata.questions.length - 1 
                ? 'Finish Quiz' 
                : 'Next Question'
              }
            </Text>
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.checkButton, selectedAnswer === null && styles.disabledButton]}
            onPress={checkAnswer}
            disabled={selectedAnswer === null}
          >
            <Text style={[styles.buttonText, selectedAnswer === null && styles.disabledButtonText]}>
              Check Answer
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markdown: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
  },
  questionContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d3d',
  },
  selectedOption: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  correctOption: {
    backgroundColor: '#059669',
    borderColor: '#10b981',
  },
  incorrectOption: {
    backgroundColor: '#dc2626',
    borderColor: '#ef4444',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  correctOptionText: {
    fontWeight: '600',
  },
  explanation: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  explanationText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
  },
  checkButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#4b5563',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#e0e0e0',
  },
});