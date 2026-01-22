-- Test the is_admin() function and weeks access
SELECT 
  auth.uid() as current_user,
  is_admin() as is_admin_result;

-- Test simple weeks query
SELECT id, title, track_id, week_number FROM weeks LIMIT 5;

-- Test weeks with tracks join (like getAllWeeks does)
SELECT 
  w.id,
  w.title,
  w.track_id,
  t.name as track_name
FROM weeks w
LEFT JOIN tracks t ON w.track_id = t.id
LIMIT 5;