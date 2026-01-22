-- Create sample data to populate the admin dashboard

-- Insert sample tracks
INSERT INTO tracks (id, name, description, color) VALUES
  (gen_random_uuid(), 'Frontend Development', 'Learn modern frontend technologies including React, TypeScript, and CSS frameworks', '#3B82F6'),
  (gen_random_uuid(), 'Backend Development', 'Master server-side development with Node.js, databases, and APIs', '#10B981'),
  (gen_random_uuid(), 'DevOps Engineering', 'Learn deployment, CI/CD, containerization, and cloud infrastructure', '#F59E0B'),
  (gen_random_uuid(), 'Web3 Development', 'Explore blockchain development, smart contracts, and DeFi applications', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

-- Insert sample cohorts
INSERT INTO cohorts (id, name, description, start_date, end_date, status) VALUES
  (gen_random_uuid(), 'Cohort 2024-Q1', 'First quarter cohort for 2024', '2024-01-15', '2024-04-15', 'Completed'),
  (gen_random_uuid(), 'Cohort 2024-Q2', 'Second quarter cohort for 2024', '2024-04-15', '2024-07-15', 'Completed'),
  (gen_random_uuid(), 'Cohort 2024-Q3', 'Third quarter cohort for 2024', '2024-07-15', '2024-10-15', 'Completed'),
  (gen_random_uuid(), 'Cohort 2025-Q1', 'First quarter cohort for 2025', '2025-01-01', '2025-04-01', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Get track and cohort IDs for sample data
WITH track_ids AS (
  SELECT id, name FROM tracks LIMIT 4
),
cohort_ids AS (
  SELECT id, name FROM cohorts WHERE status = 'Active' LIMIT 1
)

-- Insert sample weeks for each track
INSERT INTO weeks (id, track_id, week_number, title, description, order_index)
SELECT 
  gen_random_uuid(),
  t.id,
  w.week_num,
  'Week ' || w.week_num || ': ' || 
  CASE w.week_num
    WHEN 1 THEN 'Introduction and Setup'
    WHEN 2 THEN 'Core Concepts'
    WHEN 3 THEN 'Intermediate Topics'
    WHEN 4 THEN 'Advanced Techniques'
    WHEN 5 THEN 'Project Work'
    ELSE 'Specialization'
  END,
  'Week ' || w.week_num || ' curriculum for ' || t.name,
  w.week_num
FROM track_ids t
CROSS JOIN (SELECT generate_series(1, 6) as week_num) w
ON CONFLICT (id) DO NOTHING;

-- Insert sample assignments
WITH week_data AS (
  SELECT w.id as week_id, w.week_number, t.name as track_name
  FROM weeks w
  JOIN tracks t ON w.track_id = t.id
)
INSERT INTO assignments (id, week_id, title, requirements, submission_guidelines, deadline)
SELECT 
  gen_random_uuid(),
  wd.week_id,
  'Week ' || wd.week_number || ' Assignment: ' || wd.track_name,
  'Complete the practical exercises and build a project demonstrating the concepts learned this week.',
  'Submit your code via GitHub repository link and include a demo URL if applicable.',
  CURRENT_DATE + INTERVAL '7 days'
FROM week_data wd
ON CONFLICT (id) DO NOTHING;

-- Create some sample student enrollments (using existing users)
WITH existing_users AS (
  SELECT id, email FROM auth.users WHERE email NOT LIKE '%admin%' LIMIT 3
),
track_cohort_data AS (
  SELECT 
    t.id as track_id,
    c.id as cohort_id
  FROM tracks t
  CROSS JOIN cohorts c
  WHERE c.status = 'Active'
  LIMIT 4
)
INSERT INTO student_enrollments (id, user_id, track_id, cohort_id, progress_percentage, tasks_completed, total_tasks)
SELECT 
  gen_random_uuid(),
  u.id,
  tcd.track_id,
  tcd.cohort_id,
  FLOOR(RANDOM() * 80 + 20)::INTEGER, -- Random progress between 20-100%
  FLOOR(RANDOM() * 15 + 5)::INTEGER,   -- Random completed tasks 5-20
  20
FROM existing_users u
CROSS JOIN track_cohort_data tcd
ON CONFLICT (id) DO NOTHING;

-- Create some sample task submissions
WITH enrollment_data AS (
  SELECT 
    se.user_id,
    a.id as assignment_id,
    se.track_id
  FROM student_enrollments se
  JOIN weeks w ON w.track_id = se.track_id
  JOIN assignments a ON a.week_id = w.id
  LIMIT 20
)
INSERT INTO task_submissions (id, student_id, assignment_id, github_url, demo_url, notes, status, submitted_at, reviewed_at)
SELECT 
  gen_random_uuid(),
  ed.user_id,
  ed.assignment_id,
  'https://github.com/student/week-' || FLOOR(RANDOM() * 6 + 1) || '-project',
  'https://demo-' || FLOOR(RANDOM() * 1000) || '.netlify.app',
  'Completed all requirements and added extra features for better user experience.',
  CASE FLOOR(RANDOM() * 4)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'in_review'
    WHEN 2 THEN 'approved'
    ELSE 'needs_changes'
  END,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
  CASE WHEN RANDOM() > 0.3 THEN NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 20) ELSE NULL END
FROM enrollment_data ed
ON CONFLICT (id) DO NOTHING;

-- Create some certificates
WITH completed_students AS (
  SELECT DISTINCT
    se.user_id,
    se.track_id,
    se.cohort_id,
    se.tasks_completed,
    se.total_tasks
  FROM student_enrollments se
  WHERE se.tasks_completed >= 15 -- Students who completed most tasks
)
INSERT INTO certificates (id, student_id, track_id, cohort_id, is_approved, completion_date, tasks_completed, total_tasks)
SELECT 
  gen_random_uuid(),
  cs.user_id,
  cs.track_id,
  cs.cohort_id,
  RANDOM() > 0.3, -- 70% approved
  CURRENT_DATE - INTERVAL '1 day' * FLOOR(RANDOM() * 60),
  cs.tasks_completed,
  cs.total_tasks
FROM completed_students cs
ON CONFLICT (id) DO NOTHING;

-- Add some entries to whitelist
INSERT INTO paid_learner_whitelist (id, email, track_id, cohort_id, status)
SELECT 
  gen_random_uuid(),
  'student' || generate_series(1, 10) || '@example.com',
  t.id,
  c.id,
  'active'
FROM tracks t
CROSS JOIN cohorts c
WHERE c.status = 'Active'
LIMIT 20
ON CONFLICT (email) DO NOTHING;

SELECT 'SAMPLE DATA CREATED SUCCESSFULLY' as status;

-- Show summary of created data
SELECT 'DATA SUMMARY:' as info;
SELECT 
  (SELECT COUNT(*) FROM tracks) as tracks,
  (SELECT COUNT(*) FROM cohorts) as cohorts,
  (SELECT COUNT(*) FROM weeks) as weeks,
  (SELECT COUNT(*) FROM assignments) as assignments,
  (SELECT COUNT(*) FROM student_enrollments) as enrollments,
  (SELECT COUNT(*) FROM task_submissions) as submissions,
  (SELECT COUNT(*) FROM certificates) as certificates;