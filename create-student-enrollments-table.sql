-- Create student_enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 20,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_enrollments
DROP POLICY IF EXISTS "Anyone can view student_enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can view student_enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can manage student_enrollments" ON student_enrollments;

CREATE POLICY "Anyone can view student_enrollments" ON student_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view student_enrollments" ON student_enrollments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage student_enrollments" ON student_enrollments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create some sample enrollments for testing
INSERT INTO student_enrollments (user_id, track_id, cohort_id, progress_percentage, tasks_completed)
SELECT 
  p.id,
  t.id,
  c.id,
  FLOOR(RANDOM() * 100),
  FLOOR(RANDOM() * 20)
FROM profiles p
CROSS JOIN tracks t
CROSS JOIN cohorts c
WHERE p.role = 'student'
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- Check results
SELECT 
  se.id,
  p.full_name as student_name,
  p.email,
  t.name as track_name,
  c.name as cohort_name,
  se.progress_percentage,
  se.tasks_completed
FROM student_enrollments se
LEFT JOIN profiles p ON se.user_id = p.id
LEFT JOIN tracks t ON se.track_id = t.id
LEFT JOIN cohorts c ON se.cohort_id = c.id
ORDER BY se.enrolled_at DESC;