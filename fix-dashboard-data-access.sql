-- Temporarily disable RLS on key tables to test dashboard data access
-- This is for debugging only - we'll re-enable it after testing

-- Disable RLS temporarily for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts DISABLE ROW LEVEL SECURITY;

-- Test the data that should appear on dashboard
SELECT 'DASHBOARD DATA TEST (RLS DISABLED):' as section;

-- Total students
SELECT 'Total Students:' as metric, COUNT(*) as value FROM student_enrollments;

-- Students by track
SELECT 'Students by Track:' as metric;
SELECT 
  t.name as track,
  COUNT(se.user_id) as count
FROM tracks t
LEFT JOIN student_enrollments se ON se.track_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Pending submissions
SELECT 'Pending Submissions:' as metric, COUNT(*) as value 
FROM task_submissions WHERE status = 'pending';

-- Approved certificates
SELECT 'Approved Certificates:' as metric, COUNT(*) as value 
FROM certificates WHERE is_approved = true;

-- Track metrics from view
SELECT 'Track Metrics:' as metric;
SELECT * FROM admin_dashboard_view;

-- Recent actions
SELECT 'Recent Actions:' as metric;
SELECT * FROM recent_admin_actions LIMIT 5;

SELECT 'TEST COMPLETE - Check if data appears correctly now' as status;