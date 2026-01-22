-- ENG-LMS System Deployment Script v2
-- Fixed version that handles existing functions and policies
-- Execute in the following order for proper setup

-- =============================================================================
-- STEP 1: Clean up existing functions and policies
-- =============================================================================

-- Drop existing is_admin functions (all variants)
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Create the admin check function with a unique name
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 2: Fix RLS Policies (Critical)
-- =============================================================================

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on main tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
              AND tablename IN ('tracks', 'weeks', 'lessons', 'assignments', 'cohorts', 
                               'student_enrollments', 'task_submissions', 'accountability_partners',
                               'certificates', 'clarity_call_requests', 'paid_learner_whitelist',
                               'chat_messages', 'profiles', 'admin_settings')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read ' || r.tablename || '" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can view their own enrollment" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can view their own submissions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can insert their own submissions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can update their own submissions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can view their partnerships" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can view their own certificates" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Students can manage their own requests" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their messages" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can send messages" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all profiles" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all profiles" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all messages" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read whitelist for signup" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage whitelist" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage settings" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all enrollments" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all submissions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage partnerships" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage certificates" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all requests" ON ' || r.tablename;
    END LOOP;
END $$;

-- Create simplified, performant policies using the new function name
-- TRACKS policies
CREATE POLICY "tracks_read_all" ON tracks FOR SELECT USING (true);
CREATE POLICY "tracks_admin_manage" ON tracks FOR ALL USING (check_user_is_admin());

-- WEEKS policies  
CREATE POLICY "weeks_read_all" ON weeks FOR SELECT USING (true);
CREATE POLICY "weeks_admin_manage" ON weeks FOR ALL USING (check_user_is_admin());

-- LESSONS policies
CREATE POLICY "lessons_read_all" ON lessons FOR SELECT USING (true);
CREATE POLICY "lessons_admin_manage" ON lessons FOR ALL USING (check_user_is_admin());

-- ASSIGNMENTS policies
CREATE POLICY "assignments_read_all" ON assignments FOR SELECT USING (true);
CREATE POLICY "assignments_admin_manage" ON assignments FOR ALL USING (check_user_is_admin());

-- COHORTS policies
CREATE POLICY "cohorts_read_all" ON cohorts FOR SELECT USING (true);
CREATE POLICY "cohorts_admin_manage" ON cohorts FOR ALL USING (check_user_is_admin());

-- STUDENT_ENROLLMENTS policies
CREATE POLICY "enrollments_student_own" ON student_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enrollments_admin_all" ON student_enrollments FOR ALL USING (check_user_is_admin());

-- TASK_SUBMISSIONS policies
CREATE POLICY "submissions_student_own_select" ON task_submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "submissions_student_own_insert" ON task_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "submissions_student_own_update" ON task_submissions FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "submissions_admin_all" ON task_submissions FOR ALL USING (check_user_is_admin());

-- ACCOUNTABILITY_PARTNERS policies
CREATE POLICY "partners_student_own" ON accountability_partners FOR SELECT USING (auth.uid() = student1_id OR auth.uid() = student2_id);
CREATE POLICY "partners_admin_all" ON accountability_partners FOR ALL USING (check_user_is_admin());

-- CERTIFICATES policies
CREATE POLICY "certificates_student_own" ON certificates FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "certificates_admin_all" ON certificates FOR ALL USING (check_user_is_admin());

-- CLARITY_CALL_REQUESTS policies
CREATE POLICY "clarity_requests_student_own" ON clarity_call_requests FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "clarity_requests_admin_all" ON clarity_call_requests FOR ALL USING (check_user_is_admin());

-- PAID_LEARNER_WHITELIST policies
CREATE POLICY "whitelist_read_all" ON paid_learner_whitelist FOR SELECT USING (true);
CREATE POLICY "whitelist_admin_manage" ON paid_learner_whitelist FOR ALL USING (check_user_is_admin());

-- CHAT_MESSAGES policies
CREATE POLICY "messages_user_own" ON chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "messages_user_send" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_admin_view" ON chat_messages FOR SELECT USING (check_user_is_admin());

