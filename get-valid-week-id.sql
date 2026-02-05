-- Get valid week IDs from your database
SELECT 
  id,
  week_number,
  title,
  track_id
FROM weeks
ORDER BY week_number
LIMIT 5;
