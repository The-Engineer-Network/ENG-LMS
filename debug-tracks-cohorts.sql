-- Debug tracks and cohorts loading issue

-- Check if tracks exist
SELECT 'TRACKS COUNT:' as info, COUNT(*) as count FROM tracks;
SELECT * FROM tracks ORDER BY name;

-- Check if cohorts exist  
SELECT 'COHORTS COUNT:' as info, COUNT(*) as count FROM cohorts;
SELECT * FROM cohorts ORDER BY start_date;

-- Check RLS policies on tracks
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tracks', 'cohorts')
ORDER BY tablename, policyname;

-- Test basic select permissions
SET ROLE authenticated;
SELECT 'TRACKS AS AUTHENTICATED:' as info, COUNT(*) as count FROM tracks;
SELECT 'COHORTS AS AUTHENTICATED:' as info, COUNT(*) as count FROM cohorts;
RESET ROLE;

-- Check if there are any tracks/cohorts at all
SELECT 'TOTAL TRACKS:' as info, COUNT(*) as total FROM tracks;
SELECT 'TOTAL COHORTS:' as info, COUNT(*) as total FROM cohorts;