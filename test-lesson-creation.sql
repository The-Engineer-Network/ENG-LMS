-- Test lesson creation and verify data is being saved
-- Check if lessons table exists and has proper structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- Check current lessons in database
SELECT 
    l.*,
    w.title as week_title,
    t.name as track_name
FROM lessons l
LEFT JOIN weeks w ON l.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY l.created_at DESC;

-- Check RLS policies for lessons table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'lessons';