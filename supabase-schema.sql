-- Supabase Database Schema for Learning Management System
-- This schema matches the existing mock data structure exactly

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Storage buckets will be created manually in Supabase dashboard
-- Buckets needed: certificates, chat-files, profile-pictures, task-submissions

-- Profiles table (linked to auth.users, handles both students and admins)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255), -- Added missing email field
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  profile_picture_url TEXT,
  bio TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohorts table
CREATE TABLE cohorts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Upcoming', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weeks table
CREATE TABLE weeks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'text')),
  duration VARCHAR(20),
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  requirements TEXT, -- Changed from JSONB to TEXT to match usage
  submission_guidelines TEXT, -- Added missing field
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student enrollments table
CREATE TABLE student_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 20,
  status VARCHAR(20) DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task submissions table
CREATE TABLE task_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  github_url TEXT,
  demo_url TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'needs_changes')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  feedback TEXT,
  grade VARCHAR(10)
);

-- Task submission files table (for additional file attachments)
CREATE TABLE task_submission_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES task_submissions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Week progress table
CREATE TABLE week_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'pending', 'approved')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, week_id)
);

-- Certificates table
CREATE TABLE certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  certificate_file VARCHAR(255),
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Accountability partners table
CREATE TABLE accountability_partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student1_id, student2_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file', 'image')),
  file_name VARCHAR(255),
  file_size INTEGER,
  image_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clarity call requests table
CREATE TABLE clarity_call_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  preferred_date DATE,
  preferred_time TIME,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'rejected')),
  notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  meeting_link TEXT,
  mentor_notes TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paid learner whitelist table
CREATE TABLE paid_learner_whitelist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  max_students INTEGER DEFAULT 50,
  tasks_per_track INTEGER DEFAULT 20,
  submission_deadline_days INTEGER DEFAULT 7,
  certificate_approval_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_student_enrollments_user_id ON student_enrollments(user_id);
