-- Check lessons table structure
SELECT 
  'Lessons Table Columns' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- Check assignments table structure
SELECT 
  'Assignments Table Columns' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;
