-- Debug task count issue
-- Check if assignments exist and are properly linked to tracks

-- 1. Check all tracks
SELECT 
  id,
  name,
  description
FROM tracks
ORDER BY name;

-- 2. Check all weeks and their track associations
SELECT 
  w.id,
  w.title,
  w.track_id,
  t.name as track_name,
  w.week_number,
  w.order_index
FROM weeks w
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY t.name, w.order_index;

-- 3. Check all assignments and their week/track associations
SELECT 
  a.id,
  a.title,
  a.week_id,
  w.title as week_title,
  w.track_id,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY t.name, w.order_index;

-- 4. Count assignments per track
SELECT 
  t.name as track_name,
  COUNT(a.id) as assignment_count
FROM tracks t
LEFT JOIN weeks w ON w.track_id = t.id
LEFT JOIN assignments a ON a.week_id = w.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- 5. Test the exact query that getAllAssignments() uses
SELECT 
  a.*,
  w.title as week_title,
  w.track_id,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY w.track_id, w.order_index;