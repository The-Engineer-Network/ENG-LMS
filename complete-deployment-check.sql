-- Complete Deployment Check - All results in one query

SELECT 
    -- Tables check
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
         THEN 'student_achievements: EXISTS' 
         ELSE 'student_achievements: MISSING' END as table_1,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
         THEN 'week_progress: EXISTS' 
         ELSE 'week_progress: MISSING' END as table_2,
    
    -- Triggers check
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
         THEN 'Progress Trigger: EXISTS' 
         ELSE 'Progress Trigger: MISSING' END as trigger_1,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_create_student_achievements') 
         THEN 'Achievement Trigger: EXISTS' 
         ELSE 'Achievement Trigger: MISSING' END as trigger_2,
    
    -- Functions check
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_student_progress') 
         THEN 'Progress Function: EXISTS' 
         ELSE 'Progress Function: MISSING' END as function_1,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_student_achievements') 
         THEN 'Achievement Function: EXISTS' 
         ELSE 'Achievement Function: MISSING' END as function_2;