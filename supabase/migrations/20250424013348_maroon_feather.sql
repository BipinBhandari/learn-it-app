/*
  # Add Topics and User Preferences Tables

  1. New Tables
    - topics
      - id (uuid)
      - name (text)
      - description (text)
      - icon (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - user_topic_preferences
      - user_id (uuid)
      - topic_id (uuid)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Set up access policies for authenticated users
*/

-- Create topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_topic_preferences table
CREATE TABLE user_topic_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Topics are viewable by everyone"
  ON topics FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own topic preferences"
  ON user_topic_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_topic_preferences_user_id ON user_topic_preferences(user_id);
CREATE INDEX idx_user_topic_preferences_topic_id ON user_topic_preferences(topic_id);

-- Insert initial topics
INSERT INTO topics (name, description, icon) VALUES
  ('Technology', 'Stay updated with the latest tech trends', 'monitor'),
  ('Science', 'Explore scientific discoveries', 'flask'),
  ('Design', 'Learn about design principles', 'pen-tool'),
  ('Business', 'Understand business concepts', 'briefcase'),
  ('Innovation', 'Discover innovative solutions', 'lightbulb'),
  ('Health', 'Focus on health and wellness', 'heart'),
  ('Personal growth', 'Develop personal skills', 'user'),
  ('Leadership', 'Enhance leadership abilities', 'users'),
  ('Communication', 'Improve communication skills', 'message-circle'),
  ('Productivity', 'Boost your productivity', 'clock'),
  ('Creativity', 'Enhance creative thinking', 'palette'),
  ('Education', 'Explore educational content', 'book-open');