-- Complete System Verification
-- Test the entire admin-to-student data flow

-- =============================================================================
-- STEP 1: Check Admin-Created Content
-- =============================================================================

-- Check tracks created by admin
SELECT 'ADMIN_TRACKS' as component,
       COUNT(*) as count,
       'Tracks available for students' as description
FROM tracks;

-- Check weeks created by admin
SELECT 'ADMIN_WEEKS' as component,
       COUNT(*) as count,
       'Weeks with lessons and assignments' as description
FROM weeks;

-- Check lessons created by admin
SELECT 'ADMIN_LESSONS' as component,
       COUNT(*) as count,
       'Lessons students can view' as description
FROM lessons;

-- Check assignments created by admin
SELECT 'ADMIN_ASSIGNMENTS' as component,
       COUNT(*) as count,
       'Tasks students can submit' as description
FROM assignments;

-- =============================================================================
-- STEP 2: Check Student Enrollment and Access
-- =============================================================================

-- Check student enrollments
SELECT 'STUDENT_ENROLLMENTS' as component,
       COUNT(*) as count,
       'Students enrolled in tracks' as description
FROM student_enrollments;

-- Check if students have submitted tasks
SELECT 'STUDENT_SUBMISSIONS' as component,
       COUNT(*) as count,
       'Task submissions from students' as description
FROM task_submissions;

-- Check student progress tracking
SELECT 'STUDENT_PROGRESS' as component,
       COUNT(*) as count,
       'Week progress records' as description
FROM week_progress;

-- Check student achievements
SELECT 'STUDENT_ACHIEVEMENTS' as component,
       COUNT(*) as count,
       'Achievements earned by students' as description
FROM student_achievements;

-- =============================================================================
-- STEP 3: Verify Data Flow Connections
-- =============================================================================

-- Check track-to-week connections
SELECT 'TRACK_WEEK_CONNECTION' as verification,
       t.name as track_name,
       COUNT(w.id) as weeks_count,
       'Admin tracks have weeks' as status
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
GROUP BY t.id, t.name;

-- Check week-to-lesson connections
SELECT 'WEEK_LESSON_CONNECTION' as verification,
       w.title as week_title,
       COUNT(l.id) as lessons_count,
       'Weeks have lessons for students' as status
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.title
ORDER BY w.week_number;

-- Check week-to-assignment connections
SELECT 'WEEK_ASSIGNMENT_CONNECTION' as verification,
       w.title as week_title,
       COUNT(a.id) as assignments_count,
       'Weeks have assignments for students' as status
FROM weeks w
LEFT JOIN assignments a ON a.week_id = w.id
GROUP BY w.id, w.title
ORDER BY w.week_number;

-- =============================================================================
-- STEP 4: Check Student Dashboard Data Sources
-- =============================================================================

-- Verify student dashboard will show real data
SELECT 'DASHBOARD_DATA_CHECK' as verification,
       se.user_id as student_id,
       p.full_name as student_name,
       t.name as track_name,
       c.name as cohort_name,
       se.progress_percentage as progress,
       COUNT(wp.id) as week_progress_records,
       'Student dashboard data available' as status
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
JOIN tracks t ON t.id = se.track_id
JOIN cohorts c ON c.id = se.cohort_id
LEFT JOIN week_progress wp ON wp.student_id = se.user_id
GROUP BY se.user_id, p.full_name, t.name, c.name, se.progress_percentage
LIMIT 5;

-- =============================================================================
-- STEP 5: Check for Mock Data Issues
-- =============================================================================

-- Check if achievements are real or mock
SELECT 'ACHIEVEMENTS_CHECK' as verification,
       CASE WHEN COUNT(*) > 0 
            THEN 'Real achievements from database'
            ELSE 'No achievements yet - will use fallback'
       END as status,
       COUNT(*) as count
FROM student_achievements;

-- Check if progress tracking is working
SELECT 'PROGRESS_TRACKING_CHECK' as verification,
       CASE WHEN COUNT(*) > 0 
            THEN 'Real progress tracking active'
            ELSE 'No progress records yet'
       END as status,
       COUNT(*) as count
FROM week_progress;

-- =============================================================================
-- STEP 6: Test Data Flow (Sample)
-- =============================================================================

-- Show sample of complete data flow
SELECT 'COMPLETE_FLOW_SAMPLE' as verification,
       t.name as track,
       w.title as week,
       l.title as lesson,
       a.title as assignment,
       CASE WHEN ts.id IS NOT NULL THEN 'Student submitted' ELSE 'Not submitted' END as submission_status,
       CASE WHEN wp.id IS NOT NULL THEN wp.status ELSE 'No progress' END as progress_status
FROM tracks t
JOIN weeks w ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
LEFT JOIN task_submissions ts ON ts.assignment_id = a.id
LEFT JOIN week_progress wp ON wp.week_id = w.id AND wp.student_id = ts.student_id
ORDER BY t.name, w.week_number, l.title, a.title
LIMIT 10;

-- =============================================================================
-- STEP 7: System Health Summary
-- =============================================================================

SELECT 'SYSTEM_HEALTH_SUMMARY' as final_check,
       CASE WHEN EXISTS (SELECT 1 FROM tracks) THEN '✅' ELSE '❌' END || ' Admin can create tracks' as admin_tracks,
       CASE WHEN EXISTS (SELECT 1 FROM weeks) THEN '✅' ELSE '❌' END || ' Admin can create weeks' as admin_weeks,
       CASE WHEN EXISTS (SELECT 1 FROM lessons) THEN '✅' ELSE '❌' END || ' Admin can create lessons' as admin_lessons,
       CASE WHEN EXISTS (SELECT 1 FROM assignments) THEN '✅' ELSE '❌' END || ' Admin can create assignments' as admin_assignments,
       CASE WHEN EXISTS (SELECT 1 FROM student_enrollments) THEN '✅' ELSE '❌' END || ' Students can be enrolled' as student_enrollment,
       CASE WHEN EXISTS (SELECT 1 FROM task_submissions) THEN '✅' ELSE '❌' END || ' Students can submit tasks' as student_submissions,
       CASE WHEN EXISTS (SELECT 1 FROM week_progress) THEN '✅' ELSE '❌' END || ' Progress tracking works' as progress_tracking,
       CASE WHEN EXISTS (SELECT 1 FROM student_achievements) THEN '✅' ELSE '❌' END || ' Achievement system works' as achievements;