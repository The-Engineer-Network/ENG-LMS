-- Find all custom (non-system) triggers on task_submissions
SELECT 
  t.tgname as trigger_name,
  t.tgenabled,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'task_submissions'
  AND NOT t.tgisinternal  -- Exclude internal/system triggers
ORDER BY t.tgname;

-- If you see any custom triggers above, disable them individually like this:
-- ALTER TABLE task_submissions DISABLE TRIGGER trigger_name_here;

-- For now, let's check what the trigger is trying to do
-- and fix the week_progress table instead
