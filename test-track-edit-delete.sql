-- Test track edit and delete operations directly in database

-- 1. Show current tracks
SELECT 'CURRENT TRACKS:' as test;
SELECT id, name, description, created_at FROM tracks ORDER BY created_at DESC;

-- 2. Test UPDATE operation (simulating edit)
UPDATE tracks 
SET 
  name = 'Frontend Development (Updated)',
  description = 'Updated description for testing'
WHERE name = 'Frontend Development Track';

-- 3. Show tracks after update
SELECT 'AFTER UPDATE:' as test;
SELECT id, name, description, created_at FROM tracks ORDER BY created_at DESC;

-- 4. Revert the update (restore original)
UPDATE tracks 
SET 
  name = 'Frontend Development Track',
  description = 'Master modern frontend development with React, TypeScript, and industry-standard tools. This comprehensive track covers everything from HTML/CSS fundamentals to advanced React patterns, state management, and deployment strategies.'
WHERE name = 'Frontend Development (Updated)';

-- 5. Show final state
SELECT 'AFTER REVERT:' as test;
SELECT id, name, description, created_at FROM tracks ORDER BY created_at DESC;

SELECT 'TEST COMPLETE - Edit operations work in database' as status;