import { supabase } from './supabase-fixed'
import { dataCache, CACHE_KEYS, CACHE_TTL } from './cache'
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
  
  // Check cache first
  const cached = dataCache.get<Track[]>(CACHE_KEYS.TRACKS)
  if (cached) {
    console.log('getTracks: Returning cached data')
    return cached
  }
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    const response = await fetch(`${url}/rest/v1/tracks?select=*&order=name`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })

    const data = await response.json()
    console.log('getTracks: HTTP response:', { dataLength: data?.length })

    const tracks = data || []
    // Cache for 5 minutes
    dataCache.set(CACHE_KEYS.TRACKS, tracks, CACHE_TTL.LONG)
    
    console.log('getTracks: Returning data:', tracks)
    return tracks
  } catch (err) {
    console.error('getTracks: Caught exception:', err)
    throw err
  }
}

// Cohorts
export async function getCohorts(): Promise<Cohort[]> {
  console.log('getCohorts: Starting function call')
  
  // Check cache first
  const cached = dataCache.get<Cohort[]>(CACHE_KEYS.COHORTS)
  if (cached) {
    console.log('getCohorts: Returning cached data')
    return cached
  }
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    const response = await fetch(`${url}/rest/v1/cohorts?select=*&order=start_date`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })

    const data = await response.json()
    console.log('getCohorts: HTTP response:', { dataLength: data?.length })

    const cohorts = data || []
    // Cache for 5 minutes
    dataCache.set(CACHE_KEYS.COHORTS, cohorts, CACHE_TTL.LONG)
    
    console.log('getCohorts: Returning data:', cohorts)
    return cohorts
  } catch (err) {
    console.error('getCohorts: Caught exception:', err)
    throw err
  }
}

// Weeks and Lessons
export async function getWeeksByTrack(trackId: string): Promise<Week[]> {
  console.log('getWeeksByTrack called for trackId:', trackId)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    // Fetch weeks first
    const weeksRes = await fetch(`${url}/rest/v1/weeks?track_id=eq.${trackId}&select=*&order=order_index`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })
    
    const weeks = await weeksRes.json()
    
    if (!weeks || weeks.length === 0) {
      console.log('No weeks found for track:', trackId)
      return []
    }

    // Get all week IDs
    const weekIds = weeks.map((w: any) => w.id).join(',')

    // Fetch lessons and assignments for these weeks in parallel
    const [lessonsRes, assignmentsRes] = await Promise.all([
      fetch(`${url}/rest/v1/lessons?week_id=in.(${weekIds})&select=*&order=order_index`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/assignments?week_id=in.(${weekIds})&select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
    ])

    // Parse responses with proper error handling
    let allLessons: any[] = []
    let allAssignments: any[] = []
    
    try {
      const lessonsData = await lessonsRes.json()
      allLessons = Array.isArray(lessonsData) ? lessonsData : []
    } catch (e) {
      console.error('Error parsing lessons:', e)
      allLessons = []
    }
    
    try {
      const assignmentsData = await assignmentsRes.json()
      allAssignments = Array.isArray(assignmentsData) ? assignmentsData : []
    } catch (e) {
      console.error('Error parsing assignments:', e)
      allAssignments = []
    }

    // Group lessons and assignments by week_id
    const lessonsByWeek = new Map()
    const assignmentsByWeek = new Map()
    
    allLessons.forEach((lesson: any) => {
      if (!lessonsByWeek.has(lesson.week_id)) {
        lessonsByWeek.set(lesson.week_id, [])
      }
      lessonsByWeek.get(lesson.week_id).push(lesson)
    })
    
    allAssignments.forEach((assignment: any) => {
      if (!assignmentsByWeek.has(assignment.week_id)) {
        assignmentsByWeek.set(assignment.week_id, [])
      }
      assignmentsByWeek.get(assignment.week_id).push(assignment)
    })

    // Attach lessons and assignments to weeks
    const weeksWithData = weeks.map((week: any) => ({
      ...week,
      lessons: lessonsByWeek.get(week.id) || [],
      assignments: assignmentsByWeek.get(week.id) || []
    }))

    console.log('getWeeksByTrack result:', { 
      weeksCount: weeksWithData.length, 
      lessonsCount: allLessons.length,
      assignmentsCount: allAssignments.length
    })

    return weeksWithData
  } catch (err) {
    console.error('getWeeksByTrack exception:', err)
    throw err
  }
}

