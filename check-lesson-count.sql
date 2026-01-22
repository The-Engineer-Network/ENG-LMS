-- Simple check for lessons
SELECT COUNT(*) as total_lessons FROM lessons;

-- Check recent lessons
SELECT 
    l.id,
    l.title,
    l.type,
    l.created_at,
    w.title as week_title
FROM lessons l
LEFT JOIN weeks w ON l.week_id = w.id
ORDER BY l.created_at DESC
LIMIT 5;