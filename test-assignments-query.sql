-- Test the assignments query that getAllAssignments() should be using
-- This should match what the fixed function does

SELECT 
  a.*,
  w.title as week_title,
  w.track_id,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY a.created_at DESC;

-- Also test a simple count per track
SELECT 
  t.name as track_name,
  COUNT(a.id) as assignment_count
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN assignments a ON a.week_id = w.id
GROUP BY t.id, t.name
ORDER BY t.name;