/*
  # Add Python Advanced Topics Lessons

  1. New Data
    - Add lessons for advanced Python topics
    - Each lesson includes:
      - Title
      - Content (description, sections, code examples)
      - Difficulty level
      - Category
      - Estimated duration

  2. Content Structure
    - Each lesson's content is stored as JSONB
    - Content includes:
      - Description
      - Learning objectives
      - Sections with theory and examples
      - Code snippets
      - Practice exercises
*/

-- Insert lessons for advanced Python topics
INSERT INTO lessons (title, content, difficulty, category, estimated_duration) VALUES
(
  'Concurrency and Parallelism in Python',
  jsonb_build_object(
    'description', 'Master asynchronous programming, multithreading, and multiprocessing in Python for high-performance applications.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Understanding the Global Interpreter Lock (GIL)',
        'content', 'Learn about Python''s GIL, its impact on multithreaded applications, and when to use multiprocessing instead.'
      ),
      jsonb_build_object(
        'title', 'Asynchronous Programming with asyncio',
        'content', 'Explore Python''s asyncio library for writing concurrent code using async/await syntax.'
      ),
      jsonb_build_object(
        'title', 'Practical Multithreading',
        'content', 'Implement thread pools and handle thread synchronization using the threading module.'
      ),
      jsonb_build_object(
        'title', 'Multiprocessing for CPU-bound Tasks',
        'content', 'Learn when and how to use multiprocessing to bypass the GIL and achieve true parallelism.'
      )
    )
  ),
  'advanced',
  'Python',
  120
),
(
  'Advanced Python Metaclasses',
  jsonb_build_object(
    'description', 'Deep dive into Python metaclasses for advanced class customization and framework development.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Metaclass Fundamentals',
        'content', 'Understanding the metaclass concept and type creation in Python.'
      ),
      jsonb_build_object(
        'title', 'Custom Metaclasses',
        'content', 'Creating metaclasses for class validation and modification.'
      ),
      jsonb_build_object(
        'title', 'Abstract Base Classes',
        'content', 'Using metaclasses to create abstract base classes and interfaces.'
      )
    )
  ),
  'advanced',
  'Python',
  90
),
(
  'Python Descriptors and Properties',
  jsonb_build_object(
    'description', 'Master Python descriptors for managed attribute access and data validation.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Descriptor Protocol',
        'content', 'Understanding the descriptor protocol and its methods.'
      ),
      jsonb_build_object(
        'title', 'Property Decorators',
        'content', 'Using properties for getter, setter, and deleter methods.'
      ),
      jsonb_build_object(
        'title', 'Custom Descriptors',
        'content', 'Implementing descriptors for attribute management and validation.'
      )
    )
  ),
  'advanced',
  'Python',
  60
),
(
  'Advanced Python Generators and Coroutines',
  jsonb_build_object(
    'description', 'Deep dive into generators and coroutines for efficient data processing and async operations.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Generator Functions and Expressions',
        'content', 'Creating and using generators for memory-efficient iteration.'
      ),
      jsonb_build_object(
        'title', 'Coroutines and yield from',
        'content', 'Understanding coroutines and their role in asynchronous programming.'
      ),
      jsonb_build_object(
        'title', 'Asynchronous Generators',
        'content', 'Combining generators with async/await for powerful async iterations.'
      )
    )
  ),
  'advanced',
  'Python',
  90
),
(
  'Python Memory Management and Optimization',
  jsonb_build_object(
    'description', 'Learn advanced techniques for optimizing Python code and managing memory efficiently.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Memory Management in Python',
        'content', 'Understanding Python''s memory allocation and garbage collection.'
      ),
      jsonb_build_object(
        'title', 'Profiling Tools',
        'content', 'Using memory_profiler and cProfile for performance analysis.'
      ),
      jsonb_build_object(
        'title', 'Optimization Techniques',
        'content', 'Implementing various optimization strategies for Python code.'
      )
    )
  ),
  'advanced',
  'Python',
  120
);

-- Create a learning path for Advanced Python
INSERT INTO learning_paths (title, description, lessons, difficulty, estimated_duration)
SELECT 
  'Advanced Python Mastery',
  'Master advanced Python concepts including concurrency, metaclasses, and optimization techniques.',
  ARRAY_AGG(id),
  'advanced',
  SUM(estimated_duration)
FROM lessons
WHERE category = 'Python' AND difficulty = 'advanced';

-- Create achievements for Python mastery
INSERT INTO achievements (title, description, criteria, badge_url, points) VALUES
(
  'Python Concurrent Master',
  'Successfully completed the concurrency and parallelism module',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'Python',
    'required_score', 90
  ),
  'https://example.com/badges/python-concurrent.png',
  100
),
(
  'Metaclass Guru',
  'Demonstrated expertise in Python metaclasses',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'Python',
    'required_score', 85
  ),
  'https://example.com/badges/metaclass-guru.png',
  75
),
(
  'Python Optimization Expert',
  'Mastered Python memory management and optimization techniques',
  jsonb_build_object(
    'type', 'lesson_completed',
    'lesson_category', 'Python',
    'required_score', 80
  ),
  'https://example.com/badges/python-optimizer.png',
  90
);