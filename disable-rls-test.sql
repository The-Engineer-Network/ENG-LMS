-- Temporarily disable RLS completely to test
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Check current lesson count
SELECT COUNT(*) as current_lesson_count FROM lessons;

-- The UI should now be able to create lessons without any RLS restrictions
-- After testing, we'll re-enable RLS with proper policies