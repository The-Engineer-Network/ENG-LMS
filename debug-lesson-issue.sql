-- Debug lesson creation and display issues
-- 1. Check if any lessons exist
SELECT COUNT(*) as total_lessons FROM lessons;

-- 2. Check all lessons with their week info
SELECT 
    l.id,
    l.title,
    l.type,
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

-- 3. Check weeks with their lesson counts
SELECT 
    w.id,
    w.title,
    w.week_number,
    t.name as track_name,
    COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN tracks t ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.title, w.week_number, t.name
ORDER BY w.week_number;

-- 4. Test lesson creation manually
INSERT INTO lessons (title, type, content, week_id, order_index)
SELECT 
    'Test Lesson - Introduction to JavaScript',
    'text',
    'This is a test lesson content about JavaScript basics.',
    w.id,
    1
FROM weeks w
WHERE w.title ILIKE '%week%'
LIMIT 1
RETURNING *;