-- Check the assignments table structure to see what columns exist
-- This will help us understand if video_guide and learning_materials columns exist

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assignments' 
ORDER BY ordinal_position;

-- Also check a sample assignment to see current data
SELECT 
  id,
  title,
  requirements,
  submission_guidelines,
  deadline,
  created_at
FROM assignments 
LIMIT 1;