-- Create a test admin user directly in the database
-- Note: This creates the profile, but you still need to create the auth user in Supabase Dashboard

-- Check if test admin already exists
SELECT 'CHECKING FOR TEST ADMIN:' as status;
SELECT * FROM auth.users WHERE email = 'admin@test.com';

-- If you create a user with email 'admin@test.com' in Supabase Auth Dashboard,
-- the trigger will automatically create an admin profile because the email contains 'admin'

-- You can also manually create a profile for any auth user:
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('USER_ID_FROM_SUPABASE_AUTH', 'admin@test.com', 'Test Admin', 'admin');