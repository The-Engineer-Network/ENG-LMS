-- Check if weeks exist and what data they have
SELECT 
  'Weeks in Database' as check_type,
  w.id,
  w.week_number,
  w.title,
  w.track_id,
  t.name as track_name,
  w.order_index,
  (SELECT COUNT(*) FROM lessons WHERE week_id = w.id) as lesson_count,
  (SELECT COUNT(*) FROM assignments WHERE week_id = w.id) as assignment_count
FROM weeks w
LEFT JOIN tracks t ON t.id = w.track_id
ORDER BY w.track_id, w.order_index;

-- Check what the student's enrollment track is
SELECT 
  'Student Enrollment Track' as check_type,
  se.user_id,
  p.email,
  p.full_name,
  se.track_id,
  t.name as track_name,
  se.cohort_id,
  c.name as cohort_name
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- Check if there's a mismatch between student's track and weeks
SELECT 
  'Track Mismatch Check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM weeks w
      WHERE w.track_id = (
        SELECT track_id FROM student_enrollments 
        WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
      )
    ) THEN '✅ Weeks exist for student track'
    ELSE '❌ NO weeks found for student track'
  END as status;

-- Check lessons structure
SELECT 
  'Lessons Structure' as check_type,
  l.id,
  l.title,
  l.type,
  l.video_url,
  l.week_id,
  w.week_number,
  w.title as week_title
FROM lessons l
LEFT JOIN weeks w ON w.id = l.week_id
ORDER BY w.order_index, l.order_index
LIMIT 20;

-- Check assignments structure
SELECT 
  'Assignments Structure' as check_type,
  a.id,
  a.title,
  a.week_id,
  a.video_guide,
  a.learning_materials,
  w.week_number,
  w.title as week_title
FROM assignments a
LEFT JOIN weeks w ON w.id = a.week_id
ORDER BY w.order_index
LIMIT 20;
