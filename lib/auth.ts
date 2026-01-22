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
    console.log('User created successfully:', authData.user.id)
    
    // Wait for profile creation and automatic enrollment trigger to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if enrollment was created automatically by the trigger
    let enrollmentCheck = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('track_id', trackId)
      .eq('cohort_id', cohortId)
      .single()

    if (enrollmentCheck.error || !enrollmentCheck.data) {
      console.log('Automatic enrollment not found, creating manually...')
      
      // Fallback: Create enrollment manually if trigger didn't work
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert({
          user_id: authData.user.id,
          track_id: trackId,
          cohort_id: cohortId,
          progress_percentage: 0,
          tasks_completed: 0,
          total_tasks: 20,
          enrolled_at: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single()

      if (enrollmentError) {
        console.error('Failed to create manual enrollment:', enrollmentError)
        throw new Error(`Failed to create enrollment: ${enrollmentError.message}. Your account was created but enrollment failed. Please contact support.`)
      }

      console.log('Manual enrollment created successfully:', enrollmentData)
      
      // Initialize week progress manually
      try {
        const { data: weeks } = await supabase
          .from('weeks')
          .select('id, week_number, order_index')
          .eq('track_id', trackId)
          .order('order_index')

        if (weeks && weeks.length > 0) {
          const weekProgressData = weeks.map((week, index) => ({
            student_id: authData.user.id,
            week_id: week.id,
            status: index === 0 ? 'pending' : 'locked',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const { error: progressError } = await supabase
            .from('week_progress')
            .insert(weekProgressData)
          
          if (progressError) {
            console.warn('Failed to initialize week progress:', progressError)
          } else {
            console.log('Week progress initialized successfully')
          }
        }
      } catch (progressInitError) {
        console.warn('Error initializing week progress:', progressInitError)
      }
    } else {
      console.log('Automatic enrollment found:', enrollmentCheck.data)
    }
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