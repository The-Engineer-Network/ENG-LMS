-- ========================================
-- STEP-BY-STEP: Add Weeks and Lessons
-- Run each section ONE AT A TIME
-- ========================================

-- ========================================
-- STEP 1: Get your track ID
-- ========================================
SELECT id, name FROM tracks;

-- Result will show something like:
-- id: 5ddfa9fe-c2b2-4820-8187-dd662cc07d58
-- name: FRONTEND DEVELOPMENT

-- ========================================
-- STEP 2: Add a new week
-- Copy the track ID from Step 1 and paste it below
-- ========================================
INSERT INTO weeks (title, description, track_id, week_number, order_index)
VALUES (
  'Week 2: CSS Fundamentals',
  'Learn CSS styling, layouts, and responsive design',
  '5ddfa9fe-c2b2-4820-8187-dd662cc07d58', -- REPLACE THIS with your track ID
  2,
  2
)
RETURNING id, title;

-- This will return something like:
-- id: abc123-def456-ghi789
-- title: Week 2: CSS Fundamentals
-- COPY THE ID!

-- ========================================
-- STEP 3: Add lessons to the week you just created
-- Replace the week_id below with the ID from Step 2
-- ========================================
INSERT INTO lessons (title, type, content, video_url, duration, week_id, order_index)
VALUES 
  (
    'Introduction to CSS',
    'video',
    'Learn the basics of CSS styling',
    'https://www.youtube.com/watch?v=1PnVor36_40',
    '45:00',
    'abc123-def456-ghi789', -- REPLACE THIS with the week ID from Step 2
    1
  ),
  (
    'CSS Flexbox',
    'video',
    'Master flexbox for layouts',
    'https://www.youtube.com/watch?v=JJSoEo8JSnc',
    '30:00',
    'abc123-def456-ghi789', -- REPLACE THIS with the week ID from Step 2
    2
  );

-- ========================================
-- STEP 4: Verify it worked
-- ========================================
SELECT 
  w.week_number,
  w.title as week_title,
  l.title as lesson_title,
  l.order_index
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
WHERE w.track_id = '5ddfa9fe-c2b2-4820-8187-dd662cc07d58' -- Your track ID
ORDER BY w.week_number, l.order_index;

-- ========================================
-- DONE! Refresh your UI to see the new content
-- ========================================
