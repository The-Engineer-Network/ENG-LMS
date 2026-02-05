-- Check all assignments in the database
SELECT 
  a.id,
  a.title,
  a.week_id,
  a.requirements,
  a.submission_guidelines,
  a.deadline,
  w.week_number,
  w.title as week_title,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY w.week_number, a.id;
