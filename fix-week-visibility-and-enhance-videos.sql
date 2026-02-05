-- ========================================
-- FIX WEEK VISIBILITY AND ENHANCE VIDEO SUPPORT
-- ========================================

-- PART 1: Add support for multiple videos and links
-- ========================================

-- 1. Add video_urls column to lessons (array of video objects)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'video_urls'
  ) THEN
    ALTER TABLE lessons ADD COLUMN video_urls JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN lessons.video_urls IS 'Array of video objects: [{url, title, duration, thumbnail}]';
  END IF;
END $$;

-- 2. Add resource_links column to lessons
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'resource_links'
  ) THEN
    ALTER TABLE lessons ADD COLUMN resource_links JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN lessons.resource_links IS 'Array of resource link objects: [{url, title, description}]';
  END IF;
END $$;

-- 3. Add video_guides column to assignments (array of video objects)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'video_guides'
  ) THEN
    ALTER TABLE assignments ADD COLUMN video_guides JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN assignments.video_guides IS 'Array of video guide objects: [{url, title, duration}]';
  END IF;
END $$;

-- 4. Add resource_links column to assignments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'resource_links'
  ) THEN
    ALTER TABLE assignments ADD COLUMN resource_links JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN assignments.resource_links IS 'Array of resource link objects: [{url, title, description}]';
  END IF;
END $$;

-- 5. Ensure learning_materials column exists and is JSONB
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'learning_materials'
  ) THEN
    ALTER TABLE assignments ADD COLUMN learning_materials JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN assignments.learning_materials IS 'Array of learning material objects: [{url, title, type, description}]';
  END IF;
END $$;

-- 6. Migrate existing single video_url to video_urls array (if data exists)
UPDATE lessons 
SET video_urls = jsonb_build_array(
  jsonb_build_object(
    'url', video_url,
    'title', 'Main Video',
    'duration', COALESCE(duration, ''),
    'thumbnail', ''
  )
)
WHERE video_url IS NOT NULL 
  AND video_url != '' 
  AND (video_urls IS NULL OR video_urls = '[]'::jsonb);

-- 7. Migrate existing single video_guide to video_guides array (if data exists)
UPDATE assignments 
SET video_guides = jsonb_build_array(
  jsonb_build_object(
    'url', video_guide,
    'title', 'Assignment Guide',
    'duration', ''
  )
)
WHERE video_guide IS NOT NULL 
  AND video_guide != '' 
  AND (video_guides IS NULL OR video_guides = '[]'::jsonb);

-- PART 2: Verify week visibility
-- ========================================

-- Check RLS policies on weeks table
SELECT 
  'Weeks RLS Policies' as check_type,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'weeks';

-- Ensure weeks are visible to all authenticated users
DROP POLICY IF EXISTS "Anyone can view weeks" ON weeks;
CREATE POLICY "Anyone can view weeks"
  ON weeks FOR SELECT
  USING (true);

-- Ensure lessons are visible to all authenticated users
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- Ensure assignments are visible to all authenticated users
DROP POLICY IF EXISTS "Anyone can view assignments" ON assignments;
CREATE POLICY "Anyone can view assignments"
  ON assignments FOR SELECT
  USING (true);

-- PART 3: Verification
-- ========================================

SELECT 
  '========================================' as separator,
  'VERIFICATION RESULTS' as title,
  '========================================' as separator2;

-- Show updated schema
SELECT 
  'Schema Update' as check_type,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('lessons', 'assignments')
  AND column_name IN ('video_urls', 'video_guides', 'resource_links', 'learning_materials')
ORDER BY table_name, column_name;

-- Show sample data
SELECT 
  'Sample Lessons' as check_type,
  id,
  title,
  type,
  video_url,
  video_urls,
  resource_links
FROM lessons
LIMIT 3;

-- Show sample assignments
SELECT 
  'Sample Assignments' as check_type,
  id,
  title,
  video_guide,
  video_guides,
  resource_links,
  learning_materials
FROM assignments
LIMIT 3;

SELECT 
  '✅ Schema updated successfully!' as status,
  'Multiple videos and links support added' as message;
