import { supabase } from './supabase'
import type { 
  Track, 
  Cohort, 
  Week, 
  StudentEnrollment, 
  TaskSubmission, 
  TaskSubmissionFile,
  WeekProgress, 
  Certificate, 
  AccountabilityPartner, 
  ChatMessage, 
  ClarityCallRequest, 
  PaidLearnerWhitelist,
  User
} from './supabase'

// Tracks
export async function getTracks(): Promise<Track[]> {
  console.log('getTracks: Starting function call')
  
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('name')

    console.log('getTracks: Supabase response:', { data, error, dataLength: data?.length })

    if (error) {
      console.error('getTracks: Database error:', error)
      throw error
    }
    
    console.log('getTracks: Returning data:', data)
    return data || []
  } catch (err) {
    console.error('getTracks: Caught exception:', err)
    throw err
  }
}

// Cohorts
export async function getCohorts(): Promise<Cohort[]> {
  console.log('getCohorts: Starting function call')
  
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .order('start_date')

    console.log('getCohorts: Supabase response:', { data, error, dataLength: data?.length })

    if (error) {
      console.error('getCohorts: Database error:', error)
      throw error
    }
    
    console.log('getCohorts: Returning data:', data)
    return data || []
  } catch (err) {
    console.error('getCohorts: Caught exception:', err)
    throw err
  }
}

// Weeks and Lessons
export async function getWeeksByTrack(trackId: string): Promise<Week[]> {
  const { data, error } = await supabase
    .from('weeks')
    .select(`
      *,
      lessons(*),
      assignments(*)
    `)
    .eq('track_id', trackId)
    .order('order_index')

  if (error) throw error
  return data || []
}

export async function getAllWeeks(): Promise<Week[]> {
  const { data, error } = await supabase
    .from('weeks')
    .select(`
      *,
      lessons(*),
      assignments(*),
      track:tracks(*)
    `)
    .order('track_id', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) throw error
  return data || []
}

