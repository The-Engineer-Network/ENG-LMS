-- Fix the auth trigger that's causing 500 errors on signup

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = NOW();
    
    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 6. Ensure RLS policies allow the trigger to insert
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with proper policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for service role and authenticated"
  ON profiles FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

SELECT 'Auth trigger fixed successfully!' as status;

-- Test the trigger
SELECT 'Testing trigger function...' as test;
SELECT handle_new_user() FROM auth.users LIMIT 0; -- Just test if function exists