import { supabase } from './supabase-fixed'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin'
}

export async function signUp(email: string, password: string, fullName: string, trackId: string, cohortId: string) {
  try {
    // Check if user is in whitelist
    const { data: whitelistEntry, error: whitelistError } = await supabase
      .from('paid_learner_whitelist')
      .select('*')
      .eq('email', email)
      .eq('track_id', trackId)
      .eq('cohort_id', cohortId)
      .eq('status', 'active')
      .single()

    if (whitelistError || !whitelistEntry) {
      throw new Error('Email not found in whitelist or not approved for this track/cohort')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student'
        }
      }
    })

    if (authError) {
      throw new Error(authError.message || 'Failed to create account')
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup')
    }
    
    // CRITICAL: Create profile explicitly - this will trigger automatic enrollment
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: 'student'
        })
        .select()
        .single()

      if (profileError) {
        // Profile might already exist, try to fetch it
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        if (fetchError || !existingProfile) {
          // Continue anyway - we'll create enrollment manually
        }
      }
    } catch (profileErr: any) {
      // Continue anyway - enrollment might still work
    }
    
    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Check if enrollment was created automatically by the trigger
    const { data: enrollmentCheck, error: enrollmentCheckError } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('track_id', trackId)
      .eq('cohort_id', cohortId)
      .single()

    if (enrollmentCheckError || !enrollmentCheck) {
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
        throw new Error(`Account created but enrollment failed. Please contact support.`)
      }
      
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
            status: index === 0 ? 'pending' : 'locked'
          }))

          const { error: progressError } = await supabase
            .from('week_progress')
            .insert(weekProgressData)
          
          if (progressError) {
            // Week progress initialization failed, but continue
          }
        }
      } catch (progressInitError) {
        // Error initializing week progress, but continue
      }
    }

    return authData
  } catch (error: any) {
    throw error
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('Authentication failed - no user data returned')
  }

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