-- ========================================
-- TEMPORARILY DISABLE RLS ON LESSONS
-- (For testing only - we'll re-enable after)
-- ========================================

-- Disable RLS on lessons table
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS disabled on lessons table' as result;
SELECT 'Try adding a lesson now - it should work immediately' as instruction;
SELECT 'After it works, run the re-enable script' as reminder;
