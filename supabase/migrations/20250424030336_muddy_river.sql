/*
  # Fix Chapters Schema

  1. Changes
    - Remove lesson_id references
    - Update foreign key relationships
    - Add proper indexes
    - Update RLS policies

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Drop existing tables in correct order
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS slides CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;

-- Create learning paths table
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

-- Create chapters table with learning_path_id
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

-- Create user progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Create indexes
CREATE INDEX idx_chapters_learning_path_id ON chapters(learning_path_id);
CREATE INDEX idx_chapters_category ON chapters(category);
CREATE INDEX idx_chapters_difficulty ON chapters(difficulty);
CREATE INDEX idx_learning_paths_category ON learning_paths(category);
CREATE INDEX idx_slides_chapter_id ON slides(chapter_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_chapter_id ON user_progress(chapter_id);

-- Enable RLS
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Insert sample data
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
    'description', 'Introduction to React Hooks and their benefits',
    'content', 'React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components.',
    'examples', jsonb_build_array(
      'Write cleaner functional components',
      'Reuse stateful logic between components',
      'Compose multiple hooks for complex logic'
    )
  )
);