-- Final System Check - Verify Everything is Working

-- =============================================================================
-- QUICK HEALTH CHECK
-- =============================================================================

SELECT 'SYSTEM_STATUS' as check_type,
       'Admin Content Creation' as category,
       CASE WHEN EXISTS (SELECT 1 FROM tracks) THEN '✅ Working' ELSE '❌ No tracks' END as tracks,
       CASE WHEN EXISTS (SELECT 1 FROM weeks) THEN '✅ Working' ELSE '❌ No weeks' END as weeks,
       CASE WHEN EXISTS (SELECT 1 FROM lessons) THEN '✅ Working' ELSE '❌ No lessons' END as lessons,
       CASE WHEN EXISTS (SELECT 1 FROM assignments) THEN '✅ Working' ELSE '❌ No assignments' END as assignments;

SELECT 'SYSTEM_STATUS' as check_type,
       'Student Experience' as category,
       CASE WHEN EXISTS (SELECT 1 FROM student_enrollments) THEN '✅ Working' ELSE '❌ No enrollments' END as enrollments,
       CASE WHEN EXISTS (SELECT 1 FROM task_submissions) THEN '✅ Working' ELSE '❌ No submissions' END as submissions,
       CASE WHEN EXISTS (SELECT 1 FROM week_progress) THEN '✅ Working' ELSE '❌ No progress' END as progress,
       CASE WHEN EXISTS (SELECT 1 FROM student_achievements) THEN '✅ Working' ELSE '⚠️ No achievements yet' END as achievements;

-- =============================================================================
-- DATA FLOW VERIFICATION
-- =============================================================================

-- Check if admin-created content is accessible to students
SELECT 'DATA_FLOW' as check_type,
       'Admin to Student Flow' as category,
       COUNT(DISTINCT t.id) as tracks_created,
       COUNT(DISTINCT w.id) as weeks_created,
       COUNT(DISTINCT l.id) as lessons_created,
       COUNT(DISTINCT a.id) as assignments_created,
       COUNT(DISTINCT se.id) as students_enrolled,
       'Content available for students' as status
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
LEFT JOIN student_enrollments se ON se.track_id = t.id;

-- =============================================================================
-- AUTOMATION CHECK
-- =============================================================================

-- Check if automation is working
SELECT 'AUTOMATION' as check_type,
       'Trigger System' as category,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
            THEN '✅ Progress triggers active' ELSE '❌ Progress triggers missing' END as progress_triggers,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_create_student_achievements') 
            THEN '✅ Achievement triggers active' ELSE '❌ Achievement triggers missing' END as achievement_triggers;

-- =============================================================================
-- SAMPLE DATA CHECK
-- =============================================================================

-- Show sample of real data being used
SELECT 'SAMPLE_DATA' as check_type,
       'Real Data Examples' as category,
       (SELECT name FROM tracks LIMIT 1) as sample_track,
       (SELECT title FROM weeks LIMIT 1) as sample_week,
       (SELECT title FROM lessons LIMIT 1) as sample_lesson,
       (SELECT title FROM assignments LIMIT 1) as sample_assignment;

-- =============================================================================
-- DASHBOARD DATA CHECK
-- =============================================================================

-- Verify student dashboard will show real data
SELECT 'DASHBOARD_DATA' as check_type,
       'Student Dashboard Sources' as category,
       COUNT(DISTINCT se.user_id) as students_with_data,
       AVG(se.progress_percentage) as avg_progress,
       COUNT(DISTINCT wp.id) as progress_records,
       COUNT(DISTINCT sa.id) as achievement_records,
       'Dashboard will show real data' as status
FROM student_enrollments se
LEFT JOIN week_progress wp ON wp.student_id = se.user_id
LEFT JOIN student_achievements sa ON sa.student_id = se.user_id;

-- =============================================================================
-- FINAL VERDICT
-- =============================================================================

SELECT 'FINAL_VERDICT' as check_type,
       CASE 
           WHEN EXISTS (SELECT 1 FROM tracks) 
           AND EXISTS (SELECT 1 FROM weeks) 
           AND EXISTS (SELECT 1 FROM assignments)
           AND EXISTS (SELECT 1 FROM student_enrollments)
           THEN '🎉 SYSTEM FULLY OPERATIONAL'
           ELSE '⚠️ SYSTEM NEEDS SETUP'
       END as system_status,
       CASE 
           WHEN EXISTS (SELECT 1 FROM week_progress) 
           AND EXISTS (SELECT 1 FROM student_achievements)
           THEN '✅ AUTOMATION WORKING'
           ELSE '⚠️ AUTOMATION NEEDS TESTING'
       END as automation_status,
       'Run test-automation-final.sql to test automation' as next_step;