// Assignments/Tasks
export async function getAssignmentsByTrack(trackId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      week:weeks(*)
    `)
    .eq('week.track_id', trackId)
    .order('week.order_index')

  if (error) throw error
  return data || []
}

export async function getAllAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      week:weeks(
        *,
        track:tracks(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Student Enrollments
export async function getStudentEnrollments(): Promise<StudentEnrollment[]> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      *,
      user:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .order('enrolled_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getStudentEnrollment(userId: string): Promise<StudentEnrollment | null> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      *,
      user:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

// Task Submissions
export async function getTaskSubmissions(): Promise<TaskSubmission[]> {
  const { data, error } = await supabase
    .from('task_submissions')
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getStudentSubmissions(studentId: string): Promise<TaskSubmission[]> {
  const { data, error } = await supabase
    .from('task_submissions')
    .select(`
      *,
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Week Progress
export async function getStudentWeekProgress(studentId: string): Promise<WeekProgress[]> {
  const { data, error } = await supabase
    .from('week_progress')
    .select('*')
    .eq('student_id', studentId)

  if (error) throw error
  return data || []
}

// Certificates
export async function getStudentCertificate(studentId: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      student:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .eq('student_id', studentId)
    .single()

  if (error) return null
  return data
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      student:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Accountability Partners
export async function getAccountabilityPartner(studentId: string): Promise<AccountabilityPartner | null> {
  const { data, error } = await supabase
    .from('accountability_partners')
    .select(`
      *,
      student1:student1_id(id, full_name, email),
      student2:student2_id(id, full_name, email),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .or(`student1_id.eq.${studentId},student2_id.eq.${studentId}`)
    .single()

  if (error) return null
  return data
}

export async function getAllAccountabilityPartners(): Promise<AccountabilityPartner[]> {
  const { data, error } = await supabase
    .from('accountability_partners')
    .select(`
      *,
      student1:student1_id(id, full_name, email),
      student2:student2_id(id, full_name, email),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Chat Messages
export async function getChatMessages(userId: string, partnerId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles!sender_id(*)
    `)
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data || []
}

export async function sendChatMessage(senderId: string, recipientId: string, content: string, type: 'text' | 'file' | 'image' = 'text') {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      type
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Clarity Call Requests
export async function getStudentClarityRequests(studentId: string): Promise<ClarityCallRequest[]> {
  const { data, error } = await supabase
    .from('clarity_call_requests')
    .select(`
      *,
      week:weeks(*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllClarityRequests(): Promise<ClarityCallRequest[]> {
  const { data, error } = await supabase
    .from('clarity_call_requests')
    .select(`
      *,
      student:profiles(*),
      week:weeks(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Paid Learner Whitelist
export async function getPaidLearnerWhitelist(): Promise<PaidLearnerWhitelist[]> {
  const { data, error } = await supabase
    .from('paid_learner_whitelist')
    .select(`
      *,
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .order('added_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function checkWhitelistStatus(email: string, trackId: string, cohortId: string): Promise<boolean> {
  const { data } = await supabase
    .from('paid_learner_whitelist')
    .select('id')
    .eq('email', email)
    .eq('track_id', trackId)
    .eq('cohort_id', cohortId)
    .eq('status', 'active')
    .single()

  return !!data
}

// Dashboard Data
export async function getAdminDashboardData() {
  // Get total students
  const { count: totalStudents } = await supabase
    .from('student_enrollments')
    .select('*', { count: 'exact', head: true })

  // Get students by track - using a different approach
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select(`
      track:tracks(name)
    `)

  const studentsByTrack = enrollments?.reduce((acc: any[], enrollment: any) => {
    const trackName = enrollment.track?.name
    if (trackName) {
      const existing = acc.find(item => item.track === trackName)
      if (existing) {
        existing.count++
      } else {
        acc.push({ track: trackName, count: 1 })
      }
    }
    return acc
  }, []) || []

  // Get pending submissions
  const { count: pendingSubmissions } = await supabase
    .from('task_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get approved certificates
  const { count: approvedCertificates } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)

  // Calculate overall completion rate
  const { data: submissionStats } = await supabase
    .from('task_submissions')
    .select('status')

  const totalSubmissions = submissionStats?.length || 0
  const approvedSubmissions = submissionStats?.filter(s => s.status === 'approved').length || 0
  const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0

  // Get track metrics
  const { data: trackMetrics } = await supabase
    .from('admin_dashboard_view')
    .select('*')

  const formattedTrackMetrics = trackMetrics?.map(track => ({
    track: track.track_name,
    completion: track.approval_rate || 0,
    tasks: `${track.approved_submissions || 0}/${track.total_assignments || 0}`
  })) || []

  return {
    totalStudents: totalStudents || 0,
    studentsByTrack: studentsByTrack || [],
    pendingSubmissions: pendingSubmissions || 0,
    approvedCertificates: approvedCertificates || 0,
    completionRate: completionRate,
    trackMetrics: formattedTrackMetrics
  }
}

export async function getStudentDashboardData(userId: string) {
  console.log('getStudentDashboardData called for userId:', userId)
  
  const enrollment = await getStudentEnrollment(userId)
  console.log('Student enrollment result:', enrollment)
  
  if (!enrollment) {
    console.log('No enrollment found for user:', userId)
    return null
  }

  const weekProgress = await getStudentWeekProgress(userId)
  const weeks = await getWeeksByTrack(enrollment.track_id)

  // Get task submissions with needs_changes status
  const { count: needsCorrection } = await supabase
    .from('task_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', userId)
    .eq('status', 'needs_changes')

  // Map weeks with progress status
  const weeksWithStatus = weeks.map((week, index) => {
    const progress = weekProgress.find(p => p.week_id === week.id)
    const isLocked = index > 0 && !weekProgress.find(p => p.week_id === weeks[index - 1].id && p.status === 'approved')
    
    let status = 'Locked'
    if (!isLocked) {
      if (progress?.status === 'approved') {
        status = 'Approved'
      } else if (progress?.status === 'pending') {
        status = 'Pending Review'
      } else {
        status = 'Pending Submission'
      }
    }

    return {
      week: week.week_number,
      title: week.title,
      status,
      submitted: !!progress?.submitted_at,
      locked: isLocked
    }
  })

  return {
    student: {
      name: enrollment.user?.full_name || '',
      track: enrollment.track?.name || '',
      cohort: enrollment.cohort?.name || '',
      progress: enrollment.progress_percentage,
      weekCount: weeks.length,
      completedWeeks: weekProgress.filter(p => p.status === 'approved').length,
      submissions: {
        approved: weekProgress.filter(p => p.status === 'approved').length,
        pending: weekProgress.filter(p => p.status === 'pending').length,
        needsCorrection: needsCorrection || 0
      }
    },
    weeks: weeksWithStatus
  }
}

// Profile Management
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Admin Settings
export async function getAdminSettings(cohortId?: string) {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('cohort_id', cohortId || '')
    .single()

  if (error) {
    // Return default settings if none exist
    return {
      cohort_id: cohortId,
      max_students: 50,
      tasks_per_track: 20,
      submission_deadline_days: 7,
      certificate_approval_required: true
    }
  }
  return data
}

export async function updateAdminSettings(cohortId: string, settings: any) {
  const { data, error } = await supabase
    .from('admin_settings')
    .upsert({
      cohort_id: cohortId,
      ...settings
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Student Management
export async function createStudentEnrollment(studentData: {
  email: string
  full_name: string
  track_id: string
  cohort_id: string
}) {
  // First create the user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      email: studentData.email,
      full_name: studentData.full_name
    })
    .select()
    .single()

  if (profileError) throw profileError

  // Then create the enrollment
  const { data, error } = await supabase
    .from('student_enrollments')
    .insert({
      user_id: profile.id,
      track_id: studentData.track_id,
      cohort_id: studentData.cohort_id,
      enrolled_at: new Date().toISOString()
    })
    .select(`
      *,
      user:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateStudentEnrollment(enrollmentId: string, updates: {
  track_id?: string
  cohort_id?: string
}) {
  const { data, error } = await supabase
    .from('student_enrollments')
    .update(updates)
    .eq('id', enrollmentId)
    .select(`
      *,
      user:profiles(*),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteStudentEnrollment(enrollmentId: string) {
  const { error } = await supabase
    .from('student_enrollments')
    .delete()
    .eq('id', enrollmentId)

  if (error) throw error
}

// Certificate Management
export async function uploadCertificateFile(certificateId: string, file: File) {
  const fileName = `certificate-${certificateId}-${Date.now()}.pdf`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName)

  // Update certificate record
  const { data, error } = await supabase
    .from('certificates')
    .update({
      certificate_file: urlData.publicUrl,
      is_approved: true,
      approved_at: new Date().toISOString()
    })
    .eq('id', certificateId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete certificate
export async function deleteCertificate(certificateId: string) {
  // First get the certificate to find the file path
  const { data: certificate, error: fetchError } = await supabase
    .from('certificates')
    .select('certificate_file')
    .eq('id', certificateId)
    .single()

  if (fetchError) throw fetchError

  // Delete file from storage if it exists
  if (certificate?.certificate_file) {
    // Extract filename from URL
    const fileName = certificate.certificate_file.split('/').pop()
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('certificates')
        .remove([fileName])
      
      if (storageError) {
        console.error('Error deleting certificate file:', storageError)
        // Continue with database deletion even if file deletion fails
      }
    }
  }

  // Delete certificate record
  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certificateId)

  if (error) throw error
}

// Week and Lesson Management
export async function createWeek(weekData: {
  title: string
  description: string
  track_id: string
  week_number: number
  order_index: number
}) {
  const { data, error } = await supabase
    .from('weeks')
    .insert(weekData)
    .select(`
      *,
      lessons(*),
      assignments(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateWeek(weekId: string, updates: {
  title?: string
  description?: string
  week_number?: number
  order_index?: number
}) {
  const { data, error } = await supabase
    .from('weeks')
    .update(updates)
    .eq('id', weekId)
    .select(`
      *,
      lessons(*),
      assignments(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function createLesson(lessonData: {
  title: string
  type: 'video' | 'text'
  content?: string
  video_url?: string
  duration?: string
  week_id: string
  order_index: number
}) {
  console.log('createLesson called with data:', lessonData)
  
  try {
    console.log('Making direct Supabase insert...')
    
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single()

    console.log('Direct insert response:', { data, error })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    console.log('Lesson created successfully:', data)
    return data
  } catch (err) {
    console.error('Error in createLesson function:', err)
    throw err
  }
}

export async function deleteWeek(weekId: string) {
  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', weekId)

  if (error) throw error
  return true
}

export async function updateLesson(lessonId: string, updates: {
  title?: string
  type?: 'video' | 'text'
  content?: string
  video_url?: string
  duration?: string
  order_index?: number
}) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)

  if (error) throw error
  return true
}

// Assignment/Task Management
export async function createAssignment(assignmentData: {
  title: string
  requirements?: string
  submission_guidelines?: string
  week_id: string
  deadline?: string
  video_guide?: string
  learning_materials?: any[]
}) {
  const { data, error } = await supabase
    .from('assignments')
    .insert(assignmentData)
    .select(`
      *,
      week:weeks(*)
    `)
    .single()

  if (error) throw error
  return data
}

// Clarity Call Management
export async function createClarityCallRequest(requestData: {
  student_id: string
  topic: string
  description: string
  week_id?: string
  preferred_time?: string
}) {
  const { data, error } = await supabase
    .from('clarity_call_requests')
    .insert({
      ...requestData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select(`
      *,
      student:profiles(*),
      week:weeks(*)
    `)
    .single()

  if (error) throw error
  return data
}

// Whitelist Management
export async function addWhitelistEntry(entryData: {
  email: string
  track_id: string
  cohort_id: string
}) {
  const { data, error } = await supabase
    .from('paid_learner_whitelist')
    .insert({
      ...entryData,
      status: 'active',
      added_date: new Date().toISOString()
    })
    .select(`
      *,
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function bulkAddWhitelistEntries(entries: Array<{
  email: string
  track_id: string
  cohort_id: string
}>) {
  const entriesWithDefaults = entries.map(entry => ({
    ...entry,
    status: 'active',
    added_date: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('paid_learner_whitelist')
    .insert(entriesWithDefaults)
    .select(`
      *,
      track:tracks(*),
      cohort:cohorts(*)
    `)

  if (error) throw error
  return data
}

// Remove whitelist entry
export async function removeWhitelistEntry(entryId: string) {
  const { error } = await supabase
    .from('paid_learner_whitelist')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}

// Submission Review
export async function updateSubmissionReview(submissionId: string, reviewData: {
  status: 'approved' | 'needs_changes' | 'in_review'
  feedback?: string
  grade?: string
  reviewed_by: string
}) {
  const { data, error } = await supabase
    .from('task_submissions')
    .update({
      ...reviewData,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)
    .single()

  if (error) throw error
  return data
}

// Get assignment by ID
export async function getAssignmentById(assignmentId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      week:weeks(
        *,
        track:tracks(*)
      )
    `)
    .eq('id', assignmentId)
    .single()

  if (error) throw error
  return data
}

// Get lesson by ID
export async function getLessonById(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      week:weeks(
        *,
        track:tracks(*)
      )
    `)
    .eq('id', lessonId)
    .single()

  if (error) throw error
  return data
}

// Create task submission
export async function createTaskSubmission(submissionData: {
  student_id: string
  assignment_id: string
  github_url: string
  demo_url?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('task_submissions')
    .insert({
      ...submissionData,
      status: 'in_review',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update task submission
export async function updateTaskSubmission(submissionId: string, updates: {
  github_url?: string
  demo_url?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('task_submissions')
    .update({
      ...updates,
      status: 'in_review',
      submitted_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get student's submission for an assignment
export async function getStudentSubmissionForAssignment(studentId: string, assignmentId: string) {
  const { data, error } = await supabase
    .from('task_submissions')
    .select(`
      *,
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)
    .eq('student_id', studentId)
    .eq('assignment_id', assignmentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
  return data
}

// Get week by ID with lessons and assignments
export async function getWeekById(weekId: string) {
  const { data, error } = await supabase
    .from('weeks')
    .select(`
      *,
      lessons(*),
      assignments(*)
    `)
    .eq('id', weekId)
    .single()

  if (error) throw error
  return data
}

// Cohort Management
export async function createCohort(cohortData: {
  name: string
  start_date: string
  end_date: string
  status?: string
}) {
  const { data, error } = await supabase
    .from('cohorts')
    .insert({
      ...cohortData,
      status: cohortData.status || 'Upcoming'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCohort(cohortId: string, updates: {
  name?: string
  start_date?: string
  end_date?: string
  status?: string
}) {
  const { data, error } = await supabase
    .from('cohorts')
    .update(updates)
    .eq('id', cohortId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCohort(cohortId: string) {
  const { error } = await supabase
    .from('cohorts')
    .delete()
    .eq('id', cohortId)

  if (error) throw error
}

// Track Management
export async function createTrack(trackData: {
  name: string
  description: string
}) {
  console.log('createTrack: Starting database insert with data:', trackData)
  
  try {
    const { data, error } = await supabase
      .from('tracks')
      .insert(trackData)
      .select()
      .single()

    console.log('createTrack: Supabase response:', { data, error })

    if (error) {
      console.error('createTrack: Database error:', error)
      throw error
    }
    
    console.log('createTrack: Success, returning data:', data)
    return data
  } catch (err) {
    console.error('createTrack: Caught exception:', err)
    throw err
  }
}

export async function updateTrack(trackId: string, trackData: {
  name: string
  description: string
}) {
  console.log('updateTrack: Starting database update with data:', { trackId, trackData })
  
  try {
    const { data, error } = await supabase
      .from('tracks')
      .update(trackData)
      .eq('id', trackId)
      .select()
      .single()

    console.log('updateTrack: Supabase response:', { data, error })

    if (error) {
      console.error('updateTrack: Database error:', error)
      throw error
    }
    
    console.log('updateTrack: Success, returning data:', data)
    return data
  } catch (err) {
    console.error('updateTrack: Caught exception:', err)
    throw err
  }
}

export async function deleteTrack(trackId: string) {
  console.log('deleteTrack: Starting database delete for trackId:', trackId)
  
  try {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)

    console.log('deleteTrack: Supabase response:', { error })

    if (error) {
      console.error('deleteTrack: Database error:', error)
      throw error
    }
    
    console.log('deleteTrack: Success')
    return true
  } catch (err) {
    console.error('deleteTrack: Caught exception:', err)
    throw err
  }
}

// Assignment Management
export async function updateAssignment(assignmentId: string, updates: {
  title?: string
  requirements?: string
  submission_guidelines?: string
  deadline?: string
  video_guide?: string
  learning_materials?: any[]
}) {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select(`
      *,
      week:weeks(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteAssignment(assignmentId: string) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) throw error
}

// Clarity Call Management
export async function updateClarityCallRequest(requestId: string, updates: {
  status?: 'pending' | 'scheduled' | 'completed' | 'rejected'
  scheduled_date?: string
  meeting_link?: string
  mentor_notes?: string
  feedback?: string
}) {
  const { data, error } = await supabase
    .from('clarity_call_requests')
    .update(updates)
    .eq('id', requestId)
    .select(`
      *,
      student:profiles(*),
      week:weeks(*)
    `)
    .single()

  if (error) throw error
  return data
}

// Accountability Partner Management
export async function createAccountabilityPartner(partnerData: {
  student1_id: string
  student2_id: string
  track_id: string
  cohort_id: string
}) {
  const { data, error } = await supabase
    .from('accountability_partners')
    .insert(partnerData)
    .select(`
      *,
      student1:student1_id(id, full_name, email),
      student2:student2_id(id, full_name, email),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateAccountabilityPartner(partnerId: string, updates: {
  student1_id?: string
  student2_id?: string
  track_id?: string
  cohort_id?: string
}) {
  const { data, error } = await supabase
    .from('accountability_partners')
    .update(updates)
    .eq('id', partnerId)
    .select(`
      *,
      student1:student1_id(id, full_name, email),
      student2:student2_id(id, full_name, email),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteAccountabilityPartner(partnerId: string) {
  const { error } = await supabase
    .from('accountability_partners')
    .delete()
    .eq('id', partnerId)

  if (error) throw error
}

// Reassign accountability partner
export async function reassignAccountabilityPartner(partnerId: string, newStudent1Id?: string, newStudent2Id?: string) {
  if (!newStudent1Id && !newStudent2Id) {
    throw new Error('At least one new student ID must be provided')
  }

  const updates: any = {}
  if (newStudent1Id) updates.student1_id = newStudent1Id
  if (newStudent2Id) updates.student2_id = newStudent2Id

  const { data, error } = await supabase
    .from('accountability_partners')
    .update(updates)
    .eq('id', partnerId)
    .select(`
      *,
      student1:student1_id(id, full_name, email),
      student2:student2_id(id, full_name, email),
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .single()

  if (error) throw error
  return data
}

// Auto-assign accountability partners
export async function autoAssignAccountabilityPartners(trackId: string, cohortId: string) {
  try {
    console.log('Auto-pairing for track:', trackId, 'cohort:', cohortId)
    
    // Get all students in the specified track and cohort who don't have partners
    const { data: students, error: studentsError } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('track_id', trackId)
      .eq('cohort_id', cohortId)
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      throw new Error('Failed to fetch students for pairing')
    }
    
    if (!students || students.length < 2) {
      throw new Error('No students found in this track and cohort combination. Please ensure students are enrolled before attempting auto-pairing.')
    }
    
    // Get existing partnerships to exclude already paired students
    const { data: existingPartners, error: partnersError } = await supabase
      .from('accountability_partners')
      .select('student1_id, student2_id')
      .eq('track_id', trackId)
      .eq('cohort_id', cohortId)
    
    if (partnersError) {
      console.error('Error fetching existing partners:', partnersError)
      throw new Error('Failed to check existing partnerships')
    }
    
    // Filter out students who already have partners
    const pairedStudentIds = new Set()
    existingPartners?.forEach(partner => {
      pairedStudentIds.add(partner.student1_id)
      pairedStudentIds.add(partner.student2_id)
    })
    
    const unpairedStudents = students.filter(student => 
      !pairedStudentIds.has(student.user_id)
    )
    
    if (unpairedStudents.length < 2) {
      throw new Error('Not enough unpaired students found. All eligible students may already be paired.')
    }
    
    // Create pairs from unpaired students
    const newPairs = []
    for (let i = 0; i < unpairedStudents.length - 1; i += 2) {
      const student1 = unpairedStudents[i]
      const student2 = unpairedStudents[i + 1]
      
      const pairData = {
        student1_id: student1.user_id,
        student2_id: student2.user_id,
        track_id: trackId,
        cohort_id: cohortId
      }
      
      const { data: newPair, error: pairError } = await supabase
        .from('accountability_partners')
        .insert(pairData)
        .select(`
          *,
          student1:student1_id(id, full_name, email),
          student2:student2_id(id, full_name, email),
          track:tracks(*),
          cohort:cohorts(*)
        `)
        .single()
      
      if (pairError) {
        console.error('Error creating pair:', pairError)
        continue // Skip this pair but continue with others
      }
      
      newPairs.push(newPair)
    }
    
    if (newPairs.length === 0) {
      throw new Error('Failed to create any partnerships. Please try again.')
    }
    
    console.log(`Successfully created ${newPairs.length} new partnerships`)
    return newPairs
    
  } catch (error) {
    console.error('Error in autoAssignAccountabilityPartners:', error)
    throw error
  }
}

// Enhanced Functions for New Features

// Student Achievements
export async function getStudentAchievements(studentId: string) {
  const { data, error } = await supabase
    .from('student_achievements')
    .select('*')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.error('Error fetching achievements:', error)
    // Return mock data as fallback
    return [
      { icon: "🎯", title: "First Submission", description: "Completed your first assignment", earned: true },
      { icon: "🚀", title: "Getting Started", description: "Completed 5 assignments", earned: false }
    ]
  }

  return data || []
}

// Draft Submissions
export async function saveDraftSubmission(studentId: string, assignmentId: string, formData: any) {
  const { data, error } = await supabase
    .from('draft_submissions')
    .upsert({
      student_id: studentId,
      assignment_id: assignmentId,
      github_url: formData.github,
      demo_url: formData.demo,
      notes: formData.notes,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// File Upload for Submissions
export async function uploadSubmissionFile(studentId: string, assignmentId: string, file: File, onProgress?: (progress: number) => void) {
  const fileName = `submissions/${studentId}/${assignmentId}/${Date.now()}-${file.name}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('submissions')
    .getPublicUrl(fileName)

  return {
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
    type: file.type
  }
}

// Admin Analytics
export async function getAdminAnalytics(dateRange: string = '30d') {
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Get submission metrics
  const { data: submissions } = await supabase
    .from('task_submissions')
    .select('*')
    .gte('submitted_at', startDate)

  const { data: allSubmissions } = await supabase
    .from('task_submissions')
    .select('*')

  // Get recent actions
  const { data: recentActions } = await supabase
    .from('recent_admin_actions')
    .select('*')
    .limit(10)

  const totalSubmissions = allSubmissions?.length || 0
  const recentSubmissions = submissions?.length || 0
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0
  const approvalRate = recentSubmissions > 0 ? Math.round((approvedSubmissions / recentSubmissions) * 100) : 0

  return {
    engagementMetrics: {
      totalSubmissions,
      recentSubmissions,
      approvalRate,
      avgSubmissionsPerDay: Math.round(recentSubmissions / days)
    },
    recentActions: recentActions || []
  }
}

// Bulk Operations
export async function bulkUpdateSubmissions(submissionIds: string[], action: string, reviewerId: string) {
  const updates: any = {
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString()
  }

  if (action === 'approve') {
    updates.status = 'approved'
    updates.feedback = 'Bulk approved'
  } else if (action === 'reject') {
    updates.status = 'needs_changes'
    updates.feedback = 'Please review and resubmit'
  }

  const { data, error } = await supabase
    .from('task_submissions')
    .update(updates)
    .in('id', submissionIds)
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)

  if (error) throw error
  return data
}

// Export Functions
export async function exportAdminReport(format: 'csv' | 'pdf' = 'csv') {
  const { data: submissions } = await supabase
    .from('task_submissions')
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)
    .order('submitted_at', { ascending: false })

  if (format === 'csv') {
    const csvContent = [
      ['Student', 'Assignment', 'Week', 'Status', 'Grade', 'Submitted At', 'Reviewed At'].join(','),
      ...(submissions || []).map(s => [
        s.student?.full_name || 'Unknown',
        s.assignment?.title || 'Unknown',
        s.assignment?.week?.week_number || 'N/A',
        s.status,
        s.grade || 'N/A',
        s.submitted_at,
        s.reviewed_at || 'N/A'
      ].join(','))
    ].join('\n')

    return {
      data: csvContent,
      type: 'text/csv',
      filename: `submissions-report-${new Date().toISOString().split('T')[0]}.csv`
    }
  }

  return {
    data: 'PDF generation not implemented',
    type: 'application/pdf',
    filename: `submissions-report-${new Date().toISOString().split('T')[0]}.pdf`
  }
}

export async function exportSubmissionsReport(filters: any = {}) {
  let query = supabase
    .from('task_submissions')
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        *,
        week:weeks(*)
      )
    `)

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.track && filters.track !== 'all') {
    query = query.eq('assignment.week.track_id', filters.track)
  }

  const { data: submissions } = await query.order('submitted_at', { ascending: false })

  const csvContent = [
    ['Student', 'Email', 'Assignment', 'Week', 'Track', 'Status', 'Grade', 'Submitted At', 'Reviewed At', 'Feedback'].join(','),
    ...(submissions || []).map(s => [
      s.student?.full_name || 'Unknown',
      s.student?.email || 'Unknown',
      s.assignment?.title || 'Unknown',
      s.assignment?.week?.week_number || 'N/A',
      s.assignment?.week?.track?.name || 'N/A',
      s.status,
      s.grade || 'N/A',
      s.submitted_at,
      s.reviewed_at || 'N/A',
      (s.feedback || '').replace(/,/g, ';')
    ].join(','))
  ].join('\n')

  return {
    data: csvContent,
    type: 'text/csv',
    filename: `submissions-filtered-${new Date().toISOString().split('T')[0]}.csv`
  }
}