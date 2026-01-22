-- Final Setup - Fixed version without IF NOT EXISTS for policies

-- Create the missing tables if they don't exist
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

-- Create policies (safe way - using DO block)
DO $$ 
BEGIN
    -- Drop existing policies first (safe)
    DROP POLICY IF EXISTS "achievements_student_view" ON student_achievements;
    DROP POLICY IF EXISTS "achievements_system_insert" ON student_achievements;
    DROP POLICY IF EXISTS "progress_student_view" ON week_progress;
    DROP POLICY IF EXISTS "progress_system_manage" ON week_progress;
    
    -- Create new policies
    CREATE POLICY "achievements_student_view" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
    CREATE POLICY "achievements_system_insert" ON student_achievements FOR INSERT WITH CHECK (true);
    CREATE POLICY "progress_student_view" ON week_progress FOR SELECT USING (auth.uid() = student_id);
    CREATE POLICY "progress_system_manage" ON week_progress FOR ALL USING (true);
END $$;

-- Create triggers (since functions exist)
DROP TRIGGER IF EXISTS trigger_update_student_progress ON task_submissions;
CREATE TRIGGER trigger_update_student_progress
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION update_student_progress();

DROP TRIGGER IF EXISTS trigger_create_student_achievements ON task_submissions;
CREATE TRIGGER trigger_create_student_achievements
    AFTER INSERT OR UPDATE ON task_submissions
    FOR EACH ROW EXECUTE FUNCTION create_student_achievements();

-- Grant permissions
GRANT ALL ON student_achievements TO authenticated;
GRANT ALL ON week_progress TO authenticated;

-- Status check
SELECT 'SETUP_COMPLETE' as status,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
            THEN '✅ student_achievements created' ELSE '❌ student_achievements failed' END as table_1,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
            THEN '✅ week_progress created' ELSE '❌ week_progress failed' END as table_2,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
            THEN '✅ triggers created' ELSE '❌ triggers failed' END as triggers;

-- Show test data
SELECT 'TEST_DATA' as info,
       id as submission_id,
       student_id,
       status,
       'Copy this ID for testing' as instruction
FROM task_submissions 
WHERE status != 'approved'
LIMIT 1;