-- Check cohorts table constraints and valid status values

-- Check table structure and constraints
SELECT 
    'COHORTS_STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cohorts' 
ORDER BY ordinal_position;

-- Check constraints on cohorts table
SELECT 
    'COHORTS_CONSTRAINTS' as info,
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'cohorts';

-- Try to see existing cohorts to understand valid status values
SELECT 'EXISTING_COHORTS' as info,
       name,
       status,
       start_date,
       end_date
FROM cohorts
LIMIT 5;