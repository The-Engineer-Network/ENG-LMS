-- Create RLS policies and indexes for the tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarity_call_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow trigger profile creation" ON profiles;
CREATE POLICY "Allow trigger profile creation" ON profiles
  FOR INSERT WITH CHECK (true);

-- RLS Policies for student enrollments
DROP POLICY IF EXISTS "Students can view their own enrollments" ON student_enrollments;
CREATE POLICY "Students can view their own enrollments" ON student_enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all enrollments" ON student_enrollments;
CREATE POLICY "Admins can view all enrollments" ON student_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for task submissions
DROP POLICY IF EXISTS "Students can view their own submissions" ON task_submissions;
CREATE POLICY "Students can view their own submissions" ON task_submissions
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert their own submissions" ON task_submissions;
CREATE POLICY "Students can insert their own submissions" ON task_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their own submissions" ON task_submissions;
CREATE POLICY "Students can update their own submissions" ON task_submissions
  FOR UPDATE USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can view all submissions" ON task_submissions;
CREATE POLICY "Admins can view all submissions" ON task_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add public read access for basic tables
DROP POLICY IF EXISTS "Anyone can view tracks" ON tracks;
CREATE POLICY "Anyone can view tracks" ON tracks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view cohorts" ON cohorts;
CREATE POLICY "Anyone can view cohorts" ON cohorts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view weeks" ON weeks;
CREATE POLICY "Anyone can view weeks" ON weeks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view assignments" ON assignments;
CREATE POLICY "Anyone can view assignments" ON assignments FOR SELECT USING (true);

-- Admin policies for management
DROP POLICY IF EXISTS "Admins can manage all tracks" ON tracks;
CREATE POLICY "Admins can manage all tracks" ON tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all cohorts" ON cohorts;
CREATE POLICY "Admins can manage all cohorts" ON cohorts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage whitelist" ON paid_learner_whitelist;
CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_user_id ON student_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_track_id ON student_enrollments(track_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_cohort_id ON student_enrollments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_id ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_assignment_id ON task_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_week_progress_student_id ON week_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_week_progress_week_id ON week_progress(week_id);
CREATE INDEX IF NOT EXISTS idx_assignments_week_id ON assignments(week_id);
CREATE INDEX IF NOT EXISTS idx_weeks_track_id ON weeks(track_id);

SELECT 'RLS POLICIES AND INDEXES CREATED SUCCESSFULLY' as status;