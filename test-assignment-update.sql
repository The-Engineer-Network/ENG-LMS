-- Test assignment update functionality
-- This will help us verify if updates are working in the database

-- 1. Check what columns exist in assignments table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'assignments' 
ORDER BY ordinal_position;

-- 2. Show current assignments
SELECT 
  id,
  title,
  requirements,
  submission_guidelines,
  created_at
FROM assignments
ORDER BY created_at DESC;

-- 3. Test update (replace 'your-assignment-id' with actual ID)
-- UPDATE assignments 
-- SET 
--   title = 'Updated Task Title',
--   requirements = 'Updated requirements',
--   submission_guidelines = 'Updated guidelines'
-- WHERE id = 'your-assignment-id';

-- 4. Verify the update worked
-- SELECT 
--   id,
--   title,
--   requirements,
--   submission_guidelines,
--   created_at
-- FROM assignments
-- WHERE id = 'your-assignment-id';