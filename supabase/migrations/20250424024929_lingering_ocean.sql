/*
  # Add Chapters and Slides Schema

  1. New Tables
    - chapters
      - id (uuid)
      - lesson_id (uuid)
      - title (text)
      - description (text)
      - order_index (integer)
      - estimated_duration (integer)
    
    - slides
      - id (uuid)
      - chapter_id (uuid)
      - title (text)
      - content (text, markdown)
      - type (enum: content, code, quiz)
      - order_index (integer)
      - metadata (jsonb, for additional slide-specific data)

  2. Security
    - Enable RLS on all tables
    - Set up access policies
    - Create necessary indexes
*/

-- Create slide_type enum
CREATE TYPE slide_type AS ENUM ('content', 'code', 'quiz');

-- Create chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create slides table
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type slide_type NOT NULL DEFAULT 'content',
  order_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX idx_chapters_lesson_id ON chapters(lesson_id);
CREATE INDEX idx_chapters_order ON chapters(order_index);
CREATE INDEX idx_slides_chapter_id ON slides(chapter_id);
CREATE INDEX idx_slides_order ON slides(order_index);

-- Create triggers for updated_at
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample chapter and slides for React Hooks
INSERT INTO chapters (lesson_id, title, description, order_index, estimated_duration)
SELECT 
  id,
  'Introduction to React Hooks',
  'Learn the fundamentals of React Hooks and how they revolutionize state management in functional components.',
  1,
  30
FROM lessons 
WHERE title = 'Advanced React Patterns'
LIMIT 1;

-- Insert slides for the React Hooks chapter
WITH chapter_id AS (
  SELECT id FROM chapters WHERE title = 'Introduction to React Hooks' LIMIT 1
)
INSERT INTO slides (chapter_id, title, content, type, order_index, metadata) VALUES
(
  (SELECT id FROM chapter_id),
  'What is React Hook?',
  '# Introduction to React Hooks

React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components.

![React Hooks Illustration](https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
  'content',
  1,
  '{}'::jsonb
),
(
  (SELECT id FROM chapter_id),
  'useState Hook',
  '# The useState Hook

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

The `useState` hook lets you add state to functional components.',
  'code',
  2,
  jsonb_build_object(
    'highlightedLines', ARRAY[2, 4, 7],
    'language', 'jsx'
  )
),
(
  (SELECT id FROM chapter_id),
  'Understanding useState',
  '# Quiz: useState Hook

Test your understanding of the useState hook.

1. What does useState return?
   - [ ] Just the state value
   - [x] An array with state value and setter function
   - [ ] A single function
   - [ ] An object

2. When should you use useState?
   - [x] When you need to manage local state in a component
   - [ ] Only in class components
   - [ ] Only for global state
   - [ ] Never in functional components',
  'quiz',
  3,
  jsonb_build_object(
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