CREATE INDEX idx_student_enrollments_track_id ON student_enrollments(track_id);
CREATE INDEX idx_student_enrollments_cohort_id ON student_enrollments(cohort_id);
CREATE INDEX idx_task_submissions_student_id ON task_submissions(student_id);
CREATE INDEX idx_task_submissions_assignment_id ON task_submissions(assignment_id);
CREATE INDEX idx_task_submissions_status ON task_submissions(status);
CREATE INDEX idx_task_submission_files_submission_id ON task_submission_files(submission_id);
CREATE INDEX idx_week_progress_student_id ON week_progress(student_id);
CREATE INDEX idx_week_progress_week_id ON week_progress(week_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_clarity_call_requests_student_id ON clarity_call_requests(student_id);
CREATE INDEX idx_clarity_call_requests_status ON clarity_call_requests(status);

-- Row Level Security (RLS) Policies
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
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for student enrollments
CREATE POLICY "Students can view their own enrollments" ON student_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" ON student_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for task submissions
CREATE POLICY "Students can view their own submissions" ON task_submissions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions" ON task_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions" ON task_submissions
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all submissions" ON task_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for task submission files
CREATE POLICY "Students can view their own submission files" ON task_submission_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM task_submissions 
      WHERE task_submissions.id = task_submission_files.submission_id 
      AND task_submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own submission files" ON task_submission_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_submissions 
      WHERE task_submissions.id = task_submission_files.submission_id 
      AND task_submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all submission files" ON task_submission_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for week progress
CREATE POLICY "Students can view their own progress" ON week_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all progress" ON week_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for certificates
CREATE POLICY "Students can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all certificates" ON certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for accountability partners
CREATE POLICY "Students can view their own partnerships" ON accountability_partners
  FOR SELECT USING (auth.uid() = student1_id OR auth.uid() = student2_id);

CREATE POLICY "Admins can view all partnerships" ON accountability_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages they sent or received" ON chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages they send" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for clarity call requests
CREATE POLICY "Students can view their own clarity requests" ON clarity_call_requests
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own clarity requests" ON clarity_call_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own clarity requests" ON clarity_call_requests
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all clarity requests" ON clarity_call_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('chat_message', json_build_object(
    'id', NEW.id,
    'sender_id', NEW.sender_id,
    'recipient_id', NEW.recipient_id,
    'content', NEW.content,
    'type', NEW.type,
    'timestamp', NEW.timestamp
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chat_message_notify ON chat_messages;
CREATE TRIGGER chat_message_notify
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created (DUPLICATE - COMMENTED OUT)
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Policies for Supabase Storage buckets

-- Profile Pictures Storage Policies (public bucket)
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Chat Files Storage Policies (private bucket)
CREATE POLICY "Users can view chat files they sent or received" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-files' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1] 
      OR auth.uid()::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Certificates Storage Policies (private bucket)
CREATE POLICY "Students can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all certificates" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates' 
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Task Submissions Storage Policies (private bucket)
CREATE POLICY "Students can view their own submission files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can upload their own submission files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all submission files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-submissions' 
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Additional SQL Updates for Recent Implementations

-- Add missing columns that might be needed for admin functionality
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6'; -- For UI theming
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS cohort_name VARCHAR(255);

-- Add missing RLS policies for admin operations
CREATE POLICY "Admins can manage all tracks" ON tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all cohorts" ON cohorts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all weeks" ON weeks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add public read access for tracks, cohorts, weeks, lessons (needed for student views)
CREATE POLICY "Anyone can view tracks" ON tracks FOR SELECT USING (true);
CREATE POLICY "Anyone can view cohorts" ON cohorts FOR SELECT USING (true);
CREATE POLICY "Anyone can view weeks" ON weeks FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view assignments" ON assignments FOR SELECT USING (true);

-- Function to handle cohort status updates based on dates
CREATE OR REPLACE FUNCTION update_cohort_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on dates
  IF NEW.start_date > CURRENT_DATE THEN
    NEW.status = 'Upcoming';
  ELSIF NEW.end_date < CURRENT_DATE THEN
    NEW.status = 'Completed';
  ELSE
    NEW.status = 'Active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cohort_status_update ON cohorts;
CREATE TRIGGER cohort_status_update
  BEFORE INSERT OR UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_status();

-- Function to auto-generate certificate records when students complete all tasks
CREATE OR REPLACE FUNCTION check_certificate_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if student has completed all tasks in their track
  IF NEW.status = 'approved' THEN
    -- Get student's enrollment info
    WITH student_info AS (
      SELECT se.user_id, se.track_id, se.cohort_id, se.total_tasks
      FROM student_enrollments se
      WHERE se.user_id = NEW.student_id
    ),
    completed_tasks AS (
      SELECT COUNT(*) as completed_count
      FROM task_submissions ts
      JOIN assignments a ON ts.assignment_id = a.id
      JOIN weeks w ON a.week_id = w.id
      JOIN student_info si ON w.track_id = si.track_id
      WHERE ts.student_id = NEW.student_id 
      AND ts.status = 'approved'
    )
    INSERT INTO certificates (student_id, track_id, cohort_id, tasks_completed, total_tasks, completion_date)
    SELECT 
      si.user_id, 
      si.track_id, 
      si.cohort_id,
      ct.completed_count,
      si.total_tasks,
      CURRENT_DATE
    FROM student_info si, completed_tasks ct
    WHERE ct.completed_count >= si.total_tasks
    ON CONFLICT (student_id, track_id) DO UPDATE SET
      tasks_completed = EXCLUDED.tasks_completed,
      completion_date = EXCLUDED.completion_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS certificate_eligibility_check ON task_submissions;
CREATE TRIGGER certificate_eligibility_check
  AFTER UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_certificate_eligibility();

-- Add unique constraint to prevent duplicate certificates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_student_track_certificate' 
        AND table_name = 'certificates'
    ) THEN
        ALTER TABLE certificates ADD CONSTRAINT unique_student_track_certificate 
        UNIQUE (student_id, track_id);
    END IF;
END $$;

-- Function to validate accountability partner assignments
CREATE OR REPLACE FUNCTION validate_accountability_partner()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent self-pairing
  IF NEW.student1_id = NEW.student2_id THEN
    RAISE EXCEPTION 'Students cannot be paired with themselves';
  END IF;
  
  -- Ensure both students are in the same track and cohort
  IF NOT EXISTS (
    SELECT 1 FROM student_enrollments se1
    JOIN student_enrollments se2 ON se1.track_id = se2.track_id AND se1.cohort_id = se2.cohort_id
    WHERE se1.user_id = NEW.student1_id AND se2.user_id = NEW.student2_id
  ) THEN
    RAISE EXCEPTION 'Students must be in the same track and cohort to be paired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_partner_assignment ON accountability_partners;
CREATE TRIGGER validate_partner_assignment
  BEFORE INSERT OR UPDATE ON accountability_partners
  FOR EACH ROW
  EXECUTE FUNCTION validate_accountability_partner();