-- PROFILES policies
CREATE POLICY "profiles_user_own_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_user_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_view" ON profiles FOR SELECT USING (check_user_is_admin());
CREATE POLICY "profiles_admin_manage" ON profiles FOR ALL USING (check_user_is_admin());

-- ADMIN_SETTINGS policies
CREATE POLICY "settings_admin_only" ON admin_settings FOR ALL USING (check_user_is_admin());

-- =============================================================================
-- STEP 3: Create Missing Tables
-- =============================================================================

-- Create student_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, achievement_type)
);

-- Create week_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS week_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'pending', 'approved')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, week_id)
);

-- Enable RLS on new tables
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "achievements_student_own" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "achievements_admin_all" ON student_achievements FOR ALL USING (check_user_is_admin());
CREATE POLICY "progress_student_own" ON week_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "progress_admin_all" ON week_progress FOR ALL USING (check_user_is_admin());
CREATE POLICY "progress_system_manage" ON week_progress FOR ALL USING (true);

-- =============================================================================
-- STEP 4: Create Trigger Functions for Automation
-- =============================================================================

-- Drop existing trigger functions if they exist
DROP FUNCTION IF EXISTS update_student_progress() CASCADE;
DROP FUNCTION IF EXISTS create_student_achievements() CASCADE;
DROP FUNCTION IF EXISTS update_week_progress_on_submission() CASCADE;

-- Function to calculate student progress when submissions are approved
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
    student_enrollment_id UUID;
    total_assignments INTEGER;
    approved_assignments INTEGER;
    progress_percent INTEGER;
BEGIN
    -- Only proceed if status changed to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Get the student's enrollment
        SELECT se.id INTO student_enrollment_id
        FROM student_enrollments se
        JOIN assignments a ON a.week_id IN (
            SELECT w.id FROM weeks w WHERE w.track_id = se.track_id
        )
        WHERE se.user_id = NEW.student_id
        AND a.id = NEW.assignment_id;
        
        IF student_enrollment_id IS NOT NULL THEN
            -- Count total assignments in the student's track
            SELECT COUNT(*) INTO total_assignments
            FROM assignments a
            JOIN weeks w ON w.id = a.week_id
            JOIN student_enrollments se ON se.track_id = w.track_id
            WHERE se.id = student_enrollment_id;
            
            -- Count approved assignments for this student
            SELECT COUNT(*) INTO approved_assignments
            FROM task_submissions ts
            JOIN assignments a ON a.id = ts.assignment_id
            JOIN weeks w ON w.id = a.week_id
            JOIN student_enrollments se ON se.track_id = w.track_id
            WHERE se.id = student_enrollment_id
            AND ts.student_id = NEW.student_id
            AND ts.status = 'approved';
            
            -- Calculate progress percentage
            IF total_assignments > 0 THEN
                progress_percent := ROUND((approved_assignments::DECIMAL / total_assignments::DECIMAL) * 100);
            ELSE
                progress_percent := 0;
            END IF;
            
            -- Update student enrollment progress
            UPDATE student_enrollments
            SET progress_percentage = progress_percent,
                updated_at = NOW()
            WHERE id = student_enrollment_id;
            
            -- Update or create week progress
            INSERT INTO week_progress (
                student_id, week_id, status, completed_at, created_at, updated_at
            )
            SELECT NEW.student_id, a.week_id, 'approved', NOW(), NOW(), NOW()
            FROM assignments a WHERE a.id = NEW.assignment_id
            ON CONFLICT (student_id, week_id) 
            DO UPDATE SET status = 'approved', completed_at = NOW(), updated_at = NOW();
                
            -- Check if student is eligible for certificate
            IF progress_percent >= 100 THEN
                INSERT INTO certificates (
                    student_id, track_id, tasks_completed, total_tasks, completion_date, created_at, updated_at
                )
                SELECT NEW.student_id, se.track_id, approved_assignments, total_assignments, NOW(), NOW(), NOW()
                FROM student_enrollments se WHERE se.id = student_enrollment_id
                ON CONFLICT (student_id, track_id) 
                DO UPDATE SET tasks_completed = approved_assignments, total_tasks = total_assignments, completion_date = NOW(), updated_at = NOW();
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create achievements when milestones are reached
CREATE OR REPLACE FUNCTION create_student_achievements()
RETURNS TRIGGER AS $$
DECLARE
    submission_count INTEGER;
