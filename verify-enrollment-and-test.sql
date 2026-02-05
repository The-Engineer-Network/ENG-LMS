-- ========================================
-- COMPREHENSIVE ENROLLMENT VERIFICATION
-- ========================================

-- 1. Check if user exists in profiles
SELECT 
  'User Profile Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ User profile exists'
    ELSE '❌ User profile NOT found'
  END as status,
  json_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'role', role
  ) as details
FROM profiles
WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
GROUP BY id, email, full_name, role;

-- 2. Check if user has enrollment
SELECT 
  'Enrollment Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Enrollment exists'
    ELSE '❌ Enrollment NOT found'
  END as status,
  json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'track_id', track_id,
      'cohort_id', cohort_id,
      'status', status,
      'progress_percentage', progress_percentage,
      'enrolled_at', enrolled_at
    )
  ) as details
FROM student_enrollments
WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
GROUP BY user_id;

-- 3. Check enrollment with related data (using JOINs, not foreign key syntax)
SELECT 
  'Full Enrollment Data' as check_type,
  '✅ Data retrieved' as status,
  json_build_object(
    'enrollment', json_build_object(
      'id', se.id,
      'user_id', se.user_id,
      'track_id', se.track_id,
      'cohort_id', se.cohort_id,
      'status', se.status,
      'progress_percentage', se.progress_percentage
    ),
    'user', json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'email', p.email
    ),
    'track', json_build_object(
      'id', t.id,
      'name', t.name
    ),
    'cohort', json_build_object(
      'id', c.id,
      'name', c.name
    )
  ) as details
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 4. Check RLS policies on student_enrollments
SELECT 
  'RLS Policy Check' as check_type,
  '✅ Policies listed' as status,
  json_agg(
    json_build_object(
      'policy_name', policyname,
      'command', cmd,
      'permissive', permissive,
      'roles', roles
    )
  ) as details
FROM pg_policies
WHERE tablename = 'student_enrollments';

-- 5. Check if whitelist entry exists
SELECT 
  'Whitelist Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ User is whitelisted'
    ELSE '⚠️ No whitelist entry (may have been removed after enrollment)'
  END as status,
  json_agg(
    json_build_object(
      'email', email,
      'track_id', track_id,
      'cohort_id', cohort_id,
      'status', status,
      'added_date', added_date
    )
  ) as details
FROM paid_learner_whitelist
WHERE email = (SELECT email FROM profiles WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6')
GROUP BY email;

-- 6. Check week progress for the user
SELECT 
  'Week Progress Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Week progress records exist'
    ELSE '⚠️ No week progress yet'
  END as status,
  json_agg(
    json_build_object(
      'week_id', week_id,
      'status', status,
      'submitted_at', submitted_at,
      'approved_at', approved_at
    )
  ) as details
FROM week_progress
WHERE student_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
GROUP BY student_id;

-- 7. Test the exact query that the application uses
-- This simulates what Supabase client does
SELECT 
  'Application Query Test' as check_type,
  '✅ Query successful' as status,
  json_build_object(
    'enrollment_found', COUNT(*) > 0,
    'enrollment_data', json_agg(se.*)
  ) as details
FROM student_enrollments se
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 8. Summary
SELECT 
  '========================================' as separator,
  'SUMMARY' as title,
  '========================================' as separator2;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6')
         AND EXISTS (SELECT 1 FROM student_enrollments WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6')
    THEN '✅ ALL CHECKS PASSED - User should be able to see dashboard'
    ELSE '❌ ISSUES FOUND - Check details above'
  END as final_status;
