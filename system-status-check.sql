-- Comprehensive System Status Check
-- This script checks all critical system components and data flow

-- Check 1: Database Tables and Structure
SELECT 'TABLE_CHECK' as check_type, 
       schemaname, 
       tablename, 
       hasindexes, 
       hasrules, 
       hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check 2: RLS Status
SELECT 'RLS_CHECK' as check_type,
       schemaname,
       tablename,
       rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check 3: Policies Count
SELECT 'POLICY_COUNT' as check_type,
       schemaname,
       tablename,
       COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check 4: Data Counts
SELECT 'DATA_COUNT' as check_type, 'tracks' as table_name, COUNT(*) as count FROM tracks
UNION ALL
SELECT 'DATA_COUNT', 'cohorts', COUNT(*) FROM cohorts
UNION ALL
SELECT 'DATA_COUNT', 'weeks', COUNT(*) FROM weeks
UNION ALL
SELECT 'DATA_COUNT', 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'DATA_COUNT', 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'DATA_COUNT', 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'DATA_COUNT', 'student_enrollments', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'DATA_COUNT', 'task_submissions', COUNT(*) FROM task_submissions
UNION ALL
SELECT 'DATA_COUNT', 'accountability_partners', COUNT(*) FROM accountability_partners
UNION ALL
SELECT 'DATA_COUNT', 'certificates', COUNT(*) FROM certificates
UNION ALL
SELECT 'DATA_COUNT', 'clarity_call_requests', COUNT(*) FROM clarity_call_requests
UNION ALL
SELECT 'DATA_COUNT', 'paid_learner_whitelist', COUNT(*) FROM paid_learner_whitelist
UNION ALL
SELECT 'DATA_COUNT', 'admin_settings', COUNT(*) FROM admin_settings;

-- Check 5: Admin Users
SELECT 'ADMIN_CHECK' as check_type,
       id,
       email,
       full_name,
       is_admin,
       created_at
FROM profiles 
WHERE is_admin = true;

-- Check 6: Track-Week-Assignment Relationships
SELECT 'RELATIONSHIP_CHECK' as check_type,
       t.name as track_name,
       COUNT(DISTINCT w.id) as weeks_count,
       COUNT(DISTINCT l.id) as lessons_count,
       COUNT(DISTINCT a.id) as assignments_count
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Check 7: Student Enrollment Status
SELECT 'ENROLLMENT_CHECK' as check_type,
       t.name as track_name,
       c.name as cohort_name,
       COUNT(se.id) as enrolled_students,
       AVG(se.progress_percentage) as avg_progress
FROM tracks t
CROSS JOIN cohorts c
LEFT JOIN student_enrollments se ON se.track_id = t.id AND se.cohort_id = c.id
GROUP BY t.id, t.name, c.id, c.name
ORDER BY t.name, c.name;

-- Check 8: Submission Status Distribution
SELECT 'SUBMISSION_STATUS' as check_type,
       status,
       COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM task_submissions
GROUP BY status
ORDER BY count DESC;

-- Check 9: Recent Activity (Last 7 days)
SELECT 'RECENT_ACTIVITY' as check_type,
       'task_submissions' as activity_type,
       DATE(created_at) as date,
       COUNT(*) as count
FROM task_submissions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
UNION ALL
SELECT 'RECENT_ACTIVITY',
       'student_enrollments',
       DATE(created_at),
       COUNT(*)
FROM student_enrollments
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
UNION ALL
SELECT 'RECENT_ACTIVITY',
       'profiles',
       DATE(created_at),
       COUNT(*)
FROM profiles
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Check 10: Trigger Functions Status
SELECT 'TRIGGER_CHECK' as check_type,
       trigger_name,
       event_manipulation,
       event_object_table,
       action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check 11: Missing Required Data
SELECT 'MISSING_DATA_CHECK' as check_type, 'assignments_without_weeks' as issue, COUNT(*) as count
FROM assignments a
LEFT JOIN weeks w ON w.id = a.week_id
WHERE w.id IS NULL
UNION ALL
SELECT 'MISSING_DATA_CHECK', 'lessons_without_weeks', COUNT(*)
FROM lessons l
LEFT JOIN weeks w ON w.id = l.week_id
WHERE w.id IS NULL
UNION ALL
SELECT 'MISSING_DATA_CHECK', 'weeks_without_tracks', COUNT(*)
FROM weeks w
LEFT JOIN tracks t ON t.id = w.track_id
WHERE t.id IS NULL
UNION ALL
SELECT 'MISSING_DATA_CHECK', 'enrollments_without_profiles', COUNT(*)
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
WHERE p.id IS NULL
UNION ALL
SELECT 'MISSING_DATA_CHECK', 'submissions_without_students', COUNT(*)
FROM task_submissions ts
LEFT JOIN profiles p ON p.id = ts.student_id
WHERE p.id IS NULL
UNION ALL
SELECT 'MISSING_DATA_CHECK', 'submissions_without_assignments', COUNT(*)
FROM task_submissions ts
LEFT JOIN assignments a ON a.id = ts.assignment_id
WHERE a.id IS NULL;

-- Check 12: Performance Issues
SELECT 'PERFORMANCE_CHECK' as check_type,
       'large_tables' as metric,
       schemaname,
       tablename,
       n_tup_ins as inserts,
       n_tup_upd as updates,
       n_tup_del as deletes,
       n_live_tup as live_rows,
       n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND n_live_tup > 1000
ORDER BY n_live_tup DESC;

-- Check 13: Index Usage
SELECT 'INDEX_USAGE' as check_type,
       schemaname,
       tablename,
       indexname,
       idx_tup_read,
       idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_tup_read > 0
ORDER BY idx_tup_read DESC;

-- Check 14: Critical System Functions Test
SELECT 'FUNCTION_TEST' as check_type, 'is_admin_function' as test_name,
       CASE 
         WHEN is_admin('00000000-0000-0000-0000-000000000000') IS NOT NULL 
         THEN 'PASS' 
         ELSE 'FAIL' 
       END as result;

-- Summary Report
SELECT 'SUMMARY' as check_type,
       'System Health Check Complete' as message,
       NOW() as checked_at;