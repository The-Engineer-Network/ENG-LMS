-- Debug weeks loading issue
-- Check if weeks exist and what RLS policies are affecting them

-- 0. Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 1. Check if weeks exist
SELECT 
  w.id,
  w.title,
  w.track_id,
  t.name as track_name,
  w.week_number,
  w.order_index
FROM weeks w
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY w.track_id, w.order_index;

-- 2. Check current user context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 3. Check if user has admin role
SELECT 
  p.id,
  p.email,
  p.role
FROM profiles p
WHERE p.id = auth.uid();

-- 4. Check RLS policies on weeks table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'weeks';

-- 5. Test weeks query with explicit admin check
SELECT 
  w.*,
  t.name as track_name
FROM weeks w
LEFT JOIN tracks t ON w.track_id = t.id
LEFT JOIN profiles p ON p.id = auth.uid()
WHERE p.role = 'admin'
ORDER BY w.track_id, w.order_index;