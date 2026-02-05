-- Check if there's a trigger on task_submissions that's causing the issue
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'task_submissions';

-- Check week_progress table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'week_progress'
ORDER BY ordinal_position;

-- Drop any problematic triggers on task_submissions
-- (We'll list them first, then you can drop specific ones if needed)
