-- ========================================
-- CHECK LESSONS TABLE STRUCTURE
-- ========================================

-- 1. Check table structure
SELECT 
  '📋 Lessons Table Columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- 2. Check for NOT NULL constraints that might be missing values
SELECT 
  '⚠️ Required Fields (NOT NULL)' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'lessons'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 3. Check if the table has any data
SELECT 
  '📊 Current Lessons Count' as info,
  COUNT(*) as total_lessons
FROM lessons;

-- 4. Show sample lesson if any exist
SELECT 
  '📝 Sample Lesson' as info,
  id,
  title,
  type,
  week_id,
  order_index,
  created_at
FROM lessons
LIMIT 1;

-- 5. Check if the week_id being used exists
SELECT 
  '🔍 Check Week Exists' as info,
  id,
  title,
  week_number,
  track_id
FROM weeks
WHERE id = 'adc6b1b7-ff68-4140-bb75-d4dd1a43bc0c';

-- 6. Try inserting with minimal data
DO $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO lessons (
    title,
    type,
    week_id,
    order_index
  ) VALUES (
    'MINIMAL TEST LESSON',
    'video',
    'adc6b1b7-ff68-4140-bb75-d4dd1a43bc0c',
    1
  ) RETURNING id INTO new_id;
  
  RAISE NOTICE '✅ Minimal insert successful! ID: %', new_id;
  
  -- Clean up
  DELETE FROM lessons WHERE id = new_id;
  RAISE NOTICE '✅ Cleaned up test lesson';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Minimal insert failed: %', SQLERRM;
END $$;

SELECT '✅ Structure check complete!' as status;
