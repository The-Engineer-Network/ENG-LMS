-- Test if admin can insert lessons

-- 1. Check current RLS policies on lessons
SELECT 'CURRENT LESSONS POLICIES' as test;
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'lessons'
ORDER BY cmd, policyname;

-- 2. Check if is_admin() function works
SELECT 'IS_ADMIN FUNCTION TEST' as test;
SELECT is_admin() as result;

-- 3. Try a direct insert (this will use your current session)
SELECT 'ATTEMPTING INSERT' as test;
INSERT INTO lessons (
  title,
  type,
  content,
  video_url,
  duration,
  week_id,
  order_index
) VALUES (
  'Test Lesson from SQL',
  'video',
  '',
  'https://youtube.com/test',
  '10 min',
  (SELECT id FROM weeks LIMIT 1),
  999
) RETURNING *;

-- 4. Check if the lesson was created
SELECT 'VERIFY INSERT' as test;
SELECT * FROM lessons WHERE title = 'Test Lesson from SQL';

-- 5. Clean up
DELETE FROM lessons WHERE title = 'Test Lesson from SQL';
