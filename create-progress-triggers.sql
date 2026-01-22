-- Create trigger functions for automatic progress calculation and week unlocking

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
                student_id,
                week_id,
                status,
                completed_at,
                created_at,
                updated_at
            )
            SELECT 
                NEW.student_id,
                a.week_id,
                'approved',
                NOW(),
                NOW(),
                NOW()
            FROM assignments a
            WHERE a.id = NEW.assignment_id
            ON CONFLICT (student_id, week_id) 
            DO UPDATE SET
                status = 'approved',
                completed_at = NOW(),
                updated_at = NOW();
                
            -- Check if student is eligible for certificate
            IF progress_percent >= 100 THEN
                INSERT INTO certificates (
                    student_id,
                    track_id,
                    tasks_completed,
                    total_tasks,
                    completion_date,
                    created_at,
                    updated_at
                )
                SELECT 
                    NEW.student_id,
                    se.track_id,
                    approved_assignments,
                    total_assignments,
                    NOW(),
                    NOW(),
                    NOW()
                FROM student_enrollments se
                WHERE se.id = student_enrollment_id
                ON CONFLICT (student_id, track_id) 
                DO UPDATE SET
                    tasks_completed = approved_assignments,
                    total_tasks = total_assignments,
                    completion_date = NOW(),
                    updated_at = NOW();
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on task_submissions
DROP TRIGGER IF EXISTS trigger_update_student_progress ON task_submissions;
CREATE TRIGGER trigger_update_student_progress
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_student_progress();

-- Function to update week progress when submissions are created
CREATE OR REPLACE FUNCTION update_week_progress_on_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or create week progress when student submits
    INSERT INTO week_progress (
        student_id,
        week_id,
        status,
        submitted_at,
        created_at,
        updated_at
    )
    SELECT 
        NEW.student_id,
        a.week_id,
        'pending',
        NEW.submitted_at,
        NOW(),
        NOW()
    FROM assignments a
    WHERE a.id = NEW.assignment_id
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

-- Create trigger for submission creation
DROP TRIGGER IF EXISTS trigger_update_week_progress_on_submission ON task_submissions;
CREATE TRIGGER trigger_update_week_progress_on_submission
    AFTER INSERT ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_week_progress_on_submission();

-- Function to create achievements when milestones are reached
CREATE OR REPLACE FUNCTION create_student_achievements()
RETURNS TRIGGER AS $$
DECLARE
    submission_count INTEGER;
    streak_count INTEGER;
BEGIN
    -- Only proceed for approved submissions
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Count total approved submissions for this student
        SELECT COUNT(*) INTO submission_count
        FROM task_submissions
        WHERE student_id = NEW.student_id
        AND status = 'approved';
        
        -- Create achievements based on milestones
        -- First submission achievement
        IF submission_count = 1 THEN
            INSERT INTO student_achievements (
                student_id,
                achievement_type,
                title,
                description,
                icon,
                earned_at,
                created_at
            ) VALUES (
                NEW.student_id,
                'first_submission',
                'First Submission',
                'Completed your first assignment',
                '🎯',
                NOW(),
                NOW()
            ) ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        -- Perfect score achievement (if grade is 100)
        IF NEW.grade = '100' OR NEW.grade = '100%' THEN
            INSERT INTO student_achievements (
                student_id,
                achievement_type,
                title,
                description,
                icon,
                earned_at,
                created_at
            ) VALUES (
                NEW.student_id,
                'perfect_score',
                'Perfect Score',
                'Got 100% on an assignment',
                '⭐',
                NOW(),
                NOW()
            ) ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        -- Milestone achievements
        IF submission_count = 5 THEN
            INSERT INTO student_achievements (
                student_id,
                achievement_type,
                title,
                description,
                icon,
                earned_at,
                created_at
            ) VALUES (
                NEW.student_id,
                'five_submissions',
                'Getting Started',
                'Completed 5 assignments',
                '🚀',
                NOW(),
                NOW()
            ) ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
        
        IF submission_count = 10 THEN
            INSERT INTO student_achievements (
                student_id,
                achievement_type,
                title,
                description,
                icon,
                earned_at,
                created_at
            ) VALUES (
                NEW.student_id,
                'ten_submissions',
                'Dedicated Learner',
                'Completed 10 assignments',
                '🏆',
                NOW(),
                NOW()
            ) ON CONFLICT (student_id, achievement_type) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievements
DROP TRIGGER IF EXISTS trigger_create_student_achievements ON task_submissions;
CREATE TRIGGER trigger_create_student_achievements
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_student_achievements();

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

-- RLS policies for student_achievements
CREATE POLICY "Students can view their own achievements" ON student_achievements
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all achievements" ON student_achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- RLS policies for week_progress
CREATE POLICY "Students can view their own progress" ON week_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all progress" ON week_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "System can insert/update progress" ON week_progress
    FOR ALL USING (true);