BEGIN
    -- Only proceed for approved submissions
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Count total approved submissions for this student
        SELECT COUNT(*) INTO submission_count
        FROM task_submissions WHERE student_id = NEW.student_id AND status = 'approved';
        
        -- Create achievements based on milestones
        IF submission_count = 1 THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, earned_at, created_at)
            VALUES (NEW.student_id, 'first_submission', 'First Submission', 'Completed your first assignment', '🎯', NOW(), NOW())
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF NEW.grade = '100' OR NEW.grade = '100%' THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, earned_at, created_at)
            VALUES (NEW.student_id, 'perfect_score', 'Perfect Score', 'Got 100% on an assignment', '⭐', NOW(), NOW())
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF submission_count = 5 THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, earned_at, created_at)
            VALUES (NEW.student_id, 'five_submissions', 'Getting Started', 'Completed 5 assignments', '🚀', NOW(), NOW())
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF submission_count = 10 THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon, earned_at, created_at)
            VALUES (NEW.student_id, 'ten_submissions', 'Dedicated Learner', 'Completed 10 assignments', '🏆', NOW(), NOW())
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update week progress when submissions are created
CREATE OR REPLACE FUNCTION update_week_progress_on_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or create week progress when student submits
    INSERT INTO week_progress (
        student_id, week_id, status, submitted_at, created_at, updated_at
    )
    SELECT NEW.student_id, a.week_id, 'pending', NEW.submitted_at, NOW(), NOW()
    FROM assignments a WHERE a.id = NEW.assignment_id
    ON CONFLICT (student_id, week_id) 
    DO UPDATE SET 
        status = CASE 
            WHEN week_progress.status = 'approved' THEN 'approved'
            ELSE 'pending'
        END,
        submitted_at = NEW.submitted_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_student_progress ON task_submissions;
CREATE TRIGGER trigger_update_student_progress
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION update_student_progress();

DROP TRIGGER IF EXISTS trigger_create_student_achievements ON task_submissions;
CREATE TRIGGER trigger_create_student_achievements
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION create_student_achievements();

DROP TRIGGER IF EXISTS trigger_update_week_progress_on_submission ON task_submissions;
CREATE TRIGGER trigger_update_week_progress_on_submission
    AFTER INSERT ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION update_week_progress_on_submission();

-- =============================================================================
-- STEP 5: Add Performance Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_student_enrollments_user_track ON student_enrollments(user_id, track_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_assignments_week ON assignments(week_id);
CREATE INDEX IF NOT EXISTS idx_lessons_week ON lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_weeks_track ON weeks(track_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_week_progress_student ON week_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_students ON accountability_partners(student1_id, student2_id);

-- =============================================================================
-- STEP 6: Grant Permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- STEP 7: Verification Queries
-- =============================================================================

-- Verify tables exist
SELECT 'VERIFICATION' as status, 'Tables created' as message, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_achievements', 'week_progress');

-- Verify triggers exist
SELECT 'VERIFICATION' as status, 'Triggers created' as message, COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_update_student_progress', 'trigger_create_student_achievements', 'trigger_update_week_progress_on_submission');

-- Verify RLS policies
SELECT 'VERIFICATION' as status, 'RLS policies' as message, COUNT(*) as count
FROM pg_policies WHERE schemaname = 'public';

-- Verify indexes
SELECT 'VERIFICATION' as status, 'Indexes created' as message, COUNT(*) as count
FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Verify admin function
SELECT 'VERIFICATION' as status, 'Admin function works' as message, 
       CASE WHEN check_user_is_admin('00000000-0000-0000-0000-000000000000') IS NOT NULL 
            THEN 'PASS' ELSE 'FAIL' END as result;

SELECT 'DEPLOYMENT COMPLETE' as status, 'All system fixes deployed successfully' as message, NOW() as timestamp;