import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';

interface CodeBlockProps {
  code: string;
  language: string;
  highlightedLines?: number[];
}

export function CodeBlock({ code, language, highlightedLines }: CodeBlockProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          customStyle={styles.codeBlock}
          highlightStyle={styles.highlightedLine}
          wrapLines={true}
          showLineNumbers={true}
          lineProps={(lineNumber: number) => ({
            style: highlightedLines?.includes(lineNumber) ? styles.highlightedLine : {},
          })}
        >
          {code}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282c34',
    borderRadius: 12,
    marginVertical: 16,
  },
  scrollView: {
    maxHeight: 400,
  },
  codeBlock: {
    padding: 16,
    margin: 0,
    backgroundColor: 'transparent',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  highlightedLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'block',
    margin: '0 -16px',
    padding: '0 16px',
  },
});