-- COMPREHENSIVE SQL UPDATES FOR ADMIN & STUDENT DASHBOARDS
-- Run these commands in your Supabase SQL editor after the main schema

-- ============================================================================
-- 1. MISSING COLUMNS AND CONSTRAINTS
-- ============================================================================

-- Add missing columns for enhanced functionality
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS cohort_name VARCHAR(255);

-- Add unique constraints to prevent data inconsistencies
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

-- Add check constraints for data integrity
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_status' 
        AND table_name = 'task_submissions'
    ) THEN
        ALTER TABLE task_submissions ADD CONSTRAINT valid_status 
        CHECK (status IN ('pending', 'in_review', 'approved', 'needs_changes'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_progress_status' 
        AND table_name = 'week_progress'
    ) THEN
        ALTER TABLE week_progress ADD CONSTRAINT valid_progress_status 
        CHECK (status IN ('locked', 'pending', 'approved'));
    END IF;
END $$;

-- ============================================================================
-- 2. MISSING RLS POLICIES FOR ADMIN OPERATIONS
-- ============================================================================

-- Admin policies for all management tables
DROP POLICY IF EXISTS "Admins can manage all tracks" ON tracks;
CREATE POLICY "Admins can manage all tracks" ON tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all cohorts" ON cohorts;
CREATE POLICY "Admins can manage all cohorts" ON cohorts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all weeks" ON weeks;
CREATE POLICY "Admins can manage all weeks" ON weeks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all assignments" ON assignments;
CREATE POLICY "Admins can manage all assignments" ON assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage whitelist" ON paid_learner_whitelist;
CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public read access for basic data (needed for student views)
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

-- ============================================================================
-- 3. ENHANCED DASHBOARD FUNCTIONS
-- ============================================================================

-- Function to get comprehensive admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_students', (SELECT COUNT(*) FROM student_enrollments),
    'pending_submissions', (SELECT COUNT(*) FROM task_submissions WHERE status = 'pending'),
    'approved_certificates', (SELECT COUNT(*) FROM certificates WHERE is_approved = true),
    'active_cohorts', (SELECT COUNT(*) FROM cohorts WHERE status = 'Active'),
    'total_tracks', (SELECT COUNT(*) FROM tracks),
    'needs_correction', (SELECT COUNT(*) FROM task_submissions WHERE status = 'needs_changes'),
    'completion_rate', (
      SELECT ROUND(
        COUNT(CASE WHEN ts.status = 'approved' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 2
      )
      FROM task_submissions ts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get track-specific metrics for admin dashboard
CREATE OR REPLACE FUNCTION get_track_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'track', t.name,
      'students', COALESCE(student_counts.count, 0),
      'completion_rate', COALESCE(completion_rates.rate, 0),
      'total_assignments', COALESCE(assignment_counts.count, 0),
      'approved_submissions', COALESCE(approved_counts.count, 0)
    )
  ) INTO result
  FROM tracks t
  LEFT JOIN (
    SELECT track_id, COUNT(*) as count
    FROM student_enrollments
    GROUP BY track_id
  ) student_counts ON t.id = student_counts.track_id
  LEFT JOIN (
    SELECT w.track_id, COUNT(*) as count
    FROM assignments a
    JOIN weeks w ON a.week_id = w.id
    GROUP BY w.track_id
  ) assignment_counts ON t.id = assignment_counts.track_id
  LEFT JOIN (
    SELECT w.track_id, COUNT(*) as count
    FROM task_submissions ts
    JOIN assignments a ON ts.assignment_id = a.id
    JOIN weeks w ON a.week_id = w.id
    WHERE ts.status = 'approved'
    GROUP BY w.track_id
  ) approved_counts ON t.id = approved_counts.track_id
  LEFT JOIN (
    SELECT 
      w.track_id,
      ROUND(
        COUNT(CASE WHEN ts.status = 'approved' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 2
      ) as rate
    FROM task_submissions ts
    JOIN assignments a ON ts.assignment_id = a.id
    JOIN weeks w ON a.week_id = w.id
    GROUP BY w.track_id
  ) completion_rates ON t.id = completion_rates.track_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student progress with needs correction count
CREATE OR REPLACE FUNCTION get_student_progress_detailed(student_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  enrollment_record RECORD;
BEGIN
  -- Get student enrollment
  SELECT se.*, p.full_name, t.name as track_name, c.name as cohort_name
  INTO enrollment_record
  FROM student_enrollments se
  JOIN profiles p ON se.user_id = p.id
  JOIN tracks t ON se.track_id = t.id
  JOIN cohorts c ON se.cohort_id = c.id
  WHERE se.user_id = student_uuid;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  SELECT json_build_object(
    'student', json_build_object(
      'name', enrollment_record.full_name,
      'track', enrollment_record.track_name,
      'cohort', enrollment_record.cohort_name,
      'progress', COALESCE(enrollment_record.progress_percentage, 0),
      'weekCount', (
        SELECT COUNT(*) FROM weeks WHERE track_id = enrollment_record.track_id
      ),
      'completedWeeks', (
        SELECT COUNT(*) FROM week_progress 
        WHERE student_id = student_uuid AND status = 'approved'
      ),
      'submissions', json_build_object(
        'approved', (
          SELECT COUNT(*) FROM week_progress 
          WHERE student_id = student_uuid AND status = 'approved'
        ),
        'pending', (
          SELECT COUNT(*) FROM week_progress 
          WHERE student_id = student_uuid AND status = 'pending'
        ),
        'needsCorrection', (
          SELECT COUNT(*) FROM task_submissions ts
          JOIN assignments a ON ts.assignment_id = a.id
          JOIN weeks w ON a.week_id = w.id
          WHERE ts.student_id = student_uuid 
          AND ts.status = 'needs_changes'
          AND w.track_id = enrollment_record.track_id
        )
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. AUTOMATED TRIGGERS FOR DATA CONSISTENCY
-- ============================================================================

-- Function to auto-update cohort status based on dates
CREATE OR REPLACE FUNCTION update_cohort_status()
RETURNS TRIGGER AS $$
BEGIN
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

-- ============================================================================
-- 5. PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================================

-- Indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_status_student ON task_submissions(status, student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_approved ON certificates(is_approved);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_track_cohort ON student_enrollments(track_id, cohort_id);
CREATE INDEX IF NOT EXISTS idx_week_progress_status ON week_progress(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_needs_changes ON task_submissions(status) WHERE status = 'needs_changes';

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_assignments_week_track ON assignments(week_id) INCLUDE (id);
CREATE INDEX IF NOT EXISTS idx_weeks_track_order ON weeks(track_id, order_index);
CREATE INDEX IF NOT EXISTS idx_submissions_student_status ON task_submissions(student_id, status);

-- ============================================================================
-- ============================================================================
-- 7. STORAGE POLICIES FOR FILE MANAGEMENT
-- ============================================================================

-- Enhanced storage policies for admin file management
DROP POLICY IF EXISTS "Admins can manage all task submission files" ON storage.objects;
CREATE POLICY "Admins can manage all task submission files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'task-submissions' 
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Students can update their own submission files" ON storage.objects;
CREATE POLICY "Students can update their own submission files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'task-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Students can delete their own submission files" ON storage.objects;
CREATE POLICY "Students can delete their own submission files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 8. GRANT PERMISSIONS FOR NEW FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_track_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_progress_detailed(UUID) TO authenticated;

-- ============================================================================
-- 9. CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean up orphaned records
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION cleanup_orphaned_records() TO authenticated;

-- ============================================================================
-- 11. ENHANCED ADMIN AUTHENTICATION SUPPORT
-- ============================================================================

-- Function to handle admin profile creation for manually added users
CREATE OR REPLACE FUNCTION handle_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Check if user should be admin (based on email)
    IF NEW.email LIKE '%admin%' THEN
      INSERT INTO profiles (id, email, full_name, role)
      VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.email, 'Admin User'),
        'admin'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin profile creation on login
DROP TRIGGER IF EXISTS handle_admin_profile_creation ON auth.users;
CREATE TRIGGER handle_admin_profile_creation
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_login();

-- ============================================================================
-- 12. WHITELIST VALIDATION FUNCTIONS
-- ============================================================================

-- Function to check if email is whitelisted for specific track/cohort
CREATE OR REPLACE FUNCTION is_email_whitelisted(
  user_email TEXT,
  track_uuid UUID,
  cohort_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM paid_learner_whitelist
    WHERE email = user_email
    AND track_id = track_uuid
    AND cohort_id = cohort_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get whitelist entry details
CREATE OR REPLACE FUNCTION get_whitelist_entry(
  user_email TEXT,
  track_uuid UUID,
  cohort_uuid UUID
)
RETURNS JSON AS $$
DECLARE
  entry_data JSON;
BEGIN
  SELECT json_build_object(
    'id', w.id,
    'email', w.email,
    'track', t.name,
    'cohort', c.name,
    'status', w.status,
    'added_date', w.added_date
  ) INTO entry_data
  FROM paid_learner_whitelist w
  JOIN tracks t ON w.track_id = t.id
  JOIN cohorts c ON w.cohort_id = c.id
  WHERE w.email = user_email
  AND w.track_id = track_uuid
  AND w.cohort_id = cohort_uuid;
  
  RETURN entry_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for whitelist functions
GRANT EXECUTE ON FUNCTION is_email_whitelisted(TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_whitelist_entry(TEXT, UUID, UUID) TO authenticated;

-- ============================================================================
-- 13. FINAL VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name_var TEXT;
BEGIN
    -- Check for required tables
    FOR table_name_var IN 
        SELECT unnest(ARRAY[
            'profiles', 'tracks', 'cohorts', 'weeks', 'lessons', 'assignments',
            'student_enrollments', 'task_submissions', 'task_submission_files',
            'week_progress', 'certificates', 'accountability_partners',
            'chat_messages', 'clarity_call_requests', 'paid_learner_whitelist',
            'admin_settings'
        ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name_var
        ) THEN
            missing_tables := array_append(missing_tables, table_name_var);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist ✓';
    END IF;
END $$;

-- =============================================
-- ENHANCED FEATURES SQL UPDATES
-- =============================================

-- Student Achievements Table
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draft Submissions Table (for auto-save functionality)
CREATE TABLE IF NOT EXISTS draft_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    github_url TEXT,
    demo_url TEXT,
    notes TEXT,
    files JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

-- File Uploads Table
CREATE TABLE IF NOT EXISTS submission_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES task_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Analytics View (Enhanced)
CREATE OR REPLACE VIEW admin_analytics_view AS
SELECT 
    t.name as track_name,
    COUNT(DISTINCT se.user_id) as total_students,
    COUNT(ts.id) as total_submissions,
    COUNT(CASE WHEN ts.status = 'approved' THEN 1 END) as approved_submissions,
    COUNT(CASE WHEN ts.status = 'pending' THEN 1 END) as pending_submissions,
    COUNT(CASE WHEN ts.status = 'needs_changes' THEN 1 END) as needs_changes_submissions,
    ROUND(
        (COUNT(CASE WHEN ts.status = 'approved' THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(ts.id), 0)) * 100, 2
    ) as approval_rate,
    COUNT(CASE WHEN ts.submitted_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_submissions
FROM tracks t
LEFT JOIN student_enrollments se ON t.id = se.track_id
LEFT JOIN weeks w ON t.id = w.track_id
LEFT JOIN assignments a ON w.id = a.week_id
LEFT JOIN task_submissions ts ON a.id = ts.assignment_id AND se.user_id = ts.student_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Student Progress Analytics Function
CREATE OR REPLACE FUNCTION calculate_student_progress(student_uuid UUID)
RETURNS TABLE (
    total_assignments INTEGER,
    completed_assignments INTEGER,
    progress_percentage INTEGER,
    current_streak INTEGER,
    achievements_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH student_data AS (
        SELECT se.track_id, se.user_id
        FROM student_enrollments se
        WHERE se.user_id = student_uuid
    ),
    assignment_stats AS (
        SELECT 
            COUNT(a.id) as total,
            COUNT(CASE WHEN ts.status = 'approved' THEN 1 END) as completed
        FROM student_data sd
        JOIN weeks w ON sd.track_id = w.track_id
        JOIN assignments a ON w.id = a.week_id
        LEFT JOIN task_submissions ts ON a.id = ts.assignment_id AND ts.student_id = sd.user_id
    ),
    streak_calc AS (
        SELECT COUNT(*) as streak
        FROM (
            SELECT ts.assignment_id, ts.status,
                   ROW_NUMBER() OVER (ORDER BY ts.submitted_at DESC) as rn
            FROM student_data sd
            JOIN weeks w ON sd.track_id = w.track_id
            JOIN assignments a ON w.id = a.week_id
            JOIN task_submissions ts ON a.id = ts.assignment_id AND ts.student_id = sd.user_id
            WHERE ts.status = 'approved'
            ORDER BY ts.submitted_at DESC
        ) recent_approved
        WHERE rn <= (
            SELECT COUNT(*)
            FROM (
                SELECT 1
                FROM student_data sd2
                JOIN weeks w2 ON sd2.track_id = w2.track_id
                JOIN assignments a2 ON w2.id = a2.week_id
                JOIN task_submissions ts2 ON a2.id = ts2.assignment_id AND ts2.student_id = sd2.user_id
                WHERE ts2.status = 'approved'
                ORDER BY ts2.submitted_at DESC
                LIMIT 100
            ) x
        )
    ),
    achievements_count AS (
        SELECT COUNT(*) as count
        FROM student_achievements sa
        WHERE sa.student_id = student_uuid
    )
    SELECT 
        ast.total::INTEGER,
        ast.completed::INTEGER,
        CASE 
            WHEN ast.total > 0 THEN ROUND((ast.completed::NUMERIC / ast.total) * 100)::INTEGER
            ELSE 0
        END,
        COALESCE(sc.streak, 0)::INTEGER,
        ac.count::INTEGER
    FROM assignment_stats ast
    CROSS JOIN streak_calc sc
    CROSS JOIN achievements_count ac;
END;
$$ LANGUAGE plpgsql;

-- Notification Triggers
CREATE OR REPLACE FUNCTION create_submission_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification when submission status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.student_id,
            'submission_feedback',
            'Submission Status Updated',
            CASE 
                WHEN NEW.status = 'approved' THEN 'Your submission has been approved! Great work!'
                WHEN NEW.status = 'needs_changes' THEN 'Your submission needs some changes. Please check the feedback.'
                WHEN NEW.status = 'in_review' THEN 'Your submission is now being reviewed.'
                ELSE 'Your submission status has been updated.'
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'assignment_title', (SELECT title FROM assignments WHERE id = NEW.assignment_id),
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for submission notifications
DROP TRIGGER IF EXISTS submission_status_notification ON task_submissions;
CREATE TRIGGER submission_status_notification
    AFTER UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_submission_notification();

-- Achievement Trigger
CREATE OR REPLACE FUNCTION check_student_achievements()
RETURNS TRIGGER AS $$
DECLARE
    student_progress RECORD;
BEGIN
    -- Get student progress
    SELECT * INTO student_progress 
    FROM calculate_student_progress(NEW.student_id) 
    LIMIT 1;
    
    -- Check for progress-based achievements
    IF student_progress.progress_percentage >= 25 AND 
       NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.student_id AND achievement_type = 'progress_25') THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
        VALUES (NEW.student_id, 'progress_25', 'First Steps', 'Completed 25% of the program', '🚀');
    END IF;
    
    IF student_progress.progress_percentage >= 50 AND 
       NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.student_id AND achievement_type = 'progress_50') THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
        VALUES (NEW.student_id, 'progress_50', 'Halfway Hero', 'Reached 50% completion', '⭐');
    END IF;
    
    IF student_progress.progress_percentage >= 75 AND 
       NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.student_id AND achievement_type = 'progress_75') THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
        VALUES (NEW.student_id, 'progress_75', 'Almost There', '75% program completion', '🎯');
    END IF;
    
    IF student_progress.progress_percentage >= 100 AND 
       NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.student_id AND achievement_type = 'graduate') THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
        VALUES (NEW.student_id, 'graduate', 'Graduate', 'Completed the entire program', '🎓');
    END IF;
    
    -- Check for streak achievements
    IF student_progress.current_streak >= 5 AND 
       NOT EXISTS (SELECT 1 FROM student_achievements WHERE student_id = NEW.student_id AND achievement_type = 'streak_5') THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
        VALUES (NEW.student_id, 'streak_5', 'On Fire', '5 week completion streak', '🔥');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievements
DROP TRIGGER IF EXISTS check_achievements ON task_submissions;
CREATE TRIGGER check_achievements
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION check_student_achievements();

-- RLS Policies for new tables
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- Student achievements policies
DROP POLICY IF EXISTS "Students can view their own achievements" ON student_achievements;
CREATE POLICY "Students can view their own achievements" ON student_achievements
    FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all achievements" ON student_achievements;
CREATE POLICY "Admins can manage all achievements" ON student_achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Draft submissions policies
DROP POLICY IF EXISTS "Students can manage their own drafts" ON draft_submissions;
CREATE POLICY "Students can manage their own drafts" ON draft_submissions
    FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all drafts" ON draft_submissions;
CREATE POLICY "Admins can view all drafts" ON draft_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Notifications policies
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Submission files policies
DROP POLICY IF EXISTS "Students can manage files for their submissions" ON submission_files;
CREATE POLICY "Students can manage files for their submissions" ON submission_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM task_submissions ts
            WHERE ts.id = submission_files.submission_id
            AND ts.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all submission files" ON submission_files;
CREATE POLICY "Admins can view all submission files" ON submission_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Storage Policies for new buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-files', 'submission-files', false)
ON CONFLICT (id) DO NOTHING;

-- Submission files storage policies
DROP POLICY IF EXISTS "Students can upload their submission files" ON storage.objects;
CREATE POLICY "Students can upload their submission files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'submission-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Students can view their submission files" ON storage.objects;
CREATE POLICY "Students can view their submission files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submission-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Admins can view all submission files" ON storage.objects;
CREATE POLICY "Admins can view all submission files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submission-files' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_type ON student_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_draft_submissions_student_assignment ON draft_submissions(student_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);

-- Update existing admin dashboard view to include new metrics
DROP VIEW IF EXISTS admin_dashboard_view;
CREATE VIEW admin_dashboard_view AS
SELECT 
    t.name as track_name,
    COUNT(DISTINCT se.user_id) as total_students,
    COUNT(a.id) as total_assignments,
    COUNT(ts.id) as total_submissions,
    COUNT(CASE WHEN ts.status = 'approved' THEN 1 END) as approved_submissions,
    COUNT(CASE WHEN ts.status = 'pending' THEN 1 END) as pending_submissions,
    COUNT(CASE WHEN ts.status = 'needs_changes' THEN 1 END) as needs_changes_submissions,
    ROUND(
        (COUNT(CASE WHEN ts.status = 'approved' THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(ts.id), 0)) * 100, 2
    ) as approval_rate,
    COUNT(CASE WHEN ts.submitted_at >= NOW() - INTERVAL '7 days' THEN 1 END) as weekly_submissions,
    COUNT(CASE WHEN ts.submitted_at >= NOW() - INTERVAL '30 days' THEN 1 END) as monthly_submissions,
    COUNT(DISTINCT sa.student_id) as students_with_achievements
FROM tracks t
LEFT JOIN student_enrollments se ON t.id = se.track_id
LEFT JOIN weeks w ON t.id = w.track_id
LEFT JOIN assignments a ON w.id = a.week_id
LEFT JOIN task_submissions ts ON a.id = ts.assignment_id AND se.user_id = ts.student_id
LEFT JOIN student_achievements sa ON se.user_id = sa.student_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Grant access to the view
GRANT SELECT ON admin_dashboard_view TO authenticated;

COMMIT;

-- =============================================
-- ENHANCED FEATURES - NOTIFICATIONS & ACHIEVEMENTS
-- =============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('submission_feedback', 'partner_activity', 'clarity_call', 'achievement', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications for any user
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Student achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏆',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points INTEGER DEFAULT 0
);

-- Achievements RLS policies
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own achievements" ON student_achievements;
CREATE POLICY "Students can view their own achievements" ON student_achievements
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can manage all achievements" ON student_achievements;
CREATE POLICY "Admins can manage all achievements" ON student_achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Draft submissions table for auto-save functionality
CREATE TABLE IF NOT EXISTS draft_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    github_url TEXT,
    demo_url TEXT,
    notes TEXT,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

-- Draft submissions RLS policies
ALTER TABLE draft_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their own drafts" ON draft_submissions;
CREATE POLICY "Students can manage their own drafts" ON draft_submissions
    FOR ALL USING (auth.uid() = student_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for submission feedback notifications
CREATE OR REPLACE FUNCTION notify_submission_feedback()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify when status changes to approved or needs_changes
    IF NEW.status IN ('approved', 'needs_changes') AND 
       (OLD.status IS NULL OR OLD.status != NEW.status) THEN
        
        PERFORM create_notification(
            NEW.student_id,
            'submission_feedback',
            CASE 
                WHEN NEW.status = 'approved' THEN 'Assignment Approved! 🎉'
                ELSE 'Assignment Needs Changes'
            END,
            CASE 
                WHEN NEW.status = 'approved' THEN 'Great work! Your assignment has been approved.'
                ELSE 'Please review the feedback and resubmit your assignment.'
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'assignment_title', (SELECT title FROM assignments WHERE id = NEW.assignment_id),
                'feedback', NEW.feedback
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for submission notifications
DROP TRIGGER IF EXISTS submission_feedback_notification ON task_submissions;
CREATE TRIGGER submission_feedback_notification
    AFTER UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_submission_feedback();

-- Function to automatically award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
    submission_count INTEGER;
    perfect_scores INTEGER;
BEGIN
    -- Get submission stats
    SELECT COUNT(*) INTO submission_count
    FROM task_submissions
    WHERE student_id = p_student_id AND status = 'approved';
    
    -- Award "First Submission" achievement
    IF submission_count = 1 THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, points)
        VALUES (p_student_id, 'first_submission', 'First Submission', 'Completed your first assignment', '🎯', 10)
        ON CONFLICT DO NOTHING;
        
        -- Create notification
        PERFORM create_notification(
            p_student_id,
            'achievement',
            'Achievement Unlocked! 🎯',
            'You earned the "First Submission" achievement!',
            jsonb_build_object('achievement', 'first_submission')
        );
    END IF;
    
    -- Award "Streak" achievements
    IF submission_count >= 3 THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, points)
        VALUES (p_student_id, 'streak_3', 'On Fire!', 'Submitted 3 assignments', '🔥', 25)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award "Perfect Score" achievement
    SELECT COUNT(*) INTO perfect_scores
    FROM task_submissions
    WHERE student_id = p_student_id AND grade = '100' AND status = 'approved';
    
    IF perfect_scores >= 1 THEN
        INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, points)
        VALUES (p_student_id, 'perfect_score', 'Perfect Score', 'Got 100% on an assignment', '⭐', 50)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check achievements after submission approval
CREATE OR REPLACE FUNCTION trigger_achievement_check()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        PERFORM check_and_award_achievements(NEW.student_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement checking
DROP TRIGGER IF EXISTS achievement_check_trigger ON task_submissions;
CREATE TRIGGER achievement_check_trigger
    AFTER UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_achievement_check();

-- Add file support to chat messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Function for bulk submission updates
CREATE OR REPLACE FUNCTION bulk_update_submissions(
    submission_ids UUID[],
    new_status VARCHAR(50),
    reviewer_id UUID,
    feedback_text TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE task_submissions 
    SET 
        status = new_status,
        reviewed_by = reviewer_id,
        reviewed_at = NOW(),
        feedback = COALESCE(feedback_text, feedback)
    WHERE id = ANY(submission_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced indexes for new features
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_draft_submissions_student_assignment ON draft_submissions(student_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status_submitted_at ON task_submissions(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_status ON task_submissions(student_id, status);

-- Storage bucket for submission files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for submission files
DROP POLICY IF EXISTS "Students can upload their submission files" ON storage.objects;
CREATE POLICY "Students can upload their submission files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'submissions' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Students and admins can view submission files" ON storage.objects;
CREATE POLICY "Students and admins can view submission files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submissions' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

-- Grant permissions for new tables
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON student_achievements TO authenticated;
GRANT ALL ON draft_submissions TO authenticated;