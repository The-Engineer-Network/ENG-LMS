-- Ensure we have basic tracks and cohorts data for testing

-- Insert basic tracks if they don't exist
INSERT INTO tracks (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Frontend Development', 'Learn modern frontend technologies'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Backend Development', 'Master server-side development'),
  ('550e8400-e29b-41d4-a716-446655440003', 'DevOps Engineering', 'Learn deployment and infrastructure'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Web3 Development', 'Explore blockchain development')
ON CONFLICT (id) DO NOTHING;

-- Insert basic cohorts if they don't exist
INSERT INTO cohorts (id, name, start_date, end_date, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Cohort 2025-Q1', '2025-01-01', '2025-04-01', 'Active'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Cohort 2025-Q2', '2025-04-01', '2025-07-01', 'Upcoming'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Cohort 2024-Q4', '2024-10-01', '2024-12-31', 'Completed'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Cohort 2024-Q3', '2024-07-01', '2024-09-30', 'Completed')
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'TRACKS INSERTED:' as info, COUNT(*) as count FROM tracks;
SELECT 'COHORTS INSERTED:' as info, COUNT(*) as count FROM cohorts;

-- Show the data
SELECT 'AVAILABLE TRACKS:' as info;
SELECT id, name, description FROM tracks ORDER BY name;

SELECT 'AVAILABLE COHORTS:' as info;
SELECT id, name, start_date, end_date, status FROM cohorts ORDER BY start_date DESC;