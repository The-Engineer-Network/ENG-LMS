-- ========================================
-- CREATE RPC FUNCTION FOR LESSON CREATION
-- ========================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_lesson_rpc(jsonb);

-- Create a function that can be called via RPC
CREATE OR REPLACE FUNCTION create_lesson_rpc(lesson_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_lesson_id uuid;
  result jsonb;
BEGIN
  -- Insert the lesson
  INSERT INTO lessons (
    title,
    type,
    content,
    video_url,
    duration,
    week_id,
    order_index
  ) VALUES (
    lesson_data->>'title',
    (lesson_data->>'type')::text,
    lesson_data->>'content',
    lesson_data->>'video_url',
    lesson_data->>'duration',
    (lesson_data->>'week_id')::uuid,
    (lesson_data->>'order_index')::integer
  )
  RETURNING id INTO new_lesson_id;
  
  -- Fetch the created lesson
  SELECT jsonb_build_object(
    'id', l.id,
    'title', l.title,
    'type', l.type,
    'content', l.content,
    'video_url', l.video_url,
    'duration', l.duration,
    'week_id', l.week_id,
    'order_index', l.order_index,
    'created_at', l.created_at
  ) INTO result
  FROM lessons l
  WHERE l.id = new_lesson_id;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create lesson: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_lesson_rpc(jsonb) TO authenticated;

-- Test the function
SELECT 
  '✅ Function created successfully!' as status,
  'You can now use supabase.rpc("create_lesson_rpc", { lesson_data: {...} })' as usage;

-- Test with sample data
DO $$
DECLARE
  test_week_id uuid;
  test_result jsonb;
BEGIN
  -- Get a valid week_id
  SELECT id INTO test_week_id FROM weeks LIMIT 1;
  
  IF test_week_id IS NOT NULL THEN
    -- Test the function
    SELECT create_lesson_rpc(jsonb_build_object(
      'title', 'TEST RPC LESSON',
      'type', 'video',
      'content', 'Test content',
      'video_url', 'https://example.com/video',
      'duration', '10:00',
      'week_id', test_week_id,
      'order_index', 999
    )) INTO test_result;
    
    RAISE NOTICE '✅ Test successful! Result: %', test_result;
    
    -- Clean up
    DELETE FROM lessons WHERE title = 'TEST RPC LESSON';
    RAISE NOTICE '✅ Test lesson cleaned up';
  ELSE
    RAISE NOTICE '❌ No weeks found to test with';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;
