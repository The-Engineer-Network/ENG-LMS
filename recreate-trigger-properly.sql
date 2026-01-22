-- Recreate the trigger properly to fix the issue

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_admin_profile_creation ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_admin_login();

-- 2. Create a robust function with proper error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user: % with email: %', NEW.id, NEW.email;
  
  -- Check if profile already exists to avoid duplicates
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Insert the profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.user_metadata->>'full_name',
        split_part(NEW.email, '@', 1)
      ),
      CASE 
        WHEN NEW.email LIKE '%admin%' THEN 'admin'
        ELSE 'student'
      END
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
  ELSE
    RAISE LOG 'Profile already exists for user: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verify the trigger was created
SELECT 'TRIGGER CREATED' as status;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 6. Add a policy to allow the trigger to insert profiles
DROP POLICY IF EXISTS "Allow trigger profile creation" ON profiles;
CREATE POLICY "Allow trigger profile creation" ON profiles
  FOR INSERT 
  WITH CHECK (true);

SELECT 'SETUP COMPLETE' as status;