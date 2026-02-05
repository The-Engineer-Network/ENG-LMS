-- Add missing completed_at column to week_progress table

-- Check current structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'week_progress'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add completed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'week_progress' 
        AND column_name = 'completed_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE week_progress 
        ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE '✓ Added completed_at column to week_progress';
    ELSE
        RAISE NOTICE '⚠ completed_at column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'week_progress'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✓ week_progress table updated. Try reviewing a submission again.' as status;
