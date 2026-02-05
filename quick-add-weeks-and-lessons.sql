-- ========================================
-- QUICK ADD WEEKS AND LESSONS
-- Use this in Supabase SQL Editor
-- ========================================

-- First, let's see your tracks to get the track_id
SELECT id, name FROM tracks;

-- Copy the track_id you want to use, then run the sections below
-- Replace 'YOUR_TRACK_ID_HERE' with the actual track ID

-- ========================================
-- EXAMPLE: Add Week 2 for Frontend Development
-- ========================================
INSERT INTO weeks (title, description, track_id, week_number, order_index)
VALUES (
  'Week 2: CSS Fundamentals',
  'Learn CSS styling, layouts, and responsive design',
  '5ddfa9fe-c2b2-4820-8187-dd662cc07d58', -- Replace with your track ID
  2,
  2
)
RETURNING id, title;

-- Copy the week ID from the result above, then add lessons to it

-- ========================================
-- Add Lessons to Week 2
-- ========================================
-- Replace 'WEEK_ID_HERE' with the ID returned above

INSERT INTO lessons (title, type, content, video_url, duration, week_id, order_index)
VALUES 
  (
    'Introduction to CSS',
    'video',
    'Learn the basics of CSS styling',
    'https://www.youtube.com/watch?v=1PnVor36_40',
    '45:00',
    'WEEK_ID_HERE', -- Replace with your week ID
    1
  ),
  (
    'CSS Flexbox',
    'video',
    'Master flexbox for layouts',
    'https://www.youtube.com/watch?v=JJSoEo8JSnc',
    '30:00',
    'WEEK_ID_HERE', -- Replace with your week ID
    2
  ),
  (
    'CSS Grid',
    'video',
    'Learn CSS Grid for complex layouts',
    'https://www.youtube.com/watch?v=EFafSYg-PkI',
    '35:00',
    'WEEK_ID_HERE', -- Replace with your week ID
    3
  );

-- ========================================
-- TEMPLATE: Copy and modify this for more weeks
-- ========================================

-- Step 1: Add a new week
INSERT INTO weeks (title, description, track_id, week_number, order_index)
VALUES (
  'Week 3: JavaScript Basics', -- Change this
  'Introduction to JavaScript programming', -- Change this
  '5ddfa9fe-c2b2-4820-8187-dd662cc07d58', -- Your track ID
  3, -- Week number
  3  -- Order
)
RETURNING id, title;

-- Step 2: Add lessons (copy the week ID from above)
INSERT INTO lessons (title, type, content, video_url, duration, week_id, order_index)
VALUES 
  (
    'JavaScript Variables and Data Types',
    'video',
    'Learn about variables, strings, numbers, and booleans',
    'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    '40:00',
    'WEEK_ID_HERE', -- Replace with week ID
    1
  ),
  (
    'JavaScript Functions',
    'video',
    'Understanding functions and scope',
    'https://www.youtube.com/watch?v=N8ap4k_1QEQ',
    '35:00',
    'WEEK_ID_HERE', -- Replace with week ID
    2
  );

-- ========================================
-- Verify your data
-- ========================================
SELECT 
  w.week_number,
  w.title as week_title,
  COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
WHERE w.track_id = '5ddfa9fe-c2b2-4820-8187-dd662cc07d58' -- Your track ID
GROUP BY w.id, w.week_number, w.title
ORDER BY w.week_number;
