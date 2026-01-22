-- Check current table structures to see what columns exist

-- Check tracks table structure
SELECT 'TRACKS_TABLE' as table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'tracks' 
ORDER BY ordinal_position;

-- Check cohorts table structure
SELECT 'COHORTS_TABLE' as table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'cohorts' 
ORDER BY ordinal_position;

-- Check weeks table structure
SELECT 'WEEKS_TABLE' as table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'weeks' 
ORDER BY ordinal_position;

-- Check lessons table structure
SELECT 'LESSONS_TABLE' as table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- Check assignments table structure
SELECT 'ASSIGNMENTS_TABLE' as table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'assignments' 
ORDER BY ordinal_position;