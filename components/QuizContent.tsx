import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Check, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { QuizQuestion } from '../types';

interface QuizContentProps {
  quizData: QuizQuestion[];
  onComplete: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({ quizData, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  
  const currentQuestion = quizData[currentQuestionIndex];
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answerIndex);
  };
  
  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    
    if (selectedAnswer === currentQuestion.correctAnswerIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setIsQuizComplete(true);
    }
  };
  
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {quizData.map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.progressDot,
            index === currentQuestionIndex && styles.activeDot,
            index < currentQuestionIndex && styles.completedDot
          ]} 
        />
      ))}
    </View>
  );
  
  const renderAnswerResult = (answerIndex: number) => {
    if (!isAnswerChecked) return null;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
    const isSelected = answerIndex === selectedAnswer;
    
    if (isSelected || isCorrect) {
      return (
        <View style={styles.resultIconContainer}>
          {isCorrect ? (
            <Check size={16} color="#10B981" />
          ) : (
            <X size={16} color="#EF4444" />
          )}
        </View>
      );
    }
    
    return null;
  };
  
  if (isQuizComplete) {
    const score = Math.round((correctAnswers / quizData.length) * 100);
    
    return (
      <Animated.View 
        entering={FadeIn}
        style={styles.resultContainer}
      >
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreLabel}>
            You got {correctAnswers} out of {quizData.length} correct
          </Text>
        </View>
        
        {score >= 70 ? (
          <Text style={styles.resultMessage}>Great job! You're ready to move on.</Text>
        ) : (
          <Text style={styles.resultMessage}>Keep practicing to improve your score.</Text>
        )}
        
        <Pressable 
          style={styles.continueButton}
          onPress={onComplete}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </Pressable>
      </Animated.View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderProgressBar()}
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text 
          entering={FadeIn}
          style={styles.questionNumber}
        >
          Question {currentQuestionIndex + 1} of {quizData.length}
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(100)}
          style={styles.questionText}
        >
          {currentQuestion.question}
        </Animated.Text>
        
        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer, index) => (
            <Animated.View 
              key={index}
              entering={FadeInLeft.delay(200 + index * 100)}
            >
              <Pressable
                style={[
                  styles.answerOption,
                  selectedAnswer === index && styles.selectedAnswer,
                  isAnswerChecked && selectedAnswer === index && 
                    index === currentQuestion.correctAnswerIndex && styles.correctAnswer,
                  isAnswerChecked && selectedAnswer === index &&
                    index !== currentQuestion.correctAnswerIndex && styles.incorrectAnswer,
                  isAnswerChecked && index === currentQuestion.correctAnswerIndex && styles.correctAnswer
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswerChecked}
              >
                <Text style={[
                  styles.answerText,
                  selectedAnswer === index && styles.selectedAnswerText,
                  isAnswerChecked && (index === currentQuestion.correctAnswerIndex) && styles.correctAnswerText
                ]}>
                  {answer}
                </Text>
                {renderAnswerResult(index)}
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {isAnswerChecked ? (
          <Pressable 
            style={styles.nextButton}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.checkButton, selectedAnswer === null && styles.disabledButton]}
            onPress={checkAnswer}
            disabled={selectedAnswer === null}
          >
            <Text style={[styles.checkButtonText, selectedAnswer === null && styles.disabledButtonText]}>
              Check Answer
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 16,
  },
  completedDot: {
    backgroundColor: '#10B981',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  answersContainer: {
    marginBottom: 24,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedAnswer: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF5FF',
  },
  correctAnswer: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  incorrectAnswer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  answerText: {
    fontSize: 16,
    color: '#4B5563',
  },
  selectedAnswerText: {
    color: '#1E40AF',
    fontWeight: '500',
  },
  correctAnswerText: {
    color: '#065F46',
    fontWeight: '500',
  },
  resultIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 8,
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  nextButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QuizContent;