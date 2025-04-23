import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Page } from '../types';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Info, ZoomIn, ZoomOut } from 'lucide-react-native';

interface ChapterPageContentProps {
  page: Page;
  fastMode: boolean;
  slowMode: boolean;
}

const ChapterPageContent: React.FC<ChapterPageContentProps> = ({ page, fastMode, slowMode }) => {
  const [expandedImage, setExpandedImage] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showSimplifiedView, setShowSimplifiedView] = useState(false);
  
  useEffect(() => {
    if (fastMode) {
      setShowSimplifiedView(true);
      setShowDetailedView(false);
    } else if (slowMode) {
      setShowDetailedView(true);
      setShowSimplifiedView(false);
    } else {
      setShowDetailedView(false);
      setShowSimplifiedView(false);
    }
  }, [fastMode, slowMode]);
  
  if (page.type === 'quiz') {
    return null; // Quiz pages are handled separately
  }
  
  const { title, content } = page;
  
  // Determine which content to show based on mode
  let displayContent = content;
  let displayTitle = title;
  
  if (showSimplifiedView && page.fastModeContent) {
    displayContent = page.fastModeContent;
    displayTitle = page.fastModeTitle || title;
  } else if (showDetailedView && page.slowModeContent) {
    displayContent = page.slowModeContent;
    displayTitle = page.slowModeTitle || title;
  }
  
  const renderContent = () => {
    if (expandedImage && page.image) {
      return (
        <Pressable 
          style={styles.expandedImageContainer}
          onPress={() => setExpandedImage(false)}
        >
          <Image
            source={{ uri: page.image }}
            style={styles.expandedImage}
            resizeMode="contain"
          />
          <Pressable 
            style={styles.zoomButton}
            onPress={() => setExpandedImage(false)}
          >
            <ZoomOut size={24} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      );
    }
    
    return (
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text 
          entering={FadeIn.delay(100)}
          style={styles.title}
        >
          {displayTitle}
        </Animated.Text>
        
        {page.image && (
          <Pressable onPress={() => setExpandedImage(true)}>
            <Animated.View 
              entering={FadeInDown.delay(200)}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: page.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.zoomIconContainer}>
                <ZoomIn size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
          </Pressable>
        )}
        
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={styles.contentContainer}
        >
          {displayContent.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </Animated.View>
        
        {page.tip && (
          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.tipContainer}
          >
            <Info size={16} color="#8B5CF6" style={styles.tipIcon} />
            <Text style={styles.tipText}>{page.tip}</Text>
          </Animated.View>
        )}
        
        {showSimplifiedView && (
          <View style={styles.modeIndicator}>
            <Text style={styles.modeText}>Quick Mode</Text>
          </View>
        )}
        
        {showDetailedView && (
          <View style={[styles.modeIndicator, styles.detailedModeIndicator]}>
            <Text style={[styles.modeText, styles.detailedModeText]}>Detailed Mode</Text>
          </View>
        )}
      </ScrollView>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderContent()}
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  expandedImageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  expandedImage: {
    width: '90%',
    height: '70%',
  },
  zoomIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
  modeIndicator: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C2D12',
  },
  detailedModeIndicator: {
    backgroundColor: '#A7F3D0',
  },
  detailedModeText: {
    color: '#065F46',
  },
});

export default ChapterPageContent;