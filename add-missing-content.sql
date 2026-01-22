-- Add Missing Lessons and Assignments to Existing Weeks

-- =============================================================================
-- Add Lessons to Week 1
-- =============================================================================

INSERT INTO lessons (id, week_id, title, type, content, order_index, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'HTML Fundamentals',
    'text',
    'Learn the basic structure of HTML documents, semantic elements, and best practices for creating well-structured web pages.',
    1,
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 1 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM lessons WHERE week_id = w.id AND title = 'HTML Fundamentals');

INSERT INTO lessons (id, week_id, title, type, content, order_index, created_at)
SELECT 
    gen_random_uuid(),
    w.id,
    'CSS Styling Basics',
    'text',
    'Introduction to CSS selectors, properties, and layout techniques including flexbox and grid.',
    2,
    NOW()
FROM weeks w
JOIN tracks t ON t.id = w.track_id
WHERE w.week_number = 1 
AND t.name = 'Full Stack Development'
AND NOT EXISTS (SELECT 1 FROM lessons WHERE week_id = w.id AND title = 'CSS Styling Basics');

-- =============================================================================
-- Add Assignments to Both Weeks
-- =============================================================================

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
-- Verification
-- =============================================================================

-- Show what we created
SELECT 'CONTENT_ADDED' as status,
       (SELECT COUNT(*) FROM lessons l JOIN weeks w ON l.week_id = w.id JOIN tracks t ON t.id = w.track_id WHERE t.name = 'Full Stack Development') as lessons_count,
       (SELECT COUNT(*) FROM assignments a JOIN weeks w ON a.week_id = w.id JOIN tracks t ON t.id = w.track_id WHERE t.name = 'Full Stack Development') as assignments_count;

-- Show the complete structure now
SELECT 'COMPLETE_STRUCTURE' as type,
       w.week_number,
       w.title as week_title,
       l.title as lesson_title,
       a.title as assignment_title
FROM tracks t
JOIN weeks w ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
WHERE t.name = 'Full Stack Development'
ORDER BY w.week_number, l.order_index;