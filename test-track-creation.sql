-- Test track creation directly in database

-- 1. Check current tracks
SELECT 'CURRENT TRACKS:' as test;
SELECT id, name, description, created_at FROM tracks ORDER BY created_at DESC;

-- 2. Test direct insert (this should work with RLS disabled)
INSERT INTO tracks (name, description) 
VALUES ('Test Track', 'This is a test track to verify database insertion works');

-- 3. Check if the insert worked
SELECT 'AFTER INSERT:' as test;
SELECT id, name, description, created_at FROM tracks ORDER BY created_at DESC LIMIT 3;

-- 4. Clean up test track
DELETE FROM tracks WHERE name = 'Test Track';

SELECT 'TEST COMPLETE - Check if direct database insert worked' as status;