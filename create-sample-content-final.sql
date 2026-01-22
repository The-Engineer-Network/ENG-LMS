-- Create Sample Content for Testing - Final Version
-- This includes all required columns based on the actual schema

-- =============================================================================
-- STEP 1: Create Sample Track and Cohort (if none exist)
-- =============================================================================

-- Create a sample track (only if no tracks exist)
INSERT INTO tracks (id, name, description, created_at)
SELECT 
    gen_random_uuid(),
    'Full Stack Development',
    'Complete web development track covering frontend and backend technologies',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tracks WHERE name = 'Full Stack Development');

-- Create a sample cohort with status (only if no cohorts exist)
INSERT INTO cohorts (id, name, status, start_date, end_date, created_at)
SELECT 
    gen_random_uuid(),
    'Cohort 2024-A',
    'active',
    '2024-01-01',
    '2024-06-30',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Cohort 2024-A');

-- =============================================================================
-- STEP 2: Create Sample Weeks (if none exist)
-- =============================================================================

-- Create weeks only if none exist
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

INSERT INTO weeks (id, track_id, week_number, title, description, created_at)
SELECT 
    gen_random_uuid(),
    t.id,
    2,
    'Advanced JavaScript',
    'Deep dive into JavaScript ES6+, async programming, and DOM manipulation',
    NOW()
FROM tracks t
WHERE t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM weeks WHERE week_number = 2 AND track_id = t.id);

-- =============================================================================
-- STEP 3: Create Sample Lessons (if none exist)
-- =============================================================================

-- Create lessons for week 1
INSERT INTO lessons (id, week_id, title, type, content, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'HTML Fundamentals',
    'text',
    'Learn the basic structure of HTML documents, semantic elements, and best practices for creating well-structured web pages.',
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 1 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM lessons WHERE week_id = w.id AND title = 'HTML Fundamentals');

INSERT INTO lessons (id, week_id, title, type, content, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'CSS Styling Basics',
    'text',
    'Introduction to CSS selectors, properties, and layout techniques including flexbox and grid.',
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 1 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM lessons WHERE week_id = w.id AND title = 'CSS Styling Basics');

-- =============================================================================
-- STEP 4: Create Sample Assignments (if none exist)
-- =============================================================================

-- Create assignment for week 1
INSERT INTO assignments (id, week_id, title, requirements, submission_guidelines, deadline, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'Build Your First Website',
    'Create a personal portfolio website using HTML and CSS. Include at least 3 pages: Home, About, and Contact.',
    'Submit your GitHub repository link and deployed website URL. Ensure your code is well-commented and follows best practices.',
    (NOW() + INTERVAL '7 days')::date,
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 1 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE week_id = w.id AND title = 'Build Your First Website');

-- Create assignment for week 2
INSERT INTO assignments (id, week_id, title, requirements, submission_guidelines, deadline, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'Interactive JavaScript Project',
    'Build an interactive web application using JavaScript. Include user input, DOM manipulation, and event handling.',
    'Submit GitHub repository with live demo. Include a README explaining your project and how to run it.',
    (NOW() + INTERVAL '14 days')::date,
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 2 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE week_id = w.id AND title = 'Interactive JavaScript Project');

-- =============================================================================
-- STEP 5: Create Sample Student Enrollment (if none exist)
-- =============================================================================

-- Create a test student profile (if needed)
INSERT INTO profiles (id, email, full_name, created_at)
SELECT 
    gen_random_uuid(),
    'student@example.com',
    'Test Student',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'student@example.com');

-- Enroll the student in the track
INSERT INTO student_enrollments (id, user_id, track_id, cohort_id, progress_percentage, created_at)
SELECT 
    gen_random_uuid(),
    p.id,
    t.id,
    c.id,
    0,
    NOW()
FROM profiles p, tracks t, cohorts c
WHERE p.email = 'student@example.com'
AND t.name = 'Full Stack Development'
AND c.name = 'Cohort 2024-A'
AND NOT EXISTS (
    SELECT 1 FROM student_enrollments se 
    WHERE se.user_id = p.id AND se.track_id = t.id
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

-- Show system readiness
SELECT 'SYSTEM_READY' as final_status,
       'Sample content created successfully' as message,
       'You can now test the complete admin-to-student workflow' as next_action;