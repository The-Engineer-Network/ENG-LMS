-- Test the exact queries that students use to fetch weeks and lessons

-- 1. Simulate getting a student's enrollment
SELECT 'STUDENT ENROLLMENT TEST' as test_type;
SELECT 
  se.id,
  se.user_id,
  se.track_id,
  se.cohort_id,
  p.email,
  p.full_name,
  t.name as track_name,
  c.name as cohort_name
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
LIMIT 1;

-- 2. Get the track_id from first enrollment
DO $$
DECLARE
  test_track_id UUID;
BEGIN
  SELECT track_id INTO test_track_id 
  FROM student_enrollments 
  LIMIT 1;
  
  IF test_track_id IS NULL THEN
    RAISE NOTICE 'No enrollments found - students need to be enrolled first!';
  ELSE
    RAISE NOTICE 'Testing with track_id: %', test_track_id;
  END IF;
END $$;

-- 3. Simulate the getWeeksByTrack query (this is what the app calls)
SELECT 'GET WEEKS BY TRACK TEST' as test_type;
WITH first_enrollment AS (
  SELECT track_id FROM student_enrollments LIMIT 1
)
SELECT 
  w.id,
  w.week_number,
  w.title,
  w.description,
  w.track_id,
  w.order_index,
  w.created_at,
  -- Count lessons for this week
  (SELECT COUNT(*) FROM lessons l WHERE l.week_id = w.id) as lessons_count,
  -- Get lessons as JSON
  (SELECT json_agg(
    json_build_object(
      'id', l.id,
      'title', l.title,
      'type', l.type,
      'content', l.content,
      'video_url', l.video_url,
      'video_urls', l.video_urls,
      'resource_links', l.resource_links,
      'duration', l.duration,
      'order_index', l.order_index
    ) ORDER BY l.order_index
  ) FROM lessons l WHERE l.week_id = w.id) as lessons,
  -- Get assignments as JSON
  (SELECT json_agg(
    json_build_object(
      'id', a.id,
      'title', a.title,
      'requirements', a.requirements,
      'deadline', a.deadline
    )
  ) FROM assignments a WHERE a.week_id = w.id) as assignments
FROM weeks w
WHERE w.track_id = (SELECT track_id FROM first_enrollment)
ORDER BY w.order_index;

-- 4. Check if lessons are actually linked to weeks
SELECT 'LESSONS LINKED TO WEEKS' as test_type;
SELECT 
  w.week_number,
  w.title as week_title,
  l.id as lesson_id,
  l.title as lesson_title,
  l.type as lesson_type
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
ORDER BY w.week_number, l.order_index
LIMIT 20;

-- 5. Check for orphaned lessons (lessons without a valid week)
SELECT 'ORPHANED LESSONS CHECK' as test_type;
SELECT 
  l.id,
  l.title,
  l.week_id,
  CASE 
    WHEN w.id IS NULL THEN 'ORPHANED - Week does not exist'
    ELSE 'OK'
  END as status
FROM lessons l
LEFT JOIN weeks w ON w.id = l.week_id
WHERE w.id IS NULL;

-- 6. Summary
SELECT 'SUMMARY' as test_type;
SELECT 
  (SELECT COUNT(*) FROM weeks) as total_weeks,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM weeks WHERE id IN (SELECT DISTINCT week_id FROM lessons)) as weeks_with_lessons,
  (SELECT COUNT(*) FROM student_enrollments) as total_enrollments,
  (SELECT COUNT(DISTINCT track_id) FROM weeks) as tracks_with_weeks;
