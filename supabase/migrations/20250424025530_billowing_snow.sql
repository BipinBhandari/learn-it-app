/*
  # Simplify Schema to Focus on Learning Paths and Chapters

  1. Changes
    - Remove lessons table and its references
    - Create learning paths table first
    - Create chapters table with learning path reference
    - Create slides table for chapter content

  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
*/

-- Create custom types if they don't exist
DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE slide_type AS ENUM ('content', 'code', 'quiz');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing tables and dependencies safely
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS slides CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;

-- Create learning paths table first
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  prerequisites UUID[] DEFAULT '{}',
  estimated_duration INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chapters table with learning path reference
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  prerequisites UUID[] DEFAULT '{}',
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create slides table
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type slide_type NOT NULL DEFAULT 'content',
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_chapters_learning_path_id ON chapters(learning_path_id);
CREATE INDEX idx_chapters_category ON chapters(category);
CREATE INDEX idx_chapters_difficulty ON chapters(difficulty);
CREATE INDEX idx_learning_paths_category ON learning_paths(category);

-- Insert sample data for React Hooks chapter
WITH learning_path_id AS (
  INSERT INTO learning_paths (
    title,
    description,
    difficulty,
    category,
    estimated_duration,
    image_url
  ) VALUES (
    'React Hooks Mastery',
    'Master React Hooks from basics to advanced patterns',
    'intermediate',
    'React',
    240,
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg'
  ) RETURNING id
), chapter_id AS (
  INSERT INTO chapters (
    learning_path_id,
    title,
    description,
    category,
    difficulty,
    order_index,
    estimated_duration
  ) 
  SELECT 
    id,
    'Understanding React Hooks',
    'Learn the fundamentals of React Hooks and how they revolutionize state management in functional components',
    'React',
    'intermediate',
    1,
    30
  FROM learning_path_id
  RETURNING id
)
INSERT INTO slides (chapter_id, title, type, order_index, content) VALUES
(
  (SELECT id FROM chapter_id),
  'What are React Hooks?',
  'content',
  1,
  jsonb_build_object(
    'markdown', '# Introduction to React Hooks

React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components.

## Key Benefits

- Write cleaner functional components
- Reuse stateful logic between components
- Compose multiple hooks for complex logic

![React Hooks Illustration](https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg)',
    'highlights', ARRAY['cleaner functional components', 'reuse stateful logic', 'compose multiple hooks']
  )
),
(
  (SELECT id FROM chapter_id),
  'useState Hook Example',
  'code',
  2,
  jsonb_build_object(
    'markdown', '# The useState Hook

The most basic Hook is useState. It lets you add state to functional components.',
    'code', '```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```',
    'language', 'jsx',
    'highlightedLines', ARRAY[2, 4, 7]
  )
),
(
  (SELECT id FROM chapter_id),
  'useState Quiz',
  'quiz',
  3,
  jsonb_build_object(
    'markdown', '# Test Your Knowledge

Let''s check your understanding of the useState Hook.',
    'questions', jsonb_build_array(
      jsonb_build_object(
        'question', 'What does useState return?',
        'options', ARRAY[
          'Just the state value',
          'An array with state value and setter function',
          'A single function',
          'An object'
        ],
        'correctIndex', 1,
        'explanation', 'useState returns an array with two elements: the current state value and a function to update it.'
      ),
      jsonb_build_object(
        'question', 'When should you use useState?',
        'options', ARRAY[
          'When you need to manage local state in a component',
          'Only in class components',
          'Only for global state',
          'Never in functional components'
        ],
        'correctIndex', 0,
        'explanation', 'useState is perfect for managing local state in functional components.'
      )
    )
  )
);

-- Enable RLS
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Learning paths are viewable by authenticated users"
  ON learning_paths FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage learning paths"
  ON learning_paths FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (
    SELECT email FROM auth.users WHERE email LIKE '%@admin.com'
  ));

CREATE POLICY "Chapters are viewable by authenticated users"
  ON chapters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage chapters"
  ON chapters FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (
    SELECT email FROM auth.users WHERE email LIKE '%@admin.com'
  ));

CREATE POLICY "Slides are viewable by authenticated users"
  ON slides FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage slides"
  ON slides FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (
    SELECT email FROM auth.users WHERE email LIKE '%@admin.com'
  ));