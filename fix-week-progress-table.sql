-- Check current structure of week_progress table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'week_progress'
ORDER BY ordinal_position;

-- Add created_at column if it doesn't exist
ALTER TABLE week_progress 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column if it doesn't exist
ALTER TABLE week_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'week_progress'
ORDER BY ordinal_position;
