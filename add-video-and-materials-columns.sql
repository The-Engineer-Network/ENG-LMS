-- Add missing columns to assignments table for video guides and learning materials
-- This will enable storing video guides and learning materials for assignments

-- Add video_guide column (for storing video URLs)
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS video_guide TEXT;

-- Add learning_materials column (for storing JSON array of links and images)
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS learning_materials JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the columns
COMMENT ON COLUMN assignments.video_guide IS 'URL for video guide/tutorial for this assignment';
COMMENT ON COLUMN assignments.learning_materials IS 'JSON array of learning materials (links, images, etc.)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assignments' 
AND column_name IN ('video_guide', 'learning_materials')
ORDER BY column_name;

SELECT 'ASSIGNMENT COLUMNS ADDED - Video guides and learning materials now supported' as status;