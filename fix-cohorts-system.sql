-- Fix cohorts system completely
-- 1. Create cohorts table if it doesn't exist
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Active', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for cohorts
DROP POLICY IF EXISTS "Anyone can view cohorts" ON cohorts;
DROP POLICY IF EXISTS "Authenticated users can view cohorts" ON cohorts;
DROP POLICY IF EXISTS "Admins can manage cohorts" ON cohorts;

CREATE POLICY "Anyone can view cohorts" ON cohorts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view cohorts" ON cohorts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage cohorts" ON cohorts
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create sample cohorts for testing
INSERT INTO cohorts (name, start_date, end_date, status) VALUES
  ('Cohort 1 - January 2024', '2024-01-15', '2024-04-15', 'Active'),
  ('Cohort 2 - March 2024', '2024-03-01', '2024-06-01', 'Active'),
  ('Cohort 3 - May 2024', '2024-05-01', '2024-08-01', 'Upcoming'),
  ('Cohort 4 - July 2024', '2024-07-01', '2024-10-01', 'Upcoming')
ON CONFLICT (id) DO NOTHING;

-- 5. Check results
SELECT 
  id,
  name,
  start_date,
  end_date,
  status,
  created_at
FROM cohorts
ORDER BY start_date;