import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin'
}

export async function signUp(email: string, password: string, fullName: string, trackId: string, cohortId: string) {
  // Check if user is in whitelist
  const { data: whitelistEntry } = await supabase
    .from('paid_learner_whitelist')
    .select('*')
    .eq('email', email)
    .eq('track_id', trackId)
    .eq('cohort_id', cohortId)
    .eq('status', 'active')
    .single()

  if (!whitelistEntry) {
    throw new Error('Email not found in whitelist or not approved for this track/cohort')
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (authError) throw authError

  if (authData.user) {
    // Create student enrollment
    const { error: enrollmentError } = await supabase
      .from('student_enrollments')
      .insert({
        user_id: authData.user.id,
        track_id: trackId,
        cohort_id: cohortId,
        progress_percentage: 0,
        tasks_completed: 0,
        total_tasks: 20
      })

    if (enrollmentError) throw enrollmentError
  }

  return authData
}

export async function signIn(email: string, password: string) {
  console.log('signIn function called with email:', email)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('Supabase signIn response:', { data, error })
  console.log('Data object details:', {
    hasData: !!data,
    hasUser: !!data?.user,
    hasSession: !!data?.session,
    user: data?.user,
    session: data?.session
  })

  if (error) {
    console.error('Supabase signIn error:', error)
    throw error
  }

  if (!data.user) {
    console.error('No user in signIn response data:', data)
    throw new Error('Authentication failed - no user data returned')
  }

  console.log('Returning data from signIn:', data)
  return { data, error: null }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists, check if user is admin and create profile
  if (!profile) {
    // Check if user is admin (manually created in Supabase)
    if (user.user_metadata?.role === 'admin' || user.email?.includes('admin')) {
      // Create admin profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Admin User',
          role: 'admin'
        })
        .select()
        .single()

      if (newProfile) {
        return {
          id: newProfile.id,
          email: user.email || '',
          full_name: newProfile.full_name,
          role: newProfile.role
        }
      }
    }
    return null
  }

  return {
    id: profile.id,
    email: user.email || '',
    full_name: profile.full_name,
    role: profile.role
  }
}

export async function getStudentEnrollment(userId: string) {
  const { data } = await supabase
    .from('student_enrollments')
    .select(`
      *,
      track:tracks(*),
      cohort:cohorts(*)
    `)
    .eq('user_id', userId)
    .single()

  return data
}