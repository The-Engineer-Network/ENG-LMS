"use client"

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, User, Mail, BookOpen, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import EnrollmentStatus from '../../components/EnrollmentStatus'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestEnrollmentPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [testUserId, setTestUserId] = useState<string>('')

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, status, message, data }])
  }

  const runEnrollmentTests = async () => {
    setLoading(true)
    setTestResults([])

    try {
      // Test 1: Check if automatic enrollment trigger exists
      addTestResult('trigger-check', 'pending', 'Checking automatic enrollment trigger...')
      
      const { data: triggerExists, error: triggerError } = await supabase
        .rpc('check_trigger_exists', { trigger_name: 'trigger_automatic_enrollment' })
      
      if (triggerError) {
        addTestResult('trigger-check', 'error', `Trigger check failed: ${triggerError.message}`)
      } else {
        addTestResult('trigger-check', triggerExists ? 'success' : 'error', 
          triggerExists ? 'Automatic enrollment trigger exists' : 'Automatic enrollment trigger missing')
      }

      // Test 2: Check RLS policies
      addTestResult('rls-check', 'pending', 'Checking RLS policies...')
      
      const { data: policiesData, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .in('tablename', ['student_enrollments', 'profiles', 'week_progress'])
      
      if (policiesError) {
        addTestResult('rls-check', 'error', `RLS check failed: ${policiesError.message}`)
      } else {
        addTestResult('rls-check', 'success', `Found ${policiesData?.length || 0} RLS policies`, policiesData)
      }

      // Test 3: Check sample data exists
      addTestResult('data-check', 'pending', 'Checking sample data...')
      
      const [tracksResult, cohortsResult, whitelistResult] = await Promise.all([
        supabase.from('tracks').select('*').limit(5),
        supabase.from('cohorts').select('*').limit(5),
        supabase.from('paid_learner_whitelist').select('*').limit(5)
      ])

      if (tracksResult.error || cohortsResult.error || whitelistResult.error) {
        addTestResult('data-check', 'error', 'Failed to fetch sample data')
      } else {
        addTestResult('data-check', 'success', 
          `Found ${tracksResult.data?.length || 0} tracks, ${cohortsResult.data?.length || 0} cohorts, ${whitelistResult.data?.length || 0} whitelist entries`
        )
      }

      // Test 4: Test enrollment function
      addTestResult('function-test', 'pending', 'Testing manual enrollment function...')
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('enroll_existing_whitelisted_users')
      
      if (functionError) {
        addTestResult('function-test', 'error', `Function test failed: ${functionError.message}`)
      } else {
        addTestResult('function-test', 'success', `Manual enrollment function works. Found ${functionResult?.length || 0} users to enroll`)
      }

      // Test 5: Check existing enrollments
      addTestResult('enrollment-check', 'pending', 'Checking existing enrollments...')
      
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          profile:profiles(full_name, email),
          track:tracks(name),
          cohort:cohorts(name)
        `)
        .limit(10)
      
      if (enrollmentsError) {
        addTestResult('enrollment-check', 'error', `Enrollment check failed: ${enrollmentsError.message}`)
      } else {
        addTestResult('enrollment-check', 'success', `Found ${enrollmentsData?.length || 0} existing enrollments`, enrollmentsData)
      }

    } catch (error: any) {
      addTestResult('general-error', 'error', `Test suite failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    
    try {
      // Create a test whitelist entry first
      const testEmail = `test-${Date.now()}@example.com`
      
      // Get first available track and cohort
      const { data: tracks } = await supabase.from('tracks').select('*').limit(1)
      const { data: cohorts } = await supabase.from('cohorts').select('*').limit(1)
      
      if (!tracks?.length || !cohorts?.length) {
        addTestResult('test-user', 'error', 'No tracks or cohorts available for testing')
        return
      }

      // Create whitelist entry
      const { error: whitelistError } = await supabase
        .from('paid_learner_whitelist')
        .insert({
          email: testEmail,
          track_id: tracks[0].id,
          cohort_id: cohorts[0].id,
          status: 'active'
        })

      if (whitelistError) {
        addTestResult('test-user', 'error', `Failed to create whitelist entry: ${whitelistError.message}`)
        return
      }

      // Create test profile (this should trigger automatic enrollment)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: testEmail,
          full_name: 'Test User',
          role: 'student'
        })
        .select()
        .single()

      if (profileError) {
        addTestResult('test-user', 'error', `Failed to create test user: ${profileError.message}`)
        return
      }

      setTestUserId(profileData.id)
      addTestResult('test-user', 'success', `Created test user: ${testEmail}`)

      // Wait a moment for trigger to process
      setTimeout(async () => {
        // Check if enrollment was created
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('student_enrollments')
          .select('*')
          .eq('user_id', profileData.id)

        if (enrollmentError) {
          addTestResult('auto-enrollment', 'error', `Failed to check enrollment: ${enrollmentError.message}`)
        } else if (enrollmentData?.length > 0) {
          addTestResult('auto-enrollment', 'success', 'Automatic enrollment successful!')
        } else {
          addTestResult('auto-enrollment', 'error', 'Automatic enrollment did not trigger')
        }
      }, 2000)

    } catch (error: any) {
      addTestResult('test-user', 'error', `Test user creation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enrollment System Test Suite</h1>
          <p className="text-gray-600 mb-6">Test the automatic enrollment system and verify all components are working correctly.</p>
          
          <div className="flex gap-4">
            <button
              onClick={runEnrollmentTests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Run System Tests
            </button>
            
            <button
              onClick={createTestUser}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <User className="w-4 h-4" />
              Create Test User
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">View Data</summary>
                        <pre className="text-xs text-gray-500 mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollment Status Component Test */}
        {testUserId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Status Component Test</h2>
            <EnrollmentStatus userId={testUserId} />
          </div>
        )}

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Automatic Enrollment</h3>
              </div>
              <p className="text-sm text-blue-700">
                When a student signs up, if their email is in the whitelist, they are automatically enrolled in the specified track and cohort.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Week Progress</h3>
              </div>
              <p className="text-sm text-green-700">
                Week progress records are automatically created for enrolled students, with the first week set to 'pending' and others 'locked'.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Whitelist System</h3>
              </div>
              <p className="text-sm text-purple-700">
                Only users with active whitelist entries can be automatically enrolled. The system checks email, track, and cohort combinations.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900">Manual Enrollment</h3>
              </div>
              <p className="text-sm text-orange-700">
                The system includes a function to manually enroll existing whitelisted users who weren't automatically enrolled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}