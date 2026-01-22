-- Test cohorts functionality
-- 1. Check if cohorts table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'cohorts'
) as cohorts_table_exists;

-- 2. Check current cohorts
SELECT COUNT(*) as cohort_count FROM cohorts;

-- 3. Check cohorts table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cohorts'
ORDER BY ordinal_position;

-- 4. Check RLS policies for cohorts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cohorts';

-- 5. Test cohort creation
INSERT INTO cohorts (name, start_date, end_date, status)
VALUES (
    'Test Cohort 2024',
    '2024-02-01',
    '2024-05-01',
    'Upcoming'
)
RETURNING id, name, start_date, end_date, status;