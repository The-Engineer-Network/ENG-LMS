-- Remove all sample data and reset database to clean state

-- Delete all sample data in reverse dependency order
DELETE FROM task_submission_files;
DELETE FROM task_submissions;
DELETE FROM certificates;
DELETE FROM week_progress;
DELETE FROM accountability_partners;
DELETE FROM chat_messages;
DELETE FROM clarity_call_requests;
DELETE FROM student_enrollments;
DELETE FROM paid_learner_whitelist WHERE email LIKE '%@example.com';
DELETE FROM admin_settings;
DELETE FROM assignments;
DELETE FROM lessons;
DELETE FROM weeks;
DELETE FROM cohorts;
DELETE FROM tracks;

-- Keep only real user profiles (not sample ones)
-- This will keep your admin users but remove any sample profiles

-- Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 'CLEANUP COMPLETE - Database is now clean' as status;

-- Show what's left (should be minimal)
SELECT 
  (SELECT COUNT(*) FROM tracks) as tracks,
  (SELECT COUNT(*) FROM cohorts) as cohorts,
  (SELECT COUNT(*) FROM student_enrollments) as enrollments,
  (SELECT COUNT(*) FROM task_submissions) as submissions,
  (SELECT COUNT(*) FROM certificates) as certificates,
  (SELECT COUNT(*) FROM profiles) as profiles;