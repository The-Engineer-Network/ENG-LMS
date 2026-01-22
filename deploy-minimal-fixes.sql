-- ENG-LMS Minimal System Fixes
-- Only adds essential missing components without assumptions about existing structure
-- Run check-database-structure.sql first to see what exists

-- =============================================================================
-- STEP 1: Create Missing Tables (Essential)
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
-- STEP 2: Add Basic RLS Policies (Safe)
-- =============================================================================

-- Basic policies for student_achievements
DO $$ 
BEGIN
    -- Students can view their own achievements
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_achievements' AND policyname = 'achievements_student_view') THEN
        CREATE POLICY "achievements_student_view" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    -- Allow system to insert achievements (for triggers)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_achievements' AND policyname = 'achievements_system_insert') THEN
        CREATE POLICY "achievements_system_insert" ON student_achievements FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Basic policies for week_progress
DO $$ 
BEGIN
    -- Students can view their own progress
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'week_progress' AND policyname = 'progress_student_view') THEN
        CREATE POLICY "progress_student_view" ON week_progress FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    -- Allow system to manage progress (for triggers)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'week_progress' AND policyname = 'progress_system_manage') THEN
        CREATE POLICY "progress_system_manage" ON week_progress FOR ALL USING (true);
    END IF;
END $$;

-- =============================================================================
-- STEP 3: Create Essential Trigger Functions
-- =============================================================================

-- Drop existing trigger functions if they exist
DROP FUNCTION IF EXISTS update_student_progress() CASCADE;
DROP FUNCTION IF EXISTS create_student_achievements() CASCADE;
DROP FUNCTION IF EXISTS update_week_progress_on_submission() CASCADE;

-- Simple function to calculate student progress when submissions are approved
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_assignments INTEGER;
    approved_assignments INTEGER;
    progress_percent INTEGER;
BEGIN
    -- Only proceed if status changed to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Simple progress calculation
        SELECT COUNT(*) INTO approved_assignments
        FROM task_submissions 
        WHERE student_id = NEW.student_id AND status = 'approved';
        
        -- Update week progress
        INSERT INTO week_progress (
            student_id, week_id, status, completed_at, created_at, updated_at
        )
        SELECT NEW.student_id, a.week_id, 'approved', NOW(), NOW(), NOW()
        FROM assignments a WHERE a.id = NEW.assignment_id
        ON CONFLICT (student_id, week_id) 
        DO UPDATE SET status = 'approved', completed_at = NOW(), updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Simple function to create achievements
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
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
            VALUES (NEW.student_id, 'first_submission', 'First Submission', 'Completed your first assignment', '🎯')
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF submission_count = 5 THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
            VALUES (NEW.student_id, 'five_submissions', 'Getting Started', 'Completed 5 assignments', '🚀')
            ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF submission_count = 10 THEN
            INSERT INTO student_achievements (student_id, achievement_type, title, description, icon)
            VALUES (NEW.student_id, 'ten_submissions', 'Dedicated Learner', 'Completed 10 assignments', '🏆')
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
    -- Update week progress when student submits
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
-- STEP 4: Create Triggers
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
-- STEP 5: Add Essential Indexes (Safe)
-- =============================================================================

-- Only create indexes that we know will work
CREATE INDEX IF NOT EXISTS idx_student_enrollments_user_track ON student_enrollments(user_id, track_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_assignments_week ON assignments(week_id);
CREATE INDEX IF NOT EXISTS idx_lessons_week ON lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_weeks_track ON weeks(track_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_week_progress_student ON week_progress(student_id);

-- =============================================================================
-- STEP 6: Grant Permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- STEP 7: Verification
-- =============================================================================

-- Verify new tables exist
SELECT 'SUCCESS' as status, 'New tables created' as message, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_achievements', 'week_progress');

-- Verify triggers exist
SELECT 'SUCCESS' as status, 'Triggers created' as message, COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_update_student_progress', 'trigger_create_student_achievements', 'trigger_update_week_progress_on_submission');

-- Verify policies exist
SELECT 'SUCCESS' as status, 'Policies created' as message, COUNT(*) as count
FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('student_achievements', 'week_progress');

SELECT 'DEPLOYMENT COMPLETE' as status, 'Essential system components deployed' as message, NOW() as timestamp;

-- =============================================================================
-- STEP 8: Test Instructions
-- =============================================================================

SELECT 'NEXT STEPS' as status, 
       'Test by creating a task submission and setting status to approved' as instruction,
       'Check student_achievements and week_progress tables for automatic updates' as verification;