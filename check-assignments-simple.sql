-- Step 1: Check if assignments table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'assignments'
) as assignments_table_exists;
