-- Create Sample Content for Testing - Fixed Version
-- This creates basic content so you can test the complete system

-- =============================================================================
-- STEP 1: Create Sample Track and Cohort (if none exist)
-- =============================================================================

-- Create a sample track (using only existing columns)
INSERT INTO tracks (id, name, description, created_at)
VALUES (
    gen_random_uuid(),
    'Full Stack Development',
    'Complete web development track covering frontend and backend technologies',
    NOW()
) ON CONFLICT (name) DO NOTHING;

-- Create a sample cohort (using only existing columns)
INSERT INTO cohorts (id, name, start_date, end_date, created_at)
VALUES (
    gen_random_uuid(),
    'Cohort 2024-A',
    '2024-01-01',
    '2024-06-30',
    NOW()
) ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- STEP 2: Create Sample Weeks (if none exist)
-- =============================================================================

-- Get the track ID for creating weeks
WITH track_info AS (
    SELECT id as track_id FROM tracks LIMIT 1
)
INSERT INTO weeks (id, track_id, week_number, title, description, created_at)
SELECT 
    gen_random_uuid(),
    track_info.track_id,
    1,
    'Introduction to Web Development',
    'Learn the basics of HTML, CSS, and JavaScript fundamentals',
    NOW()
FROM track_info
WHERE NOT EXISTS (SELECT 1 FROM weeks)
UNION ALL
SELECT 
    gen_random_uuid(),
    track_info.track_id,
    2,
    'Advanced JavaScript',
    'Deep dive into JavaScript ES6+, async programming, and DOM manipulation',
    NOW()
FROM track_info
WHERE NOT EXISTS (SELECT 1 FROM weeks);

-- =============================================================================
-- STEP 3: Create Sample Lessons (if none exist)
-- =============================================================================

-- Create lessons for week 1
WITH week_info AS (
    SELECT id as week_id FROM weeks WHERE week_number = 1 LIMIT 1
)
INSERT INTO lessons (id, week_id, title, type, content, created_at)
SELECT 
    gen_random_uuid(),
    week_info.week_id,
    'HTML Fundamentals',
    'text',
    'Learn the basic structure of HTML documents, semantic elements, and best practices for creating well-structured web pages.',
    NOW()
FROM week_info
WHERE NOT EXISTS (SELECT 1 FROM lessons)
UNION ALL
SELECT 
    gen_random_uuid(),
    week_info.week_id,
    'CSS Styling Basics',
    'text',
    'Introduction to CSS selectors, properties, and layout techniques including flexbox and grid.',
    NOW()
FROM week_info
WHERE NOT EXISTS (SELECT 1 FROM lessons);

-- =============================================================================
-- STEP 4: Create Sample Assignments (if none exist)
-- =============================================================================

-- Create assignments for each week
WITH week1 AS (
    SELECT id as week_id FROM weeks WHERE week_number = 1 LIMIT 1
),
week2 AS (
    SELECT id as week_id FROM weeks WHERE week_number = 2 LIMIT 1
)
INSERT INTO assignments (id, week_id, title, requirements, submission_guidelines, deadline, created_at)
SELECT 
    gen_random_uuid(),
    week1.week_id,
    'Build Your First Website',
    'Create a personal portfolio website using HTML and CSS. Include at least 3 pages: Home, About, and Contact.',
    'Submit your GitHub repository link and deployed website URL. Ensure your code is well-commented and follows best practices.',
    (NOW() + INTERVAL '7 days')::date,
    NOW()
FROM week1
WHERE NOT EXISTS (SELECT 1 FROM assignments)
UNION ALL
SELECT 
    gen_random_uuid(),
    week2.week_id,
    'Interactive JavaScript Project',
    'Build an interactive web application using JavaScript. Include user input, DOM manipulation, and event handling.',
    'Submit GitHub repository with live demo. Include a README explaining your project and how to run it.',
    (NOW() + INTERVAL '14 days')::date,
    NOW()
FROM week2
WHERE NOT EXISTS (SELECT 1 FROM assignments);

-- =============================================================================
-- STEP 5: Create Sample Student Enrollment (if none exist)
-- =============================================================================

-- Create a test student profile (if needed)
INSERT INTO profiles (id, email, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'student@example.com',
    'Test Student',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Enroll the student in the track
WITH student_info AS (
    SELECT id as user_id FROM profiles WHERE email = 'student@example.com'
),
track_info AS (
    SELECT id as track_id FROM tracks LIMIT 1
),
cohort_info AS (
    SELECT id as cohort_id FROM cohorts LIMIT 1
)
INSERT INTO student_enrollments (id, user_id, track_id, cohort_id, progress_percentage, created_at)
SELECT 
    gen_random_uuid(),
    student_info.user_id,
    track_info.track_id,
    cohort_info.cohort_id,
    0,
    NOW()
FROM student_info, track_info, cohort_info
WHERE NOT EXISTS (
    SELECT 1 FROM student_enrollments se 
    WHERE se.user_id = student_info.user_id
);

-- =============================================================================
-- STEP 6: Verification
-- =============================================================================

-- Check what was created
SELECT 'CONTENT_CREATED' as status,
       (SELECT COUNT(*) FROM tracks) as tracks,
       (SELECT COUNT(*) FROM cohorts) as cohorts,
       (SELECT COUNT(*) FROM weeks) as weeks,
       (SELECT COUNT(*) FROM lessons) as lessons,
       (SELECT COUNT(*) FROM assignments) as assignments,
       (SELECT COUNT(*) FROM student_enrollments) as enrollments;

-- Show sample data for testing
SELECT 'TEST_DATA_AVAILABLE' as info,
       'You can now test the system' as message,
       'Use admin interface to create more content' as next_step;

-- Show test student info
SELECT 'TEST_STUDENT' as info,
       email,
       full_name,
       'Use this student to test the system' as purpose
FROM profiles 
WHERE email = 'student@example.com';

-- Show available assignments for testing submissions
SELECT 'TEST_ASSIGNMENTS' as info,
       a.id,
       a.title,
       w.title as week_title,
       'Students can submit to these assignments' as purpose
FROM assignments a
JOIN weeks w ON w.id = a.week_id
LIMIT 3;