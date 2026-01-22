-- Test what data the dashboard should be showing

-- 1. Check the admin_dashboard_view
SELECT 'ADMIN DASHBOARD VIEW DATA:' as section;
SELECT * FROM admin_dashboard_view;

-- 2. Check recent_admin_actions view
SELECT 'RECENT ADMIN ACTIONS:' as section;
SELECT * FROM recent_admin_actions LIMIT 5;

-- 3. Check basic counts that dashboard uses
SELECT 'DASHBOARD COUNTS:' as section;
SELECT 
  (SELECT COUNT(*) FROM student_enrollments) as total_students,
  (SELECT COUNT(*) FROM task_submissions WHERE status = 'pending') as pending_submissions,
  (SELECT COUNT(*) FROM certificates WHERE is_approved = true) as approved_certificates;

-- 4. Check students by track
SELECT 'STUDENTS BY TRACK:' as section;
SELECT 
  t.name as track,
  COUNT(se.user_id) as count
FROM tracks t
LEFT JOIN student_enrollments se ON se.track_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- 5. Check if there are any RLS issues
SELECT 'CURRENT USER CONTEXT:' as section;
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_email;