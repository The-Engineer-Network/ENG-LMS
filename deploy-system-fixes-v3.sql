-- ENG-LMS System Deployment Script v3
-- Safe version that works with existing is_admin() function
-- Only adds missing components without breaking existing policies

-- =============================================================================
-- STEP 1: Create Missing Tables (Safe)
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

-- =============================================================================
-- STEP 2: Add RLS Policies for New Tables (Safe)
-- =============================================================================

-- RLS policies for student_achievements (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_achievements' AND policyname = 'achievements_student_own') THEN
        CREATE POLICY "achievements_student_own" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_achievements' AND policyname = 'achievements_admin_all') THEN
        CREATE POLICY "achievements_admin_all" ON student_achievements FOR ALL USING (is_admin());
    END IF;
END $$;

-- RLS policies for week_progress (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'week_progress' AND policyname = 'progress_student_own') THEN
        CREATE POLICY "progress_student_own" ON week_progress FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'week_progress' AND policyname = 'progress_admin_all') THEN
        CREATE POLICY "progress_admin_all" ON week_progress FOR ALL USING (is_admin());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'week_progress' AND policyname = 'progress_system_manage') THEN
        CREATE POLICY "progress_system_manage" ON week_progress FOR ALL USING (true);
    END IF;
END $$;

-- =============================================================================
-- STEP 3: Create Trigger Functions for Automation (Safe)
-- =============================================================================

-- Drop existing trigger functions if they exist (safe because we recreate them)
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
                
            -- Check if student is eligible for certificate (only if certificates table exists)
            IF progress_percent >= 100 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates') THEN
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

-- =============================================================================
-- STEP 4: Create Triggers (Safe)
-- =============================================================================

-- Create triggers (drop first to avoid conflicts)
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
-- STEP 5: Add Performance Indexes (Safe)
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
-- STEP 6: Grant Permissions (Safe)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- STEP 7: Fix Common RLS Issues (Safe - Only Add Missing Policies)
-- =============================================================================

-- Ensure basic read policies exist for main tables
DO $$ 
BEGIN
    -- Tracks
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tracks' AND policyname = 'tracks_public_read') THEN
        CREATE POLICY "tracks_public_read" ON tracks FOR SELECT USING (true);
    END IF;
    
    -- Weeks
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weeks' AND policyname = 'weeks_public_read') THEN
        CREATE POLICY "weeks_public_read" ON weeks FOR SELECT USING (true);
    END IF;
    
    -- Lessons
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'lessons_public_read') THEN
        CREATE POLICY "lessons_public_read" ON lessons FOR SELECT USING (true);
    END IF;
    
    -- Assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assignments' AND policyname = 'assignments_public_read') THEN
        CREATE POLICY "assignments_public_read" ON assignments FOR SELECT USING (true);
    END IF;
    
    -- Cohorts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cohorts' AND policyname = 'cohorts_public_read') THEN
        CREATE POLICY "cohorts_public_read" ON cohorts FOR SELECT USING (true);
    END IF;
END $$;

-- =============================================================================
-- STEP 8: Verification Queries
-- =============================================================================

-- Verify tables exist
SELECT 'VERIFICATION' as status, 'New tables created' as message, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_achievements', 'week_progress');

-- Verify triggers exist
SELECT 'VERIFICATION' as status, 'Triggers created' as message, COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_update_student_progress', 'trigger_create_student_achievements', 'trigger_update_week_progress_on_submission');

-- Verify RLS policies for new tables
SELECT 'VERIFICATION' as status, 'New table policies' as message, COUNT(*) as count
FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('student_achievements', 'week_progress');

-- Verify indexes
SELECT 'VERIFICATION' as status, 'Indexes created' as message, COUNT(*) as count
FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Verify existing is_admin function still works
SELECT 'VERIFICATION' as status, 'Admin function works' as message, 
       CASE WHEN is_admin() IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result;

-- Check if we have data in main tables
SELECT 'DATA_CHECK' as status, 'tracks' as table_name, COUNT(*) as count FROM tracks
UNION ALL
SELECT 'DATA_CHECK', 'weeks', COUNT(*) FROM weeks
UNION ALL
SELECT 'DATA_CHECK', 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'DATA_CHECK', 'profiles', COUNT(*) FROM profiles;

SELECT 'DEPLOYMENT COMPLETE' as status, 'System enhancements deployed successfully' as message, NOW() as timestamp;

-- =============================================================================
-- STEP 9: Optional - Test the Trigger System
-- =============================================================================

-- This is a test query you can run separately to verify triggers work
-- (Don't run this as part of the main deployment)
/*
-- Test query to check if triggers would work:
SELECT 'TRIGGER_TEST' as status, 
       'Ready to test' as message,
       'Create a test submission with status approved to verify triggers' as instruction;
*/