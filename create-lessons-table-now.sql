-- Create lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('video', 'text')),
  duration VARCHAR,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lessons
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view lessons" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test insertion
INSERT INTO lessons (title, type, content, week_id, order_index)
SELECT 
    'Test Lesson - Setup',
    'text',
    'This is a test lesson to verify the table works',
    w.id,
    1
FROM weeks w
LIMIT 1
RETURNING id, title, created_at;