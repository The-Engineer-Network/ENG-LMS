-- ========================================
-- RE-ENABLE RLS ON LESSONS
-- (Run this after testing)
-- ========================================

-- Re-enable RLS on lessons table
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS re-enabled on lessons table' as result;
SELECT 'Lessons table is now secure again' as status;
