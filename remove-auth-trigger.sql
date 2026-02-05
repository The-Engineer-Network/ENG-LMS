-- Remove the auth trigger that's causing 500 errors
-- We'll rely on application code to create profiles instead

-- 1. Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Ensure profiles table has proper RLS policies for inserts
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role and authenticated" ON profiles;

-- Create policy that allows inserts from service role (used by our app)
CREATE POLICY "Enable insert for service role"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow reading profiles
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

SELECT 'Auth trigger removed - application will handle profile creation' as status;
SELECT 'Signup should now work without 500 errors' as message;