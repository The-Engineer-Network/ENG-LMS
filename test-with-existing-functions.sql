-- Test with existing functions
-- Since functions exist, let's see if we can create the missing pieces

-- First, let's see what we have
SELECT 'CURRENT_STATUS' as info,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'student_achievements') as achievements_table,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'week_progress') as progress_table,
       (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%student%') as triggers_count,
       (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE '%student%') as functions_count;

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

-- Create basic policies
CREATE POLICY IF NOT EXISTS "achievements_student_view" ON student_achievements FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY IF NOT EXISTS "achievements_system_insert" ON student_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "progress_student_view" ON week_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY IF NOT EXISTS "progress_system_manage" ON week_progress FOR ALL USING (true);

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

-- Final status check
SELECT 'FINAL_STATUS' as result,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
            THEN 'student_achievements: ✅' ELSE 'student_achievements: ❌' END as table_1,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
            THEN 'week_progress: ✅' ELSE 'week_progress: ❌' END as table_2,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
            THEN 'triggers: ✅' ELSE 'triggers: ❌' END as triggers;

-- Show test submission if available
SELECT 'TEST_SUBMISSION' as info,
       id,
       student_id,
       status,
       'Use this ID to test: UPDATE task_submissions SET status = ''approved'' WHERE id = ''' || id || ''';' as test_command
FROM task_submissions 
WHERE status != 'approved'
LIMIT 1;