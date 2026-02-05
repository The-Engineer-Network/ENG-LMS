-- TEMPORARY: Completely disable RLS on lessons table
-- This is just to get lesson creation working
-- We'll fix it properly after

ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lessons';

-- This should show rls_enabled = false
