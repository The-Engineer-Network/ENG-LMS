-- Create a trigger to automatically create a profile when a user signs up
-- This ensures the automatic enrollment trigger fires

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

SELECT 'Auth profile trigger created successfully' as status;