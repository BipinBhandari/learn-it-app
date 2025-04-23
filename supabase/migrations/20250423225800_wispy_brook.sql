/*
  # Initial Schema Setup for Learning Management System

  1. New Tables
    - profiles
      - user_id (uuid, references auth.users)
      - bio (text)
      - learning_streak (integer)
      - total_points (integer)
      - preferences (jsonb)
    
    - lessons
      - id (uuid)
      - title (text)
      - content (jsonb)
      - difficulty (enum)
      - category (text)
      - prerequisites (uuid[])
      - estimated_duration (integer)
    
    - user_progress
      - id (uuid)
      - user_id (uuid)
      - lesson_id (uuid)
      - status (enum)
      - score (integer)
      - completed_at (timestamp)
      - last_accessed (timestamp)
      - notes (text)
    
    - achievements
      - id (uuid)
      - title (text)
      - description (text)
      - criteria (jsonb)
      - badge_url (text)
      - points (integer)
    
    - user_achievements
      - user_id (uuid)
      - achievement_id (uuid)
      - earned_at (timestamp)
    
    - learning_paths
      - id (uuid)
      - title (text)
      - description (text)
      - lessons (uuid[])
      - difficulty (enum)
      - estimated_duration (integer)

  2. Security
    - Enable RLS on all tables
    - Set up access policies for each table
    - Create necessary indexes
*/

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create profiles table
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  learning_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{"difficulty_level": "beginner", "study_reminders": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  category TEXT NOT NULL,
  prerequisites UUID[] DEFAULT '{}',
  estimated_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  badge_url TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Create learning_paths table
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lessons UUID[] NOT NULL DEFAULT '{}',
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  estimated_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lessons
CREATE POLICY "Lessons are viewable by authenticated users"
  ON lessons FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert/update lessons"
  ON lessons FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (SELECT email FROM auth.users WHERE email LIKE '%@admin.com'));

-- User Progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress records"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage achievements"
  ON achievements FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (SELECT email FROM auth.users WHERE email LIKE '%@admin.com'));

-- User Achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Learning Paths
CREATE POLICY "Learning paths are viewable by authenticated users"
  ON learning_paths FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage learning paths"
  ON learning_paths FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() IN (SELECT email FROM auth.users WHERE email LIKE '%@admin.com'));

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_lessons_category ON lessons(category);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();