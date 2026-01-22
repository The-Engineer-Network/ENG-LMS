-- Test manual update of the existing assignment
-- Using the actual ID from the database

-- 1. Show current state
SELECT 
  id,
  title,
  requirements,
  submission_guidelines,
  created_at
FROM assignments
WHERE id = '9b844790-a206-4c39-8a48-1f819d26377d';

-- 2. Test update
UPDATE assignments 
SET 
  title = 'UPDATED BUILD TOTK',
  requirements = 'UPDATED REQUIREMENTS TEST',
  submission_guidelines = 'UPDATED GUIDELINES TEST'
WHERE id = '9b844790-a206-4c39-8a48-1f819d26377d';

-- 3. Verify the update worked
SELECT 
  id,
  title,
  requirements,
  submission_guidelines,
  created_at
FROM assignments
WHERE id = '9b844790-a206-4c39-8a48-1f819d26377d';

-- 4. Also check if it shows up in the full query that the app uses
SELECT 
  a.*,
  w.title as week_title,
  w.track_id,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
WHERE a.id = '9b844790-a206-4c39-8a48-1f819d26377d';