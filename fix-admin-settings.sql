-- Fix admin settings system
-- 1. Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  cohort_name VARCHAR,
  max_students INTEGER DEFAULT 50,
  tasks_per_track INTEGER DEFAULT 20,
  submission_deadline_days INTEGER DEFAULT 7,
  certificate_approval_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for admin_settings
DROP POLICY IF EXISTS "Authenticated users can view admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated users can manage admin_settings" ON admin_settings;

CREATE POLICY "Authenticated users can view admin_settings" ON admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create default admin settings
INSERT INTO admin_settings (
  cohort_name,
  max_students,
  tasks_per_track,
  submission_deadline_days,
  certificate_approval_required
) VALUES (
  'Default Settings',
  50,
  20,
  7,
  true
) ON CONFLICT (id) DO NOTHING;

-- 5. Check results
SELECT * FROM admin_settings;