-- Create the admin dashboard view that the getAdminDashboardData function expects

CREATE OR REPLACE VIEW admin_dashboard_view AS
SELECT 
  t.name as track_name,
  t.id as track_id,
  COUNT(DISTINCT se.user_id) as total_students,
  COUNT(DISTINCT a.id) as total_assignments,
  COUNT(DISTINCT CASE WHEN ts.status = 'approved' THEN ts.id END) as approved_submissions,
  COUNT(DISTINCT ts.id) as total_submissions,
  CASE 
    WHEN COUNT(DISTINCT ts.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN ts.status = 'approved' THEN ts.id END)::FLOAT / COUNT(DISTINCT ts.id)) * 100)
    ELSE 0 
  END as approval_rate,
  CASE 
    WHEN COUNT(DISTINCT a.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN ts.status = 'approved' THEN ts.id END)::FLOAT / COUNT(DISTINCT a.id)) * 100)
    ELSE 0 
  END as completion_rate
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN assignments a ON a.week_id = w.id
LEFT JOIN student_enrollments se ON se.track_id = t.id
LEFT JOIN task_submissions ts ON ts.assignment_id = a.id AND ts.student_id = se.user_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Create a view for recent admin actions
CREATE OR REPLACE VIEW recent_admin_actions AS
SELECT 
  'Approved Certificate' as action_type,
  p.full_name as student_name,
  c.approved_at as action_time,
  'certificate' as action_category
FROM certificates c
JOIN profiles p ON p.id = c.student_id
WHERE c.is_approved = true AND c.approved_at IS NOT NULL

UNION ALL

SELECT 
  'Reviewed Submission' as action_type,
  p.full_name as student_name,
  ts.reviewed_at as action_time,
  'submission' as action_category
FROM task_submissions ts
JOIN profiles p ON p.id = ts.student_id
WHERE ts.reviewed_at IS NOT NULL

UNION ALL

SELECT 
  'Assigned Partner' as action_type,
  p.full_name as student_name,
  ap.created_at as action_time,
  'partnership' as action_category
FROM accountability_partners ap
JOIN profiles p ON p.id = ap.student1_id

ORDER BY action_time DESC
LIMIT 10;

SELECT 'ADMIN DASHBOARD VIEWS CREATED SUCCESSFULLY' as status;