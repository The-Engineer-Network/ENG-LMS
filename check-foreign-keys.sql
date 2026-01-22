-- Check foreign key relationships and constraints

-- Check if student_enrollments table exists and its structure
SELECT 'STUDENT_ENROLLMENTS TABLE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'student_enrollments' 
ORDER BY ordinal_position;

-- Check if profiles table exists and its structure  
SELECT 'PROFILES TABLE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('student_enrollments', 'accountability_partners');

-- Test a simple query on student_enrollments
SELECT 'SIMPLE STUDENT_ENROLLMENTS QUERY:' as info;
SELECT COUNT(*) as total_enrollments FROM student_enrollments;

-- Test a simple query on profiles
SELECT 'SIMPLE PROFILES QUERY:' as info;
SELECT COUNT(*) as total_profiles FROM profiles;