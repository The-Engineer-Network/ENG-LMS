-- Simple test to check student_enrollments table

-- Check if table exists
SELECT 'TABLE EXISTS CHECK:' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'student_enrollments'
) as table_exists;

-- Check table structure
SELECT 'TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_enrollments' 
ORDER BY ordinal_position;

-- Check if we can query the table at all
SELECT 'BASIC QUERY TEST:' as info;
SELECT COUNT(*) as total_rows FROM student_enrollments;

-- Check RLS policies
SELECT 'RLS POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'student_enrollments';

-- Check if RLS is enabled
SELECT 'RLS STATUS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'student_enrollments';