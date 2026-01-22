-- Setup basic test data for the LMS

-- Insert a test track
INSERT INTO tracks (id, name, description, duration_weeks, color) 
VALUES (
  gen_random_uuid(), 
  'Full Stack Development', 
  'Complete full stack web development program', 
  12, 
  '#3B82F6'
) ON CONFLICT (name) DO NOTHING;

-- Insert a test cohort
INSERT INTO cohorts (id, name, track_id, start_date, end_date, status) 
SELECT 
  gen_random_uuid(), 
  'Cohort 2024-01', 
  t.id, 
  CURRENT_DATE, 
  CURRENT_DATE + INTERVAL '12 weeks', 
  'Active'
FROM tracks t 
WHERE t.name = 'Full Stack Development'
ON CONFLICT (name) DO NOTHING;

-- Add a test email to whitelist (replace with your test email)
INSERT INTO paid_learner_whitelist (email, track_id, cohort_id, status, added_date)
SELECT 
  'test@example.com',  -- Replace with your test email
  t.id,
  c.id,
  'active',
  CURRENT_DATE
FROM tracks t
JOIN cohorts c ON t.id = c.track_id
WHERE t.name = 'Full Stack Development' 
  AND c.name = 'Cohort 2024-01'
ON CONFLICT (email, track_id, cohort_id) DO NOTHING;

-- Verify the setup
SELECT 
  'Setup complete' as status,
  (SELECT COUNT(*) FROM tracks) as tracks_count,
  (SELECT COUNT(*) FROM cohorts) as cohorts_count,
  (SELECT COUNT(*) FROM paid_learner_whitelist) as whitelist_count;