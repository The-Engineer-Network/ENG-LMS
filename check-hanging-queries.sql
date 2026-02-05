-- ========================================
-- CHECK FOR HANGING QUERIES AND LOCKS
-- ========================================

-- 1. Check for long-running or stuck queries
SELECT 
  '🔍 Active Queries' as info,
  pid,
  now() - query_start as duration,
  state,
  wait_event_type,
  wait_event,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- 2. Check for locks on the lessons table
SELECT 
  '🔒 Locks on Lessons Table' as info,
  l.locktype,
  l.mode,
  l.granted,
  l.pid,
  a.query,
  a.state,
  now() - a.query_start as duration
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
JOIN pg_class c ON l.relation = c.oid
WHERE c.relname = 'lessons'
ORDER BY a.query_start;

-- 3. Check for blocking queries
SELECT 
  '⚠️ Blocking Queries' as info,
  blocked_locks.pid AS blocked_pid,
  blocked_activity.query AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 4. Check connection pool status
SELECT 
  '📊 Connection Stats' as info,
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity;

SELECT '✅ Check complete!' as status;