export async function getAllWeeks(): Promise<Week[]> {
  // Check cache first
  const cached = dataCache.get<Week[]>(CACHE_KEYS.ALL_WEEKS)
  if (cached) {
    return cached
  }

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
  
  const weeks = data || []
  // Cache for 2 minutes
  dataCache.set(CACHE_KEYS.ALL_WEEKS, weeks, CACHE_TTL.MEDIUM)
  
  return weeks
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

// Get assignments for a specific student based on their enrollment
export async function getStudentAssignments(studentId: string) {
  console.log('getStudentAssignments called for studentId:', studentId)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    // First, get the student's enrollment to find their track
    const enrollmentResponse = await fetch(
      `${url}/rest/v1/student_enrollments?user_id=eq.${studentId}&select=track_id,cohort_id`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!enrollmentResponse.ok) {
      console.error('Failed to fetch enrollment')
      return []
    }
    
    const enrollments = await enrollmentResponse.json()
    if (!enrollments || enrollments.length === 0) {
      console.log('No enrollment found for student')
      return []
    }
    
    const trackId = enrollments[0].track_id
    console.log('Student track_id:', trackId)
    
    // Get all weeks for this track
    const weeksResponse = await fetch(
      `${url}/rest/v1/weeks?track_id=eq.${trackId}&select=id`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!weeksResponse.ok) {
      console.error('Failed to fetch weeks')
      return []
    }
    
    const weeks = await weeksResponse.json()
    const weekIds = weeks.map((w: any) => w.id)
    console.log('Week IDs for track:', weekIds)
    
    if (weekIds.length === 0) {
      console.log('No weeks found for track')
      return []
    }
    
    // Get all assignments for these weeks
    const assignmentsResponse = await fetch(
      `${url}/rest/v1/assignments?week_id=in.(${weekIds.join(',')})&select=*,week:weeks(id,week_number,title,track:tracks(id,name))&order=created_at.desc`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!assignmentsResponse.ok) {
      console.error('Failed to fetch assignments')
      return []
    }
    
    const assignments = await assignmentsResponse.json()
    console.log('Found assignments:', assignments.length)
    
    // Get student's submissions to mark which assignments are submitted
    const submissionsResponse = await fetch(
      `${url}/rest/v1/task_submissions?student_id=eq.${studentId}&select=assignment_id,status,submitted_at`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    const submissions = submissionsResponse.ok ? await submissionsResponse.json() : []
    const submissionMap = new Map(submissions.map((s: any) => [s.assignment_id, s]))
    
    // Combine assignments with submission status
    const assignmentsWithStatus = assignments.map((assignment: any) => {
      const submission = submissionMap.get(assignment.id)
      return {
        ...assignment,
        submission_status: submission?.status || null,
        submitted_at: submission?.submitted_at || null,
        has_submission: !!submission
      }
    })
    
    console.log('Assignments with status:', assignmentsWithStatus.length)
    return assignmentsWithStatus
  } catch (err: any) {
    console.error('Error in getStudentAssignments:', err)
    return []
  }
}

// Student Enrollments
export async function getStudentEnrollments(): Promise<StudentEnrollment[]> {
  console.log('getStudentEnrollments called')
  
  // Check cache first
  const cached = dataCache.get<StudentEnrollment[]>(CACHE_KEYS.STUDENTS)
  if (cached) {
    console.log('Returning cached student enrollments')
    return cached
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    // Fetch enrollments, profiles, tracks, and cohorts in parallel
    const [enrollmentsRes, profilesRes, tracksRes, cohortsRes] = await Promise.all([
      fetch(`${url}/rest/v1/student_enrollments?select=*&order=enrolled_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/profiles?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/tracks?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/cohorts?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
    ])

    const enrollments = await enrollmentsRes.json()
    const profiles = await profilesRes.json()
    const tracks = await tracksRes.json()
    const cohorts = await cohortsRes.json()

    // Create lookup maps for fast access
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])
    const trackMap = new Map(tracks?.map((t: any) => [t.id, t]) || [])
    const cohortMap = new Map(cohorts?.map((c: any) => [c.id, c]) || [])

    // Combine data
    const enrichedEnrollments = enrollments?.map((enrollment: any) => ({
      ...enrollment,
      user: profileMap.get(enrollment.user_id),
      track: trackMap.get(enrollment.track_id),
      cohort: cohortMap.get(enrollment.cohort_id)
    })) || []
    
    // Cache for 2 minutes
    dataCache.set(CACHE_KEYS.STUDENTS, enrichedEnrollments, CACHE_TTL.MEDIUM)
    
    console.log(`Loaded ${enrichedEnrollments.length} student enrollments`)
    return enrichedEnrollments
  } catch (error) {
    console.error('Error in getStudentEnrollments:', error)
    throw error
  }
}

export async function getStudentEnrollment(userId: string): Promise<StudentEnrollment | null> {
  console.log('getStudentEnrollment called for userId:', userId)
  
  try {
    // First get the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (enrollmentError || !enrollment) {
      console.error('getStudentEnrollment error:', enrollmentError)
      return null
    }

    // Then get related data separately
    const [profileResult, trackResult, cohortResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('tracks').select('*').eq('id', enrollment.track_id).single(),
      supabase.from('cohorts').select('*').eq('id', enrollment.cohort_id).single()
    ])

    const result = {
      ...enrollment,
      user: profileResult.data,
      track: trackResult.data,
      cohort: cohortResult.data
    }

    console.log('getStudentEnrollment result:', result)
    return result
  } catch (err) {
    console.error('getStudentEnrollment exception:', err)
    return null
  }
}

// Task Submissions
export async function getTaskSubmissions(): Promise<TaskSubmission[]> {
  console.log('getTaskSubmissions called')
  
  // Check cache first
  const cached = dataCache.get<TaskSubmission[]>(CACHE_KEYS.SUBMISSIONS)
  if (cached) {
    console.log('Returning cached submissions')
    return cached
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    // Fetch submissions with basic relations
    const response = await fetch(
      `${url}/rest/v1/task_submissions?select=*&order=submitted_at.desc`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch submissions:', response.status)
      return []
    }
    
    const submissions = await response.json()
    console.log('Fetched submissions:', submissions.length)
    
    if (submissions.length === 0) {
      return []
    }
    
    // Fetch related data separately
    const studentIds = [...new Set(submissions.map((s: any) => s.student_id))]
    const assignmentIds = [...new Set(submissions.map((s: any) => s.assignment_id))]
    
    // Fetch students
    const studentsResponse = await fetch(
      `${url}/rest/v1/profiles?id=in.(${studentIds.join(',')})&select=id,full_name,email`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    const students = studentsResponse.ok ? await studentsResponse.json() : []
    const studentMap = new Map(students.map((s: any) => [s.id, s]))
    
    // Fetch assignments with weeks
    const assignmentsResponse = await fetch(
      `${url}/rest/v1/assignments?id=in.(${assignmentIds.join(',')})&select=id,title,week_id`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : []
    const assignmentMap = new Map(assignments.map((a: any) => [a.id, a]))
    
    // Fetch weeks
    const weekIds = [...new Set(assignments.map((a: any) => a.week_id).filter(Boolean))]
    if (weekIds.length > 0) {
      const weeksResponse = await fetch(
        `${url}/rest/v1/weeks?id=in.(${weekIds.join(',')})&select=id,week_number,title,track_id`,
        {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        }
      )
      const weeks = weeksResponse.ok ? await weeksResponse.json() : []
      const weekMap = new Map(weeks.map((w: any) => [w.id, w]))
      
      // Fetch tracks
      const trackIds = [...new Set(weeks.map((w: any) => w.track_id).filter(Boolean))]
      if (trackIds.length > 0) {
        const tracksResponse = await fetch(
          `${url}/rest/v1/tracks?id=in.(${trackIds.join(',')})&select=id,name`,
          {
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`
            }
          }
        )
        const tracks = tracksResponse.ok ? await tracksResponse.json() : []
        const trackMap = new Map(tracks.map((t: any) => [t.id, t]))
        
        // Attach tracks to weeks
        weeks.forEach((week: any) => {
          week.track = trackMap.get(week.track_id)
        })
      }
      
      // Attach weeks to assignments
      assignments.forEach((assignment: any) => {
        assignment.week = weekMap.get(assignment.week_id)
      })
    }
    
    // Combine all data
    const enrichedSubmissions = submissions.map((sub: any) => ({
      ...sub,
      student: studentMap.get(sub.student_id),
      assignment: assignmentMap.get(sub.assignment_id)
    }))
    
    console.log('Enriched submissions:', enrichedSubmissions.length)
    
    // Cache for 30 seconds (frequently changing)
    dataCache.set(CACHE_KEYS.SUBMISSIONS, enrichedSubmissions, CACHE_TTL.SHORT)
    
    return enrichedSubmissions
  } catch (err: any) {
    console.error('Error in getTaskSubmissions:', err)
    return []
  }
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
  // Check cache first
  const cached = dataCache.get<PaidLearnerWhitelist[]>(CACHE_KEYS.WHITELIST)
  if (cached) {
    return cached
  }

  const { data, error } = await supabase
    .from('paid_learner_whitelist')
    .select(`
      *,
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .order('added_date', { ascending: false })

  if (error) throw error
  
  const whitelist = data || []
  // Cache for 2 minutes
  dataCache.set(CACHE_KEYS.WHITELIST, whitelist, CACHE_TTL.MEDIUM)
  
  return whitelist
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
  console.log('getAdminDashboardData called')
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    // OPTIMIZATION: Fetch all data in parallel
    const [enrollmentsRes, tracksRes, pendingRes, certificatesRes, submissionsRes, trackMetricsRes] = await Promise.all([
      // Get enrollments
      fetch(`${url}/rest/v1/student_enrollments?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      // Get all tracks
      fetch(`${url}/rest/v1/tracks?select=id,name`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      // Get pending submissions count
      fetch(`${url}/rest/v1/task_submissions?status=eq.pending&select=id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      // Get approved certificates count
      fetch(`${url}/rest/v1/certificates?is_approved=eq.true&select=id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      // Get all submissions for completion rate
      fetch(`${url}/rest/v1/task_submissions?select=status`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      // Get track metrics from view
      fetch(`${url}/rest/v1/admin_dashboard_view?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
    ])

    const enrollments = await enrollmentsRes.json()
    const tracks = await tracksRes.json()
    const pendingSubmissions = await pendingRes.json()
    const approvedCertificates = await certificatesRes.json()
    const submissionStats = await submissionsRes.json()
    const trackMetrics = await trackMetricsRes.json()

    // Create track map for quick lookup
    const trackMap = new Map(tracks?.map((t: any) => [t.id, t.name]) || [])

    // Calculate students by track
    const studentsByTrack = enrollments?.reduce((acc: any[], enrollment: any) => {
      const trackName = trackMap.get(enrollment.track_id)
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

    // Calculate completion rate
    const totalSubmissions = submissionStats?.length || 0
    const approvedSubmissions = submissionStats?.filter((s: any) => s.status === 'approved').length || 0
    const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0

    // Format track metrics
    const formattedTrackMetrics = trackMetrics?.map((track: any) => ({
      track: track.track_name,
      completion: track.approval_rate || 0,
      tasks: `${track.approved_submissions || 0}/${track.total_assignments || 0}`
    })) || []

    return {
      totalStudents: enrollments?.length || 0,
      studentsByTrack: studentsByTrack || [],
      pendingSubmissions: pendingSubmissions?.length || 0,
      approvedCertificates: approvedCertificates?.length || 0,
      completionRate: completionRate,
      trackMetrics: formattedTrackMetrics
    }
  } catch (error) {
    console.error('Error in getAdminDashboardData:', error)
    throw error
  }
}

export async function getStudentDashboardData(userId: string) {
  console.log('getStudentDashboardData called for userId:', userId)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    // Fetch enrollment first
    const enrollmentRes = await fetch(
      `${url}/rest/v1/student_enrollments?user_id=eq.${userId}&select=*`,
      {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }
    )
    
    const enrollments = await enrollmentRes.json()
    const enrollment = Array.isArray(enrollments) && enrollments.length > 0 ? enrollments[0] : null
    
    if (!enrollment) {
      console.log('No enrollment found for user:', userId)
      return null
    }

    // Fetch all related data in parallel
    const [userRes, trackRes, cohortRes, weekProgressRes, needsCorrectionRes, weeksRes] = await Promise.all([
      fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=id,full_name,email`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/tracks?id=eq.${enrollment.track_id}&select=id,name`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/cohorts?id=eq.${enrollment.cohort_id}&select=id,name`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/week_progress?student_id=eq.${userId}&select=week_id,status,submitted_at,approved_at`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/task_submissions?student_id=eq.${userId}&status=eq.needs_changes&select=id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/weeks?track_id=eq.${enrollment.track_id}&select=id,week_number,title,order_index&order=order_index`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
    ])

    const user = (await userRes.json())[0]
    const track = (await trackRes.json())[0]
    const cohort = (await cohortRes.json())[0]
    const weekProgress = await weekProgressRes.json()
    const needsCorrection = (await needsCorrectionRes.json()).length
    const weeks = await weeksRes.json()

    // Map weeks with progress status (optimized)
    const progressMap = new Map(weekProgress.map((p: any) => [p.week_id, p]))
    const weeksWithStatus = weeks?.map((week: any, index: number) => {
      const progress = progressMap.get(week.id)
      const prevWeek = index > 0 ? weeks[index - 1] : null
      const prevProgress = prevWeek ? progressMap.get(prevWeek.id) : null
      const isLocked = index > 0 && prevProgress?.status !== 'approved'
      
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
        id: week.id,
        week: week.week_number,
        title: week.title,
        status,
        submitted: !!progress?.submitted_at,
        locked: isLocked
      }
    }) || []

    const approvedCount = weekProgress.filter((p: any) => p.status === 'approved').length
    const pendingCount = weekProgress.filter((p: any) => p.status === 'pending').length

    return {
      student: {
        name: user?.full_name || '',
        track: track?.name || '',
        cohort: cohort?.name || '',
        progress: enrollment.progress_percentage || 0,
        weekCount: weeks?.length || 0,
        completedWeeks: approvedCount,
        submissions: {
          approved: approvedCount,
          pending: pendingCount,
          needsCorrection: needsCorrection
        }
      },
      weeks: weeksWithStatus
    }
  } catch (error) {
    console.error('Error in getStudentDashboardData:', error)
    throw error
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
  
  // Invalidate weeks cache
  dataCache.invalidate(CACHE_KEYS.ALL_WEEKS)
  dataCache.invalidate(CACHE_KEYS.WEEKS_BY_TRACK(weekData.track_id))
  
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
  video_urls?: any[]
  resource_links?: any[]
  duration?: string
  week_id: string
  order_index: number
}) {
  console.log('createLesson called with data:', lessonData)
  
  try {
    console.log('Attempting direct insert to lessons table...')
    
    // Try direct fetch to Supabase REST API as a workaround
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    console.log('Using direct HTTP request...')
    
    const response = await fetch(`${url}/rest/v1/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(lessonData)
    })
    
    console.log('HTTP response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('HTTP request failed:', errorText)
      throw new Error(`Failed to create lesson: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Lesson created successfully via HTTP:', data)
    
    // Invalidate weeks cache
    dataCache.invalidate(CACHE_KEYS.ALL_WEEKS)
    
    return Array.isArray(data) ? data[0] : data
  } catch (err: any) {
    console.error('Error in createLesson:', err)
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
  video_urls?: any[]
  resource_links?: any[]
  duration?: string
  order_index?: number
}) {
  console.log('updateLesson called with:', { lessonId, updates })
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    console.log('Using direct HTTP request for update...')
    
    const response = await fetch(`${url}/rest/v1/lessons?id=eq.${lessonId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    })
    
    console.log('HTTP response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('HTTP request failed:', errorText)
      throw new Error(`Failed to update lesson: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Lesson updated successfully via HTTP:', data)
    
    // Invalidate weeks cache
    dataCache.invalidate(CACHE_KEYS.ALL_WEEKS)
    
    return Array.isArray(data) ? data[0] : data
  } catch (err: any) {
    console.error('Error in updateLesson:', err)
    throw err
  }
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
  
  // Invalidate whitelist cache
  dataCache.invalidate(CACHE_KEYS.WHITELIST)
  
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
  console.log('updateSubmissionReview called:', { submissionId, reviewData })
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    const payload = {
      ...reviewData,
      reviewed_at: new Date().toISOString()
    }
    
    const response = await fetch(
      `${url}/rest/v1/task_submissions?id=eq.${submissionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update review:', errorText)
      throw new Error(`Failed to update review: ${response.status}`)
    }
    
    const data = await response.json()
    const submission = Array.isArray(data) ? data[0] : data
    
    console.log('Review updated successfully:', submission)
    return submission
  } catch (err: any) {
    console.error('Error in updateSubmissionReview:', err)
    throw err
  }
}

// Get assignment by ID
export async function getAssignmentById(assignmentId: string) {
  console.log('getAssignmentById called for assignmentId:', assignmentId)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    const response = await fetch(
      `${url}/rest/v1/assignments?id=eq.${assignmentId}&select=*,week:weeks(*,track:tracks(*))`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch assignment:', errorText)
      throw new Error(`Failed to fetch assignment: ${response.status}`)
    }
    
    const data = await response.json()
    const assignment = Array.isArray(data) ? data[0] : data
    
    console.log('getAssignmentById result:', assignment)
    return assignment
  } catch (err: any) {
    console.error('Error in getAssignmentById:', err)
    throw err
  }
}

// Get lesson by ID
export async function getLessonById(lessonId: string) {
  console.log('getLessonById called for lessonId:', lessonId)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    // Fetch lesson with week and track data
    const response = await fetch(
      `${url}/rest/v1/lessons?id=eq.${lessonId}&select=*,week:weeks(*,track:tracks(*))`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch lesson:', errorText)
      throw new Error(`Failed to fetch lesson: ${response.status}`)
    }
    
    const data = await response.json()
    const lesson = Array.isArray(data) ? data[0] : data
    
    console.log('getLessonById result:', { 
      lesson, 
      hasVideoUrls: !!lesson?.video_urls,
      videoUrlsCount: lesson?.video_urls?.length || 0,
      hasResourceLinks: !!lesson?.resource_links,
      resourceLinksCount: lesson?.resource_links?.length || 0
    })
    
    return lesson
  } catch (err: any) {
    console.error('Error in getLessonById:', err)
    throw err
  }
}

// Create task submission
export async function createTaskSubmission(submissionData: {
  student_id: string
  assignment_id: string
  github_url: string
  demo_url?: string
  notes?: string
}) {
  console.log('createTaskSubmission called with:', submissionData)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    // Use anon key since RLS is disabled on task_submissions
    const token = key
    
    const payload = {
      ...submissionData,
      status: 'in_review',
      submitted_at: new Date().toISOString()
    }
    
    console.log('Submitting to task_submissions:', payload)
    
    const response = await fetch(
      `${url}/rest/v1/task_submissions`,
      {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create submission:', errorText)
      throw new Error(`Failed to create submission: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    const submission = Array.isArray(data) ? data[0] : data
    
    console.log('Submission created successfully:', submission)
    return submission
  } catch (err: any) {
    console.error('Error in createTaskSubmission:', err)
    throw err
  }
}

// Update task submission
export async function updateTaskSubmission(submissionId: string, updates: {
  github_url?: string
  demo_url?: string
  notes?: string
}) {
  console.log('updateTaskSubmission called with:', { submissionId, updates })
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    // Use anon key since RLS is disabled on task_submissions
    const token = key
    
    const payload = {
      ...updates,
      status: 'in_review',
      submitted_at: new Date().toISOString()
    }
    
    const response = await fetch(
      `${url}/rest/v1/task_submissions?id=eq.${submissionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update submission:', errorText)
      throw new Error(`Failed to update submission: ${response.status}`)
    }
    
    const data = await response.json()
    const submission = Array.isArray(data) ? data[0] : data
    
    console.log('Submission updated successfully:', submission)
    return submission
  } catch (err: any) {
    console.error('Error in updateTaskSubmission:', err)
    throw err
  }
}

// Get student's submission for an assignment
export async function getStudentSubmissionForAssignment(studentId: string, assignmentId: string) {
  console.log('getStudentSubmissionForAssignment called:', { studentId, assignmentId })
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
    const response = await fetch(
      `${url}/rest/v1/task_submissions?student_id=eq.${studentId}&assignment_id=eq.${assignmentId}&select=*,assignment:assignments(*,week:weeks(*))`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch submission')
      return null
    }
    
    const data = await response.json()
    const submission = Array.isArray(data) && data.length > 0 ? data[0] : null
    
    console.log('Found existing submission:', submission)
    return submission
  } catch (err: any) {
    console.error('Error in getStudentSubmissionForAssignment:', err)
    return null
  }
}

// Get week by ID with lessons and assignments
export async function getWeekById(weekId: string) {
  console.log('getWeekById called for weekId:', weekId)
  
  try {
    const { data, error } = await supabase
      .from('weeks')
      .select(`
        *,
        lessons(*),
        assignments(*),
        track:tracks(*)
      `)
      .eq('id', weekId)
      .single()

    console.log('getWeekById result:', { 
      data, 
      error,
      lessonsCount: data?.lessons?.length || 0 
    })

    if (error) {
      console.error('getWeekById error:', error)
      throw error
    }
    
    return data
  } catch (err) {
    console.error('getWeekById exception:', err)
    throw err
  }
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
    
    // Invalidate tracks cache
    dataCache.invalidate(CACHE_KEYS.TRACKS)
    
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
    
    // Invalidate tracks cache
    dataCache.invalidate(CACHE_KEYS.TRACKS)
    dataCache.invalidatePattern(`weeks_track_${trackId}`)
    
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
    
    // Invalidate tracks cache
    dataCache.invalidate(CACHE_KEYS.TRACKS)
    dataCache.invalidatePattern(`weeks_track_${trackId}`)
    
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
  console.log('getAdminAnalytics called with dateRange:', dateRange)
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }

    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // OPTIMIZATION: Fetch all data in parallel
    const [recentSubmissionsRes, allSubmissionsRes, recentActionsRes] = await Promise.all([
      fetch(`${url}/rest/v1/task_submissions?submitted_at=gte.${startDate}&select=status`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/task_submissions?select=id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }),
      fetch(`${url}/rest/v1/recent_admin_actions?select=*&limit=10`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
    ])

    const recentSubmissions = await recentSubmissionsRes.json()
    const allSubmissions = await allSubmissionsRes.json()
    const recentActions = await recentActionsRes.json()

    const totalSubmissions = allSubmissions?.length || 0
    const recentCount = recentSubmissions?.length || 0
    const approvedSubmissions = recentSubmissions?.filter((s: any) => s.status === 'approved').length || 0
    const approvalRate = recentCount > 0 ? Math.round((approvedSubmissions / recentCount) * 100) : 0

    return {
      engagementMetrics: {
        totalSubmissions,
        recentSubmissions: recentCount,
        approvalRate,
        avgSubmissionsPerDay: Math.round(recentCount / days)
      },
      recentActions: recentActions || []
    }
  } catch (error) {
    console.error('Error in getAdminAnalytics:', error)
    // Return default values on error
    return {
      engagementMetrics: {
        totalSubmissions: 0,
        recentSubmissions: 0,
        approvalRate: 0,
        avgSubmissionsPerDay: 0
      },
      recentActions: []
    }
  }
}

// Bulk Operations
export async function bulkUpdateSubmissions(submissionIds: string[], action: string, reviewerId: string) {
  console.log('bulkUpdateSubmissions called:', { submissionIds, action, reviewerId })
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials')
    }
    
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
    } else if (action === 'review') {
      updates.status = 'in_review'
      updates.feedback = 'Under review'
    }
    
    // Update each submission individually using HTTP fetch
    const updatePromises = submissionIds.map(async (submissionId) => {
      const response = await fetch(
        `${url}/rest/v1/task_submissions?id=eq.${submissionId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updates)
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to update submission ${submissionId}:`, errorText)
        throw new Error(`Failed to update submission: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data[0] : data
    })
    
    const results = await Promise.all(updatePromises)
    console.log('Bulk update completed:', results.length, 'submissions updated')
    return results
  } catch (err: any) {
    console.error('Error in bulkUpdateSubmissions:', err)
    throw err
  }
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