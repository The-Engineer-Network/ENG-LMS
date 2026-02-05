"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, LogIn, ArrowLeft, AlertCircle, User, Shield } from "lucide-react"
import { signIn } from "../../lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log('Attempting login for:', email)
      const { data, error: signInError } = await signIn(email, password)
      
      console.log('Login page received data:', { data, error: signInError })
      console.log('data?.user exists:', !!data?.user)
      console.log('data.user details:', data?.user)
      
      if (signInError) {
        console.error('SignIn error:', signInError)
        throw signInError
      }
      
      if (data?.user) {
        console.log('User signed in:', data.user.id, data.user.email)
        
        // Get user profile to determine role using direct HTTP fetch
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!url || !key) {
            throw new Error('Missing Supabase credentials')
          }
          
          const profileRes = await fetch(
            `${url}/rest/v1/profiles?id=eq.${data.user.id}&select=role`,
            {
              headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
              }
            }
          )
          
          const profiles = await profileRes.json()
          const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null
          
          console.log('Profile lookup result:', profile)

          // If profile exists, use the role
          if (profile?.role) {
            console.log('User role:', profile.role)
            if (profile.role === 'admin') {
              console.log('Redirecting to admin dashboard')
              router.push("/admin/dashboard")
            } else {
              console.log('Redirecting to student dashboard')
              router.push("/student/dashboard")
            }
          } else {
            console.log('No profile found, creating one')
            // If no profile exists, create one
            const role = data.user.email?.includes('admin') ? 'admin' : 'student'
            
            // Try to create missing profile
            const createRes = await fetch(`${url}/rest/v1/profiles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
                role: role
              })
            })

            // If profile already exists (409 conflict), that's fine - just proceed
            if (!createRes.ok && createRes.status !== 409) {
              console.error('Error creating profile:', await createRes.text())
              setError("Error setting up user profile. Please contact support.")
              setLoading(false)
              return
            }
            
            console.log('Profile created or already exists, redirecting...')
            if (role === 'admin') {
              router.push("/admin/dashboard")
            } else {
              router.push("/student/dashboard")
            }
          }
        } catch (profileError: any) {
          console.error('Profile lookup error:', profileError)
          setError("Error accessing user profile. Please try again.")
          setLoading(false)
          return
        }
      } else {
        console.error('No user data returned from signIn')
        console.error('Full data object:', data)
        setError("Login failed. Please check your credentials.")
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || "Invalid email or password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-8">
      <Link
        href="/"
        className="absolute top-4 md:top-6 left-4 md:left-6 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border transition-all group flex items-center gap-2 text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium hidden sm:inline">Back</span>
      </Link>

      <div className="w-full max-w-md animate-slideInUp">
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <GraduationCap className="w-7 h-7 md:w-9 md:h-9 text-background" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">ENG-Basecamp</h1>
          <p className="text-foreground/60 mt-1 text-sm md:text-base">Sign in to your account</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex rounded-lg bg-card border border-border p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'student'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <User className="w-4 h-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instructor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'instructor'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Instructor
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-accent/10 border border-accent/20 flex gap-3 animate-fadeInScale">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
            <input
              type="email"
              placeholder={activeTab === 'student' ? 'Student Email' : 'Instructor Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing In..." : `Sign In as ${activeTab === 'student' ? 'Student' : 'Instructor'}`}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
          <p className="text-xs text-foreground/70 text-center">
            {activeTab === 'student' 
              ? "Students: Use the email you registered with during signup"
              : "Instructors: Use your admin credentials provided by the system administrator"
            }
          </p>
        </div>

        {/* Link */}
        {activeTab === 'student' && (
          <p className="text-center text-foreground/60 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-secondary transition-colors font-semibold">
              Sign Up
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
