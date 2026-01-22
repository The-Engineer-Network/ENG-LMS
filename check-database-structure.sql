-- Check current database structure to understand what exists

-- Check profiles table structure
SELECT 'PROFILES_COLUMNS' as check_type, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if is_admin function exists and what it does
SELECT 'FUNCTIONS' as check_type, routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%admin%';

-- Check existing policies that use is_admin
SELECT 'POLICIES_WITH_ADMIN' as check_type, tablename, policyname, definition
FROM pg_policies 
WHERE schemaname = 'public' AND definition LIKE '%is_admin%';

-- Check all tables that exist
SELECT 'EXISTING_TABLES' as check_type, table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check existing triggers
SELECT 'EXISTING_TRIGGERS' as check_type, trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check if student_achievements and week_progress already exist
SELECT 'TABLE_EXISTS_CHECK' as check_type, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
            THEN 'student_achievements EXISTS' 
            ELSE 'student_achievements MISSING' END as student_achievements,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
            THEN 'week_progress EXISTS' 
            ELSE 'week_progress MISSING' END as week_progress;