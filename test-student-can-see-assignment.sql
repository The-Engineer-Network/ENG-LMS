-- Test if a specific student can see assignments
-- Replace 'YOUR_STUDENT_ID' with the actual student user ID

-- First, check the student's enrollment
SELECT 
  user_id,
  track_id,
  cohort_id
FROM student_enrollments
WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- Check what track the assignment belongs to
SELECT 
  a.id,
  a.title,
  a.week_id,
  w.track_id,
  t.name as track_name
FROM assignments a
JOIN weeks w ON a.week_id = w.id
JOIN tracks t ON w.track_id = t.id;

-- Check if the student's track matches the assignment's track
SELECT 
  se.user_id,
  se.track_id as student_track_id,
  t.name as student_track_name,
  a.id as assignment_id,
  a.title as assignment_title,
  w.track_id as assignment_track_id,
  CASE 
    WHEN se.track_id = w.track_id THEN 'MATCH - Student should see this'
    ELSE 'NO MATCH - Student will not see this'
  END as visibility_status
FROM student_enrollments se
CROSS JOIN assignments a
JOIN weeks w ON a.week_id = w.id
JOIN tracks t ON se.track_id = t.id
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';
