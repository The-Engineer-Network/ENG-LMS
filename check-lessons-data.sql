-- Check if lessons table exists and has data
SELECT COUNT(*) as lesson_count FROM lessons;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- Check all lessons with their week and track info
SELECT 
    l.id,
    l.title,
    l.type,
    l.content,
    l.video_url,
    l.duration,
    l.order_index,
    l.created_at,
    w.title as week_title,
    w.week_number,
    t.name as track_name
FROM lessons l
LEFT JOIN weeks w ON l.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY l.created_at DESC;