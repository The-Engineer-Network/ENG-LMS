-- ========================================
-- ADD SUPPORT FOR MULTIPLE VIDEOS AND LINKS
-- ========================================

-- 1. Update lessons table to support multiple video URLs (stored as JSON array)
-- Check if video_urls column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'video_urls'
  ) THEN
    ALTER TABLE lessons ADD COLUMN video_urls JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. Update assignments table to support multiple video guides and learning materials
-- Check if video_guides column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'video_guides'
  ) THEN
    ALTER TABLE assignments ADD COLUMN video_guides JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 3. Ensure learning_materials is JSONB (it might already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'learning_materials'
  ) THEN
    ALTER TABLE assignments ADD COLUMN learning_materials JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 4. Add resource_links column for additional links
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'resource_links'
  ) THEN
    ALTER TABLE lessons ADD COLUMN resource_links JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'resource_links'
  ) THEN
    ALTER TABLE assignments ADD COLUMN resource_links JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 5. Migrate existing single video_url to video_urls array (if data exists)
UPDATE lessons 
SET video_urls = jsonb_build_array(
  jsonb_build_object(
    'url', video_url,
    'title', 'Main Video',
    'duration', duration
  )
)
WHERE video_url IS NOT NULL 
  AND video_url != '' 
  AND (video_urls IS NULL OR video_urls = '[]'::jsonb);

-- 6. Migrate existing single video_guide to video_guides array (if data exists)
UPDATE assignments 
SET video_guides = jsonb_build_array(
  jsonb_build_object(
    'url', video_guide,
    'title', 'Assignment Guide'
  )
)
WHERE video_guide IS NOT NULL 
  AND video_guide != '' 
  AND (video_guides IS NULL OR video_guides = '[]'::jsonb);

-- 7. Add comments for documentation
COMMENT ON COLUMN lessons.video_urls IS 'Array of video objects: [{url, title, duration, thumbnail}]';
COMMENT ON COLUMN lessons.resource_links IS 'Array of resource link objects: [{url, title, description}]';
COMMENT ON COLUMN assignments.video_guides IS 'Array of video guide objects: [{url, title, duration}]';
COMMENT ON COLUMN assignments.resource_links IS 'Array of resource link objects: [{url, title, description}]';
COMMENT ON COLUMN assignments.learning_materials IS 'Array of learning material objects: [{url, title, type, description}]';

-- 8. Verify the changes
SELECT 
  'Schema Update Complete' as status,
  '✅ Multiple videos and links support added' as message;

-- Show updated structure
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('lessons', 'assignments')
  AND column_name IN ('video_urls', 'video_guides', 'resource_links', 'learning_materials')
ORDER BY table_name, column_name;
