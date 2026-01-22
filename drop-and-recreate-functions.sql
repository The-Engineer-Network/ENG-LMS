-- Drop and recreate functions to fix parameter naming issues
-- Run this first, then run the main deployment script

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_trigger_exists(text);
DROP FUNCTION IF EXISTS get_trigger_info(text);
DROP FUNCTION IF EXISTS check_database_health();

-- Now create the functions with proper parameter names
CREATE OR REPLACE FUNCTION check_trigger_exists(p_trigger_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.triggers t
        WHERE t.trigger_name = p_trigger_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trigger information
CREATE OR REPLACE FUNCTION get_trigger_info(p_trigger_name TEXT)
RETURNS TABLE(
    trigger_name TEXT,
    table_name TEXT,
    trigger_timing TEXT,
    trigger_event TEXT,
    function_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        t.event_object_table::TEXT,
        t.action_timing::TEXT,
        t.event_manipulation::TEXT,
        t.action_statement::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_name = p_trigger_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    has_rls BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        COALESCE((
            SELECT n_tup_ins + n_tup_upd 
            FROM pg_stat_user_tables s
            WHERE s.relname = t.tablename
        ), 0)::BIGINT,
        t.rowsecurity::BOOLEAN
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('profiles', 'tracks', 'cohorts', 'student_enrollments', 'week_progress', 'paid_learner_whitelist')
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_trigger_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trigger_info(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_database_health() TO authenticated;

SELECT 'Functions dropped and recreated successfully' as status;