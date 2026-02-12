'use client'

import { createClient } from '@supabase/supabase-js'
import { logger } from "@/lib/logger"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

logger.log('🔧 Supabase client initialization')
logger.log('URL:', supabaseUrl)
logger.log('Key exists:', !!supabaseAnonKey)
logger.log('Key length:', supabaseAnonKey?.length)
logger.log('Running on:', typeof window !== 'undefined' ? 'client' : 'server')

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('❌ CRITICAL: Supabase credentials are missing!')
  logger.error('URL:', supabaseUrl)
  logger.error('Key:', supabaseAnonKey ? 'exists' : 'MISSING')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  }
})

logger.log('✅ Supabase client created:', typeof supabase)
logger.log('Has rpc method:', typeof supabase.rpc === 'function')

// Database types matching our schema
export interface User {
  id: string
  email?: string
  full_name: string
  role: 'student' | 'admin'
  profile_picture_url?: string
  bio?: string
  github_url?: string
  linkedin_url?: string
  created_at: string
}

export interface Track {
  id: string
  name: string
  description: string
  created_at: string
}

export interface Cohort {
  id: string
  name: string
  start_date: string
  end_date: string
  status: 'Active' | 'Upcoming' | 'Completed'
  created_at: string
}

export interface Week {
  id: string
  track_id: string
  week_number: number
  title: string
  description: string
  order_index: number
  created_at: string
  lessons?: Lesson[]
  assignment?: Assignment
}

export interface Lesson {
  id: string
  week_id: string
  title: string
  type: 'video' | 'text'
  duration?: string
  content?: string
  video_url?: string
  order_index: number
  created_at: string
}

export interface Assignment {
  id: string
  week_id: string
  title: string
  requirements: string[]
  deadline?: string
  created_at: string
}

export interface StudentEnrollment {
  id: string
  user_id: string
  track_id: string
  cohort_id: string
  progress_percentage: number
  tasks_completed: number
  total_tasks: number
  status: string
  enrolled_at: string
  user?: User
  track?: Track
  cohort?: Cohort
}

export interface TaskSubmission {
  id: string
  student_id: string
  assignment_id: string
  github_url?: string
  demo_url?: string
  notes?: string
  status: 'pending' | 'in_review' | 'approved' | 'needs_changes'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  feedback?: string
  grade?: string
  student?: User
  assignment?: Assignment & { week?: Week }
  files?: TaskSubmissionFile[]
}

export interface TaskSubmissionFile {
  id: string
  submission_id: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  uploaded_at: string
}

export interface WeekProgress {
  id: string
  student_id: string
  week_id: string
  status: 'locked' | 'pending' | 'approved'
  submitted_at?: string
  approved_at?: string
}

export interface Certificate {
  id: string
  student_id: string
  track_id: string
  cohort_id: string
  is_approved: boolean
  completion_date?: string
  certificate_file?: string
  tasks_completed: number
  total_tasks: number
  created_at: string
  approved_at?: string
  approved_by?: string
  student?: User
  track?: Track
  cohort?: Cohort
}

export interface AccountabilityPartner {
  id: string
  student1_id: string
  student2_id: string
  track_id: string
  cohort_id: string
  created_at: string
  student1?: User
  student2?: User
  track?: Track
  cohort?: Cohort
}

export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  type: 'text' | 'file' | 'image'
  file_name?: string
  file_size?: number
  image_url?: string
  timestamp: string
  sender?: User
}

export interface ClarityCallRequest {
  id: string
  student_id: string
  topic: string
  week_id: string
  preferred_date?: string
  preferred_time?: string
  status: 'pending' | 'scheduled' | 'completed' | 'rejected'
  notes?: string
  scheduled_date?: string
  meeting_link?: string
  mentor_notes?: string
  feedback?: string
  created_at: string
  student?: User
  week?: Week
}

export interface PaidLearnerWhitelist {
  id: string
  email: string
  track_id: string
  cohort_id: string
  status: 'active' | 'pending'
  added_date: string
  track?: Track
  cohort?: Cohort
}