-- Add indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_status_student ON task_submissions(status, student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_approved ON certificates(is_approved);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_track_cohort ON student_enrollments(track_id, cohort_id);

-- Function to clean up orphaned records (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS void AS $$
BEGIN
  -- Clean up week progress for deleted enrollments
  DELETE FROM week_progress 
  WHERE student_id NOT IN (SELECT user_id FROM student_enrollments);
  
  -- Clean up task submissions for deleted assignments
  DELETE FROM task_submissions 
  WHERE assignment_id NOT IN (SELECT id FROM assignments);
  
  -- Clean up certificates for deleted enrollments
  DELETE FROM certificates 
  WHERE student_id NOT IN (SELECT user_id FROM student_enrollments);
  
  -- Clean up accountability partners for deleted enrollments
  DELETE FROM accountability_partners 
  WHERE student1_id NOT IN (SELECT user_id FROM student_enrollments)
     OR student2_id NOT IN (SELECT user_id FROM student_enrollments);
     
  -- Clean up clarity call requests for deleted students
  DELETE FROM clarity_call_requests 
  WHERE student_id NOT IN (SELECT user_id FROM student_enrollments);
  
  -- Clean up chat messages for deleted users
  DELETE FROM chat_messages 
  WHERE sender_id NOT IN (SELECT id FROM profiles)
     OR recipient_id NOT IN (SELECT id FROM profiles);
END;
$$ LANGUAGE plpgsql;

-- Add a scheduled job to run cleanup (optional - requires pg_cron extension)
-- SELECT cron.schedule('cleanup-orphaned-records', '0 2 * * 0', 'SELECT cleanup_orphaned_records();');

-- Update the handle_new_user function to include email
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update student progress when submissions are approved
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update progress when a submission is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Update week progress
    INSERT INTO week_progress (student_id, week_id, status, approved_at)
    SELECT NEW.student_id, a.week_id, 'approved', NOW()
    FROM assignments a
    WHERE a.id = NEW.assignment_id
    ON CONFLICT (student_id, week_id) 
    DO UPDATE SET 
      status = 'approved',
      approved_at = NOW();
    
    -- Update enrollment progress percentage
    UPDATE student_enrollments 
    SET 
      tasks_completed = (
        SELECT COUNT(*)
        FROM task_submissions ts
        JOIN assignments a ON ts.assignment_id = a.id
        JOIN weeks w ON a.week_id = w.id
        WHERE ts.student_id = NEW.student_id 
        AND ts.status = 'approved'
        AND w.track_id = student_enrollments.track_id
      ),
      progress_percentage = LEAST(100, (
        SELECT COUNT(*) * 100 / NULLIF(
          (SELECT COUNT(*) FROM assignments a2 
           JOIN weeks w2 ON a2.week_id = w2.id 
           WHERE w2.track_id = student_enrollments.track_id), 0)
        FROM task_submissions ts
        JOIN assignments a ON ts.assignment_id = a.id
        JOIN weeks w ON a.week_id = w.id
        WHERE ts.student_id = NEW.student_id 
        AND ts.status = 'approved'
        AND w.track_id = student_enrollments.track_id
      ))
    WHERE user_id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_submission_progress_update ON task_submissions;
CREATE TRIGGER task_submission_progress_update
  AFTER INSERT OR UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_student_progress();

-- Function to automatically update week progress when submissions are made
CREATE OR REPLACE FUNCTION update_week_progress_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Update week progress to pending when a submission is made
  INSERT INTO week_progress (student_id, week_id, status, submitted_at)
  SELECT NEW.student_id, a.week_id, 'pending', NEW.submitted_at
  FROM assignments a
  WHERE a.id = NEW.assignment_id
  ON CONFLICT (student_id, week_id) 
  DO UPDATE SET 
    status = CASE 
      WHEN week_progress.status = 'locked' THEN 'pending'
      ELSE week_progress.status
    END,
    submitted_at = COALESCE(week_progress.submitted_at, NEW.submitted_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS week_progress_on_submission ON task_submissions;
CREATE TRIGGER week_progress_on_submission
  AFTER INSERT ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_week_progress_on_submission();

-- Function to initialize week progress for new enrollments
CREATE OR REPLACE FUNCTION initialize_week_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Create locked week progress entries for all weeks in the track
  INSERT INTO week_progress (student_id, week_id, status)
  SELECT NEW.user_id, w.id, 
    CASE 
      WHEN w.order_index = 1 THEN 'pending'  -- First week is unlocked
      ELSE 'locked' 
    END
  FROM weeks w
  WHERE w.track_id = NEW.track_id
  ON CONFLICT (student_id, week_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS initialize_student_week_progress ON student_enrollments;
CREATE TRIGGER initialize_student_week_progress
  AFTER INSERT ON student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION initialize_week_progress();

-- Add missing indexes for better performance on new queries
CREATE INDEX IF NOT EXISTS idx_assignments_week_id ON assignments(week_id);
CREATE INDEX IF NOT EXISTS idx_weeks_track_id ON weeks(track_id);
CREATE INDEX IF NOT EXISTS idx_weeks_order_index ON weeks(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_week_id ON lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);

-- Add email index for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_assignment ON task_submissions(student_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_week_progress_student_week ON week_progress(student_id, week_id);