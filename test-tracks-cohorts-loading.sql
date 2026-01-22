-- Test tracks and cohorts loading for students page
-- 1. Check tracks
SELECT COUNT(*) as track_count FROM tracks;
SELECT id, name, description FROM tracks ORDER BY name;

-- 2. Check cohorts  
SELECT COUNT(*) as cohort_count FROM cohorts;
SELECT id, name, start_date, end_date, status FROM cohorts ORDER BY start_date;

-- 3. Check RLS policies for both tables
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('tracks', 'cohorts')
ORDER BY tablename, policyname;