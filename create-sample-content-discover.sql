-- Create Sample Content - Auto-discover valid status values

-- First, let's see what the constraint allows
SELECT 
    'CONSTRAINT_INFO' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%cohorts_status%';

-- Check existing cohorts to see valid status values
SELECT 'EXISTING_STATUS_VALUES' as info,
       DISTINCT status,
       COUNT(*) as count
FROM cohorts 
GROUP BY status;

-- Try to create content step by step with different approaches

-- =============================================================================
-- STEP 1: Create Sample Track (this should work)
-- =============================================================================

INSERT INTO tracks (id, name, description, created_at)
SELECT 
    gen_random_uuid(),
    'Full Stack Development',
    'Complete web development track covering frontend and backend technologies',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tracks WHERE name = 'Full Stack Development');

-- Show track creation result
SELECT 'TRACK_CREATED' as result,
       name,
       description
FROM tracks 
WHERE name = 'Full Stack Development';

-- =============================================================================
-- STEP 2: Try different cohort status values
-- =============================================================================

-- Let's try the most common status values one by one
-- Try 'draft' first
DO $$
BEGIN
    BEGIN
        INSERT INTO cohorts (id, name, status, start_date, end_date, created_at)
        SELECT 
            gen_random_uuid(),
            'Cohort 2024-A',
            'draft',
            '2024-01-01'::date,
            '2024-06-30'::date,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Cohort 2024-A');
        
        RAISE NOTICE 'SUCCESS: Created cohort with status = draft';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'FAILED: status = draft not allowed';
    END;
END $$;

-- Try 'published'
DO $$
BEGIN
    BEGIN
        INSERT INTO cohorts (id, name, status, start_date, end_date, created_at)
        SELECT 
            gen_random_uuid(),
            'Cohort 2024-B',
            'published',
            '2024-01-01'::date,
            '2024-06-30'::date,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Cohort 2024-B');
        
        RAISE NOTICE 'SUCCESS: Created cohort with status = published';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'FAILED: status = published not allowed';
    END;
END $$;

-- Show what cohorts were created
SELECT 'COHORTS_CREATED' as result,
       name,
       status,
       start_date,
       end_date
FROM cohorts 
WHERE name LIKE 'Cohort 2024-%';

-- =============================================================================
-- Continue with other content if we have a cohort
-- =============================================================================

-- Create weeks (this should work if we have a track)
INSERT INTO weeks (id, track_id, week_number, title, description, created_at)
SELECT 
    gen_random_uuid(),
    t.id,
    1,
    'Introduction to Web Development',
    'Learn the basics of HTML, CSS, and JavaScript fundamentals',
    NOW()
FROM tracks t
WHERE t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM weeks WHERE week_number = 1 AND track_id = t.id);

-- Show final status
SELECT 'FINAL_STATUS' as info,
       (SELECT COUNT(*) FROM tracks WHERE name = 'Full Stack Development') as tracks_created,
       (SELECT COUNT(*) FROM cohorts WHERE name LIKE 'Cohort 2024-%') as cohorts_created,
       (SELECT COUNT(*) FROM weeks) as weeks_created;