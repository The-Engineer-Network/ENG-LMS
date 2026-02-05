-- Temporarily disable all triggers on task_submissions table
ALTER TABLE task_submissions DISABLE TRIGGER ALL;

-- Verify triggers are disabled
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  tgenabled
FROM information_schema.triggers
WHERE event_object_table = 'task_submissions';

-- Note: tgenabled values:
-- 'O' = trigger fires in "origin" and "local" modes
-- 'D' = trigger is disabled
-- 'R' = trigger fires in "replica" mode
-- 'A' = trigger fires always
