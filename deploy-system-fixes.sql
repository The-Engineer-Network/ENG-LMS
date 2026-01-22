-- ENG-LMS System Deployment Script
-- Run this script to deploy all system fixes and improvements
-- Execute in the following order for proper setup

-- =============================================================================
-- STEP 1: Fix RLS Policies (Critical)
-- =============================================================================

-- Simplify the admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies and create simplified ones
DROP POLICY IF EXISTS "Public read access for tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can manage tracks" ON tracks;
DROP POLICY IF EXISTS "Public read access for weeks" ON weeks;
DROP POLICY IF EXISTS "Admins can manage weeks" ON weeks;
DROP POLICY IF EXISTS "Public read access for lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Public read access for assignments" ON assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON assignments;

-- Create simplified, performant policies
CREATE POLICY "Anyone can read tracks" ON tracks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tracks" ON tracks FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read weeks" ON weeks FOR SELECT USING (true);
CREATE POLICY "Admins can manage weeks" ON weeks FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (is_admin());

-- =============================================================================
-- STEP 2: Create Missing Tables
-- =============================================================================

-- Create student_achievements table
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

-- Create week_progress table
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
CREATE POLICY "Students can view their own achievements" ON student_achievements
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all achievements" ON student_achievements
    FOR ALL USING (is_admin());
CREATE POLICY "Students can view their own progress" ON week_progress
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all progress" ON week_progress
    FOR ALL USING (is_admin());
CREATE POLICY "System can insert/update progress" ON week_progress
    FOR ALL USING (true);

-- =============================================================================
-- STEP 3: Create Trigger Functions for Automation
-- =============================================================================

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
    END IF;
    
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

-- =============================================================================
-- STEP 4: Add Performance Indexes
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

-- =============================================================================
-- STEP 5: Grant Permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- STEP 6: Verification Queries
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
AND trigger_name IN ('trigger_update_student_progress', 'trigger_create_student_achievements');

-- Verify RLS policies
SELECT 'VERIFICATION' as status, 'RLS policies' as message, COUNT(*) as count
FROM pg_policies WHERE schemaname = 'public';

-- Verify indexes
SELECT 'VERIFICATION' as status, 'Indexes created' as message, COUNT(*) as count
FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

SELECT 'DEPLOYMENT COMPLETE' as status, 'All system fixes deployed successfully' as message, NOW() as timestamp;