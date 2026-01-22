-- Quick Status Check - See what we have and what's missing

-- Check content creation
SELECT 'CONTENT_CHECK' as type,
       (SELECT COUNT(*) FROM tracks) as tracks_count,
       (SELECT COUNT(*) FROM cohorts) as cohorts_count,
       (SELECT COUNT(*) FROM weeks) as weeks_count,
       (SELECT COUNT(*) FROM lessons) as lessons_count,
       (SELECT COUNT(*) FROM assignments) as assignments_count;

-- Check student data
SELECT 'STUDENT_CHECK' as type,
       (SELECT COUNT(*) FROM profiles) as profiles_count,
       (SELECT COUNT(*) FROM student_enrollments) as enrollments_count,
       (SELECT COUNT(*) FROM task_submissions) as submissions_count;

-- Check automation tables
SELECT 'AUTOMATION_CHECK' as type,
       (SELECT COUNT(*) FROM week_progress) as progress_count,
       (SELECT COUNT(*) FROM student_achievements) as achievements_count;

-- Check our specific track
SELECT 'OUR_TRACK_CHECK' as type,
       t.name as track_name,
       (SELECT COUNT(*) FROM weeks WHERE track_id = t.id) as weeks_count,
       (SELECT COUNT(*) FROM lessons l JOIN weeks w ON l.week_id = w.id WHERE w.track_id = t.id) as lessons_count,
       (SELECT COUNT(*) FROM assignments a JOIN weeks w ON a.week_id = w.id WHERE w.track_id = t.id) as assignments_count
FROM tracks t
WHERE t.name = 'Full Stack Development';

-- Show all tracks and their content
SELECT 'ALL_TRACKS' as type,
       t.name as track_name,
       (SELECT COUNT(*) FROM weeks WHERE track_id = t.id) as weeks_count
FROM tracks t
ORDER BY t.name;

-- Show actual weeks that exist
SELECT 'EXISTING_WEEKS' as type,
       w.title as week_title,
       t.name as track_name,
       w.week_number
FROM weeks w
JOIN tracks t ON t.id = w.track_id
ORDER BY t.name, w.week_number;