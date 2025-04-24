/*
  # Add React and React Native Learning Paths

  1. New Content
    - Advanced React lessons
    - Advanced React Native lessons
    - Learning paths for both React and React Native
    - Related achievements

  2. Topics Covered
    - Advanced React Patterns
    - Performance Optimization
    - State Management
    - Custom Hooks
    - React Native Internals
    - Native Modules
    - Animation Systems
*/

-- Insert React lessons
INSERT INTO lessons (title, content, difficulty, category, estimated_duration) VALUES
(
  'Advanced React Patterns',
  jsonb_build_object(
    'description', 'Master advanced React patterns for building scalable and maintainable applications.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Compound Components',
        'content', 'Learn to build flexible and composable component APIs using the compound components pattern.'
      ),
      jsonb_build_object(
        'title', 'Render Props Pattern',
        'content', 'Understand and implement the render props pattern for maximum component reusability.'
      ),
      jsonb_build_object(
        'title', 'Higher-Order Components (HOCs)',
        'content', 'Deep dive into HOCs and their role in component composition and code reuse.'
      ),
      jsonb_build_object(
        'title', 'Custom Hooks Pattern',
        'content', 'Create powerful custom hooks that encapsulate complex logic and state management.'
      )
    )
  ),
  'advanced',
  'React',
  120
),
(
  'React Performance Optimization',
  jsonb_build_object(
    'description', 'Learn advanced techniques for optimizing React application performance.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Profiling and Measurement',
        'content', 'Use React DevTools and performance profilers to identify bottlenecks.'
      ),
      jsonb_build_object(
        'title', 'Memoization Techniques',
        'content', 'Master useMemo, useCallback, and React.memo for optimal re-rendering.'
      ),
      jsonb_build_object(
        'title', 'Code Splitting',
        'content', 'Implement dynamic imports and route-based code splitting.'
      ),
      jsonb_build_object(
        'title', 'Virtual List Optimization',
        'content', 'Handle large lists efficiently using virtualization techniques.'
      )
    )
  ),
  'advanced',
  'React',
  90
),
(
  'Advanced State Management',
  jsonb_build_object(
    'description', 'Deep dive into complex state management patterns and solutions in React.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Context API Advanced Patterns',
        'content', 'Advanced usage of Context API for global state management.'
      ),
      jsonb_build_object(
        'title', 'Redux Toolkit and RTK Query',
        'content', 'Modern Redux patterns with Redux Toolkit and RTK Query.'
      ),
      jsonb_build_object(
        'title', 'Zustand and Jotai',
        'content', 'Exploring modern alternatives to Redux for state management.'
      ),
      jsonb_build_object(
        'title', 'State Machines in React',
        'content', 'Using XState for complex state management scenarios.'
      )
    )
  ),
  'advanced',
  'React',
  120
);

-- Insert React Native lessons
INSERT INTO lessons (title, content, difficulty, category, estimated_duration) VALUES
(
  'React Native Internals',
  jsonb_build_object(
    'description', 'Understanding React Native architecture and internal workings.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Bridge Architecture',
        'content', 'Deep dive into the React Native bridge and its role in native communication.'
      ),
      jsonb_build_object(
        'title', 'New Architecture (Fabric)',
        'content', 'Understanding the new React Native architecture and its benefits.'
      ),
      jsonb_build_object(
        'title', 'Native Modules',
        'content', 'Creating custom native modules for iOS and Android.'
      ),
      jsonb_build_object(
        'title', 'Performance Optimization',
        'content', 'Advanced techniques for optimizing React Native apps.'
      )
    )
  ),
  'advanced',
  'React Native',
  150
),
(
  'Advanced Animation Systems',
  jsonb_build_object(
    'description', 'Master complex animations and gestures in React Native.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Reanimated 2 Deep Dive',
        'content', 'Advanced usage of Reanimated 2 for high-performance animations.'
      ),
      jsonb_build_object(
        'title', 'Gesture Handler Integration',
        'content', 'Complex gesture handling and animation combinations.'
      ),
      jsonb_build_object(
        'title', 'Shared Element Transitions',
        'content', 'Implementing smooth shared element transitions between screens.'
      ),
      jsonb_build_object(
        'title', 'Custom Animation Drivers',
        'content', 'Creating custom animation drivers for unique effects.'
      )
    )
  ),
  'advanced',
  'React Native',
  120
),
(
  'Native Module Development',
  jsonb_build_object(
    'description', 'Learn to create and integrate native modules in React Native.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'iOS Module Development',
        'content', 'Creating native modules for iOS using Swift and Objective-C.'
      ),
      jsonb_build_object(
        'title', 'Android Module Development',
        'content', 'Building native modules for Android using Kotlin and Java.'
      ),
      jsonb_build_object(
        'title', 'Module Testing',
        'content', 'Testing strategies for native modules.'
      ),
      jsonb_build_object(
        'title', 'Publishing and Distribution',
        'content', 'Publishing native modules to npm and maintaining them.'
      )
    )
  ),
  'advanced',
  'React Native',
  180
);

-- Create React learning path
INSERT INTO learning_paths (title, description, lessons, difficulty, estimated_duration)
SELECT 
  'Advanced React Mastery',
  'Master advanced React concepts including patterns, performance optimization, and state management.',
  ARRAY_AGG(id),
  'advanced',
  SUM(estimated_duration)
FROM lessons
WHERE category = 'React' AND difficulty = 'advanced';

-- Create React Native learning path
INSERT INTO learning_paths (title, description, lessons, difficulty, estimated_duration)
SELECT 
  'React Native Architecture and Performance',
  'Deep dive into React Native internals, native modules, and advanced animation systems.',
  ARRAY_AGG(id),
  'advanced',
  SUM(estimated_duration)
FROM lessons
WHERE category = 'React Native' AND difficulty = 'advanced';

-- Create achievements
INSERT INTO achievements (title, description, criteria, badge_url, points) VALUES
(
  'React Pattern Master',
  'Mastered advanced React patterns and component composition',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'React',
    'required_score', 90
  ),
  'https://example.com/badges/react-patterns.png',
  100
),
(
  'Performance Guru',
  'Demonstrated expertise in React performance optimization',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'React',
    'required_score', 85
  ),
  'https://example.com/badges/performance-guru.png',
  75
),
(
  'Native Module Expert',
  'Successfully created and integrated native modules',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'React Native',
    'required_score', 90
  ),
  'https://example.com/badges/native-module.png',
  100
),
(
  'Animation Master',
  'Mastered complex animations and gestures in React Native',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'React Native',
    'required_score', 85
  ),
  'https://example.com/badges/animation-master.png',
  75
);