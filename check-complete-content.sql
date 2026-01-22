-- Check Complete Content for Full Stack Development Track

-- Show the complete structure
SELECT 'FULL_STRUCTURE' as type,
       t.name as track_name,
       w.week_number,
       w.title as week_title,
       l.title as lesson_title,
       a.title as assignment_title
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
WHERE t.name = 'Full Stack Development'
ORDER BY w.week_number, l.order_index, a.title;

-- Count everything for our track
SELECT 'CONTENT_SUMMARY' as type,
       t.name as track_name,
       (SELECT COUNT(*) FROM weeks WHERE track_id = t.id) as weeks_count,
       (SELECT COUNT(*) FROM lessons l JOIN weeks w ON l.week_id = w.id WHERE w.track_id = t.id) as lessons_count,
       (SELECT COUNT(*) FROM assignments a JOIN weeks w ON a.week_id = w.id WHERE w.track_id = t.id) as assignments_count
FROM tracks t
WHERE t.name = 'Full Stack Development';

-- Check if we have the cohort
SELECT 'COHORT_CHECK' as type,
       name as cohort_name,
       status,
       start_date,
       end_date
FROM cohorts
WHERE name = 'Cohort 2024-A';