-- Check what tables exist in the database

-- 1. List all tables in the public schema
SELECT 'EXISTING TABLES IN PUBLIC SCHEMA:' as status;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if any of our expected tables exist
SELECT 'CHECKING FOR EXPECTED TABLES:' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as profiles_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tracks' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as tracks_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cohorts' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as cohorts_table;

-- 3. Check auth schema tables (should exist)
SELECT 'AUTH SCHEMA TABLES:' as status;
SELECT 
  table_name
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;