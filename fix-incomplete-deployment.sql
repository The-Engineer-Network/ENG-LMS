-- Fix Incomplete Deployment
-- Run this if the deployment status check shows missing components

-- =============================================================================
-- Create missing tables (safe - only creates if not exists)
-- =============================================================================

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

-- Enable RLS
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_progress ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Create basic policies (safe)
-- =============================================================================

DO $$ 
BEGIN
    -- Student achievements policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'achievements_student_view') THEN
        CREATE POLICY "achievements_student_view" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'achievements_system_insert') THEN
        CREATE POLICY "achievements_system_insert" ON student_achievements FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Week progress policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'week_progress' AND policyname = 'progress_student_view') THEN
        CREATE POLICY "progress_student_view" ON week_progress FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'week_progress' AND policyname = 'progress_system_manage') THEN
        CREATE POLICY "progress_system_manage" ON week_progress FOR ALL USING (true);
    END IF;
END $$;

-- =============================================================================
-- Create trigger functions (safe - replaces if exists)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
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

CREATE OR REPLACE FUNCTION create_student_achievements()
RETURNS TRIGGER AS $$
DECLARE
    submission_count INTEGER;
BEGIN
    -- Only proceed for approved submissions
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Count approved submissions
        SELECT COUNT(*) INTO submission_count
        FROM task_submissions WHERE student_id = NEW.student_id AND status = 'approved';
        
        -- Create achievements
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Create triggers (safe - drops and recreates)
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_update_student_progress ON task_submissions;
CREATE TRIGGER trigger_update_student_progress
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION update_student_progress();

DROP TRIGGER IF EXISTS trigger_create_student_achievements ON task_submissions;
CREATE TRIGGER trigger_create_student_achievements
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION create_student_achievements();

-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT ALL ON student_achievements TO authenticated;
GRANT ALL ON week_progress TO authenticated;

-- =============================================================================
-- Verification
-- =============================================================================

SELECT 'FIXED' as status, 'Tables, functions, and triggers have been created/updated' as message;

-- Final check
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
         THEN '✅ student_achievements' ELSE '❌ student_achievements' END as table_1,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
         THEN '✅ week_progress' ELSE '❌ week_progress' END as table_2,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
         THEN '✅ triggers' ELSE '❌ triggers' END as triggers;